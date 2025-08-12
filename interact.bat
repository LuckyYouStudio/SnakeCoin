@echo off
echo ========================================
echo           与蛇币NFT合约交互
echo ========================================
echo.
echo 合约地址: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
echo.
echo 正在运行交互脚本...
npx hardhat run scripts/interact.js --network localhost
echo.
echo 交互完成！
pause
