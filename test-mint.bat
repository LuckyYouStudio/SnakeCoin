@echo off
echo ========================================
echo        蛇币NFT铸造功能测试
echo ========================================
echo.
echo 正在测试NFT铸造功能...
npx hardhat run scripts/test-mint.js --network localhost
echo.
echo 测试完成！
pause
