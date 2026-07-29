import os
import json
import urllib.request
import struct
import hashlib
import base64
import socket
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

HOST = "127.0.0.1"
PORT = 24446
EXPECTED_TOKEN = "coffee_secret_2026"
WS_MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

def load_env_vars():
    env_vars = {}
    if os.path.exists(".env"):
        try:
            with open(".env", "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if "=" in line and not line.startswith("#"):
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip().strip('"').strip("'")
        except Exception:
            pass
    return env_vars

CONCH_BOT_WS_TOKEN = "coffee_secret_2026"
CONCH_BOT_WS_HOST = "36.50.249.102"
CONCH_BOT_WS_PORT = 24446

conch_ws_client_socket = None
conch_ws_lock = threading.Lock()

def start_conch_bot_client_thread():
    """Maintain persistent outbound WebSocket client connection to CS VPS Conch Bot with 15s Heartbeat"""
    def run_client():
        global conch_ws_client_socket
        while True:
            try:
                print(f"[CONCH WS] Connecting to CS VPS Conch Bot at ws://{CONCH_BOT_WS_HOST}:{CONCH_BOT_WS_PORT}...", flush=True)
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(8)
                s.connect((CONCH_BOT_WS_HOST, CONCH_BOT_WS_PORT))
                
                req = f"GET /?token={CONCH_BOT_WS_TOKEN} HTTP/1.1\r\nHost: {CONCH_BOT_WS_HOST}:{CONCH_BOT_WS_PORT}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\n\r\n"
                s.sendall(req.encode("utf-8"))
                
                resp = s.recv(1024).decode("utf-8", errors="ignore")
                if "101" in resp and "Switching Protocols" in resp:
                    print("[CONCH WS] Successfully connected & authenticated with CS VPS Conch Bot!", flush=True)
                    s.settimeout(None) # Blocking recv mode
                    with conch_ws_lock:
                        conch_ws_client_socket = s
                    
                    # Background Heartbeat thread (ping every 15s)
                    def heartbeat_loop(sock):
                        while sock == conch_ws_client_socket:
                            try:
                                hb_frame = make_ws_client_frame(json.dumps({"type": "heartbeat"}))
                                sock.sendall(hb_frame)
                            except Exception:
                                break
                            time.sleep(15)
                    
                    hb_thread = threading.Thread(target=heartbeat_loop, args=(s,), daemon=True)
                    hb_thread.start()

                    buffer = b""
                    while True:
                        data = s.recv(4096)
                        if not data:
                            break
                        buffer += data
                        while len(buffer) >= 2:
                            payload_len = buffer[1] & 127
                            header_len = 2
                            if payload_len == 126:
                                if len(buffer) < 4:
                                    break
                                payload_len = struct.unpack("!H", buffer[2:4])[0]
                                header_len = 4
                            elif payload_len == 127:
                                if len(buffer) < 10:
                                    break
                                payload_len = struct.unpack("!Q", buffer[2:10])[0]
                                header_len = 10
                            
                            if len(buffer) < header_len + payload_len:
                                break
                            
                            msg_bytes = buffer[header_len:header_len + payload_len]
                            buffer = buffer[header_len + payload_len:]
                            
                            try:
                                msg_str = msg_bytes.decode("utf-8", errors="ignore")
                                event = json.loads(msg_str)
                                if event.get("type") == "chat":
                                    sender = event.get("sender", "DiscordUser")
                                    msg = event.get("message", "")
                                    print(f"[CONCH -> GAME] Message from <{sender}>: {msg}", flush=True)
                                    broadcast_to_game(sender, msg)
                            except Exception:
                                pass
                else:
                    print(f"[CONCH WS] Handshake failed: {resp[:50]}", flush=True)
            except Exception as e:
                print(f"[CONCH WS] Reconnecting: {e}", flush=True)
            
            with conch_ws_lock:
                conch_ws_client_socket = None
            time.sleep(2)

    t = threading.Thread(target=run_client, daemon=True)
    t.start()

def make_ws_client_frame(message_str):
    data = message_str.encode('utf-8')
    length = len(data)
    mask_key = bytes([0x12, 0x34, 0x56, 0x78])
    masked_payload = bytes([data[i] ^ mask_key[i % 4] for i in range(length)])
    
    if length <= 125:
        header = bytes([0x81, 0x80 | length]) + mask_key
    elif length <= 65535:
        header = bytes([0x81, 0x80 | 126]) + struct.pack("!H", length) + mask_key
    else:
        header = bytes([0x81, 0x80 | 127]) + struct.pack("!Q", length) + mask_key
    return header + masked_payload

def forward_event_to_conch_ws(payload):
    global conch_ws_client_socket
    with conch_ws_lock:
        if conch_ws_client_socket:
            try:
                frame = make_ws_client_frame(json.dumps(payload))
                conch_ws_client_socket.sendall(frame)
                print(f"[CONCH WS] Successfully sent {payload.get('type')} event to CS VPS Conch Bot!", flush=True)
                return True
            except Exception as e:
                print(f"[CONCH WS] Failed to send via WS: {e}", flush=True)
                conch_ws_client_socket = None
    return False

def get_conch_bot_url():
    env_vars = load_env_vars()
    url = os.getenv("CONCH_BOT_API_URL") or env_vars.get("CONCH_BOT_API_URL")
    if not url:
        # Default CS VPS Host from sftp.json
        url = "http://36.50.249.102:24446/api/bot"
    return url

def get_webhook_url(env="dev"):
    env_vars = load_env_vars()
    env_clean = str(env).lower()
    
    if env_clean in ["dev", "development"]:
        url = os.getenv("DISCORD_WEBHOOK_URL_DEV") or env_vars.get("DISCORD_WEBHOOK_URL_DEV")
    elif env_clean in ["prod", "production", "release"]:
        url = os.getenv("DISCORD_WEBHOOK_URL_PROD") or env_vars.get("DISCORD_WEBHOOK_URL_PROD")
    else:
        url = None
        
    if not url:
        url = os.getenv("DISCORD_WEBHOOK_URL") or env_vars.get("DISCORD_WEBHOOK_URL", "")
    return url

def send_to_conch_bot(bot_url, payload):
    if not bot_url:
        return False
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        bot_url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Minecraft-BDS-Bridge",
            "Authorization": EXPECTED_TOKEN
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=3) as resp:
            print(f"[INFO] Successfully forwarded event to CS VPS Conch Bot ({bot_url})!", flush=True)
            return True
    except Exception as e:
        print(f"[WARN] Could not connect to CS VPS Conch Bot ({bot_url}): {e}", flush=True)
        return False

