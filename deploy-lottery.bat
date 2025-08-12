@echo off
echo ========================================
echo        部署蛇币NFT抽奖合约
echo ========================================
echo.
echo 正在部署抽奖版合约到本地网络...
npx hardhat run scripts/deploy-lottery.js --network localhost
echo.
echo 部署完成！
pause
