import { world, system } from "@minecraft/server";
import { http, HttpRequest, HttpRequestMethod, HttpHeader } from "@minecraft/server-net";

const HTTP_BRIDGE_URL = "http://127.0.0.1:24446/api/bds";
const WS_BRIDGE_URL = "ws://127.0.0.1:24446/ws/bds";
const WS_TOKEN = "coffee_secret_2026";
const ENV_TAG = "dev";

let activeWsClient = null;
let isWsConnected = false;
let lastSentMsg = "";
let lastSentTime = 0;

// ==========================================
// 1. WebSocket 原生事件驅動長連線機制
// ==========================================
function initWebSocketBridge() {
  if (typeof http.websocket !== "undefined" && typeof http.websocket.connect === "function") {
    console.warn("[ML_DC_BP] 嘗試建立 SAPI 原生 WebSocket 長連線...");
    http.websocket.connect(WS_BRIDGE_URL, [
      new HttpHeader("Authorization", WS_TOKEN)
    ]).then((client) => {
      activeWsClient = client;
      isWsConnected = true;
      console.warn("[ML_DC_BP] 🚀 WebSocket 長連線建立成功！(純事件驅動 0 輪詢)");

      // 監聽接收事件 (Discord -> 遊戲 純事件推播，符合官方 WebSocketClientAfterEvents 規範)
      const msgSignal = client.afterEvents.message || client.afterEvents.messageReceive;
      if (msgSignal && typeof msgSignal.subscribe === "function") {
        msgSignal.subscribe((evt) => {
          try {
            const data = JSON.parse(evt.message);
            if (data.type === "chat" && data.sender && data.message) {
              const text = `§9[Discord] §f<${data.sender}> ${data.message}`;
              try { world.sendMessage(text); } catch (e) {}
            }
          } catch (e) {}
        });
      }

      // 監聽離線事件
      if (client.afterEvents && client.afterEvents.close) {
        client.afterEvents.close.subscribe(() => {
          isWsConnected = false;
          activeWsClient = null;
          console.warn("[ML_DC_BP] ⚠️ WebSocket 連線斷開，5 秒後嘗試自動重連...");
          system.runTimeout(() => {
            initWebSocketBridge();
          }, 100);
        });
      }
    }).catch((err) => {
      isWsConnected = false;
      activeWsClient = null;
      console.warn("[ML_DC_BP] WebSocket 長連線失敗，啟動 HTTP 動態自適應通道");
    });
  } else {
    console.warn("[ML_DC_BP] 當前引擎環境無原生 WebSocketClient，自動啟用 HTTP 動態通道");
  }
}

// ==========================================
// 2. 數據傳輸 (優先 WebSocket，次選 HTTP)
// ==========================================
function sendPayload(payload) {
  payload.env = ENV_TAG;
  payload.token = WS_TOKEN;
  const jsonStr = JSON.stringify(payload);

  if (isWsConnected && activeWsClient && typeof activeWsClient.send === "function") {
    try {
      activeWsClient.send(jsonStr);
      return;
    } catch (e) {
      isWsConnected = false;
    }
  }

  // HTTP Fallback 備援發送
  try {
    const req = new HttpRequest(HTTP_BRIDGE_URL);
    req.method = HttpRequestMethod.Post;
    req.headers = [
      new HttpHeader("Content-Type", "application/json"),
      new HttpHeader("Authorization", WS_TOKEN)
    ];
    req.body = jsonStr;
    http.request(req).catch(() => {});
  } catch (e) {}
}

// ==========================================
// 3. 遊戲內事件訂閱 (Event-Driven)
// ==========================================
function handleChat(senderName, msgText) {
  const now = Date.now();
  if (msgText === lastSentMsg && (now - lastSentTime) < 1000) return;
  lastSentMsg = msgText;
  lastSentTime = now;

  sendPayload({
    type: "chat",
    sender: senderName,
    message: msgText
  });
}

try {
  if (world.beforeEvents && world.beforeEvents.chatSend) {
    world.beforeEvents.chatSend.subscribe((evt) => {
      handleChat(evt.sender.name, evt.message);
    });
  }
} catch (e) {}

try {
  world.afterEvents.playerSpawn.subscribe((evt) => {
    if (evt.initialSpawn) {
      sendPayload({
        type: "join",
        player: evt.player.name,
        onlineCount: world.getAllPlayers().length
      });
    }
  });
} catch (e) {}

try {
  world.afterEvents.playerLeave.subscribe((evt) => {
    sendPayload({
      type: "leave",
      player: evt.playerName,
      onlineCount: Math.max(0, world.getAllPlayers().length - 1)
    });
  });
} catch (e) {}

// 啟動橋接初始化
initWebSocketBridge();
console.warn("[ML_DC_BP] Discord 原生事件驅動橋接模組已載入 (v1.0.1)");