def send_to_discord(webhook_url, content_text=None, embed_data=None):
    if not webhook_url:
        return
    
    payload = {}
    if content_text:
        payload["content"] = content_text
    if embed_data:
        payload["embeds"] = [embed_data]
        
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        webhook_url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Minecraft-BDS-Bridge"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=3) as resp:
            print("[INFO] Successfully sent event notification to Discord Webhook!", flush=True)
    except Exception as e:
        print(f"[ERROR] Failed to send to Discord Webhook: {e}", flush=True)

def process_payload(payload):
    token = payload.get("token", "")
    msg_type = payload.get("type")
    env = payload.get("env", "dev")
    payload["channel_id"] = payload.get("channel_id", "1487482511876423700")
    
    # 直連 CS VPS 神奇嗨螺 Bot 本體 (不使用 Webhook 降級)
    ws_success = forward_event_to_conch_ws(payload)
    if not ws_success:
        print(f"[WARNING] Event {msg_type} could not be sent via Conch WS (WebSocket offline).", flush=True)

active_ws_sockets = []
ws_lock = threading.Lock()

def make_ws_frame(message_str):
    data = message_str.encode('utf-8')
    length = len(data)
    if length <= 125:
        header = bytes([0x81, length])
    elif length <= 65535:
        header = bytes([0x81, 126]) + struct.pack("!H", length)
    else:
        header = bytes([0x81, 127]) + struct.pack("!Q", length)
    return header + data

def broadcast_to_game(sender, message, channel_id="1487482511876423700"):
    payload = json.dumps({
        "type": "chat",
        "sender": sender,
        "message": message,
        "channel_id": channel_id
    })
    frame = make_ws_frame(payload)
    
    with ws_lock:
        to_remove = []
        for sock in active_ws_sockets:
            try:
                sock.sendall(frame)
            except Exception:
                to_remove.append(sock)
        for sock in to_remove:
            if sock in active_ws_sockets:
                active_ws_sockets.remove(sock)
    print(f"[DC -> GAME] Broadcast message from <{sender}> to Minecraft: {message}", flush=True)

