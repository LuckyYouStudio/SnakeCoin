@echo off
echo ========================================
echo        蛇币NFT合约简化测试
echo ========================================
echo.
echo 正在运行简化测试...
npx hardhat run scripts/test-simple.js --network localhost
echo.
echo 测试完成！
pause
