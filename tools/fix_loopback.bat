@echo off
echo ==============================================
echo   Minecraft Loopback Exemption Setup
echo ==============================================
echo.
echo Running CheckNetIsolation by Name...
CheckNetIsolation.exe LoopbackExempt -a -n="Microsoft.MinecraftUWP_8wekyb3d8bbwe"
CheckNetIsolation.exe LoopbackExempt -a -n="Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe"

echo.
echo Running CheckNetIsolation by SID (for GDK Build / Xbox App)...
CheckNetIsolation.exe LoopbackExempt -a -p=S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436
CheckNetIsolation.exe LoopbackExempt -a -p=S-1-15-2-424268864-5579737-879501358-346833251-474568803-887069379-4040235476

echo.
echo ==============================================
echo   Configuring Windows Firewall Channel
echo ==============================================
echo.
echo Allowing bedrock_server.exe through Windows Defender Firewall...
netsh advfirewall firewall add rule name="Minecraft BDS Server Inbound" dir=in action=allow program="c:\Users\a0900\.gemini\antigravity-ide\scratch\my_minecraft_addon\bds_server\bedrock_server.exe" enable=yes profile=any
netsh advfirewall firewall add rule name="Minecraft BDS Server Outbound" dir=out action=allow program="c:\Users\a0900\.gemini\antigravity-ide\scratch\my_minecraft_addon\bds_server\bedrock_server.exe" enable=yes profile=any

echo.
echo ==============================================
echo Setup applied successfully!
echo Please fully restart Minecraft for changes to take effect.
echo ==============================================
echo.
pause
