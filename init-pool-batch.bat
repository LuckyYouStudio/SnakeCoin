@echo off
echo ========================================
echo        分批初始化NFT池
echo ========================================
echo.
echo 正在分批初始化NFT池...
npx hardhat run scripts/init-pool-batch.js --network localhost
echo.
echo 初始化完成！
pause