def parse_ws_frame(data):
    if len(data) < 2:
        return None
    second_byte = data[1]
    is_masked = (second_byte & 0x80) != 0
    payload_len = second_byte & 0x7F
    
    offset = 2
    if payload_len == 126:
        if len(data) < 4:
            return None
        payload_len = struct.unpack("!H", data[2:4])[0]
        offset = 4
    elif payload_len == 127:
        if len(data) < 10:
            return None
        payload_len = struct.unpack("!Q", data[2:10])[0]
        offset = 10
        
    if is_masked:
        if len(data) < offset + 4:
            return None
        mask_keys = data[offset:offset+4]
        offset += 4
        raw_payload = data[offset:offset+payload_len]
        decoded = bytes([raw_payload[i] ^ mask_keys[i % 4] for i in range(len(raw_payload))])
    else:
        decoded = data[offset:offset+payload_len]
        
    try:
        return decoded.decode('utf-8', errors='ignore')
    except Exception:
        return None

class BridgeHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        # Handle WebSocket Handshake on /ws/bds
        if self.path == "/ws/bds" or self.path.startswith("/ws"):
            ws_key = self.headers.get("Sec-WebSocket-Key")
            if ws_key:
                sha1 = hashlib.sha1((ws_key + WS_MAGIC).encode('utf-8')).digest()
                accept_key = base64.b64encode(sha1).decode('utf-8')
                
                self.send_response(101, "Switching Protocols")
                self.send_header("Upgrade", "websocket")
                self.send_header("Connection", "Upgrade")
                self.send_header("Sec-WebSocket-Accept", accept_key)
                self.end_headers()
                
                sock = self.connection
                with ws_lock:
                    active_ws_sockets.append(sock)
                print(f"[WS] New BDS SAPI WebSocket Client Connected! (Total: {len(active_ws_sockets)})", flush=True)
                
                # Keep socket alive and process incoming WebSocket frames from BDS
                try:
                    while True:
                        data = sock.recv(4096)
                        if not data:
                            break
                        msg_str = parse_ws_frame(data)
                        if msg_str:
                            try:
                                payload = json.loads(msg_str)
                                process_payload(payload)
                            except Exception:
                                pass
                except Exception:
                    pass
                finally:
                    with ws_lock:
                        if sock in active_ws_sockets:
                            active_ws_sockets.remove(sock)
                    print("[WS] BDS Client Disconnected.", flush=True)
                return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(length) if length > 0 else b"{}"
        
        try:
            payload = json.loads(body_bytes.decode("utf-8"))
        except Exception:
            self.send_response(400)
            self.end_headers()
            return

        auth_header = self.headers.get("Authorization", "")
        token = payload.get("token") or auth_header
        if token != EXPECTED_TOKEN:
            self.send_response(401)
            self.end_headers()
            return

        # 1. 遊戲 -> Discord (BDS -> Discord Webhook)
        if self.path == "/api/bds":
            process_payload(payload)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode("utf-8"))
            return

        # 2. Discord -> 遊戲 (海螺機器人 / Discord Bot -> BDS 廣播)
        elif self.path == "/api/discord_message" or self.path == "/api/bot":
            sender = payload.get("sender", "DiscordUser")
            msg = payload.get("message", "")
            channel_id = payload.get("channel_id", "1487482511876423700")
            
            broadcast_to_game(sender, msg, channel_id)
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "broadcast_success"}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

def start_server():
    webhook = get_webhook_url()
    print("==========================================")
    print("[START] Event-Driven Bidirectional Discord Bridge Server (v1.2.0)")
    print(f"Listening on: http://{HOST}:{PORT}/api/bds, /api/discord_message & ws://{HOST}:{PORT}/ws/bds")
    print(f"Connecting Outbound WS to CS VPS Conch Bot: ws://{CONCH_BOT_WS_HOST}:{CONCH_BOT_WS_PORT}")
    print("==========================================")

    # Start background thread to maintain persistent WebSocket connection with CS VPS Conch Bot
    start_conch_bot_client_thread()

    server = HTTPServer((HOST, PORT), BridgeHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nBridge server stopped.")

if __name__ == "__main__":
    start_server()

