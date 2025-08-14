@echo off
echo ========================================
echo        启动HTTP服务器
echo ========================================
echo.
echo 正在启动HTTP服务器...
echo 服务器地址: http://localhost:8080
echo.
echo 请在浏览器中访问:
echo http://localhost:8080/demo/lottery-real.html
echo.
echo 按Ctrl+C停止服务器
echo.
python -m http.server 8080
pause
