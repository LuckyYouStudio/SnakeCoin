@echo off
echo ========================================
echo           部署蛇币NFT合约
echo ========================================
echo.
echo 正在部署到本地网络...
npx hardhat run scripts/deploy.js --network localhost
echo.
echo 部署完成！
pause
