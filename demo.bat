@echo off
echo ========================================
echo           蛇币NFT合约演示
echo ========================================
echo.
echo 1. 编译合约...
npx hardhat compile
echo.
echo 2. 启动本地网络...
start powershell -ArgumentList "-Command", "npx hardhat node"
timeout /t 5 /nobreak >nul
echo.
echo 3. 部署合约...
npx hardhat run scripts/deploy.js --network localhost
echo.
echo 4. 演示完成！
echo 请查看上面的输出信息
echo.
pause
