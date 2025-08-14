@echo off
echo ========================================
echo        测试抽奖功能
echo ========================================
echo.
echo 正在测试抽奖功能...
npx hardhat run scripts/test-lottery.js --network localhost
echo.
echo 测试完成！
pause
