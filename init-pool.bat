@echo off
echo ========================================
echo        初始化NFT池
echo ========================================
echo.
echo 正在初始化NFT池...
npx hardhat run scripts/init-pool.js --network localhost
echo.
echo 初始化完成！
pause
