@echo off
echo ========================================
echo        检查合约状态
echo ========================================
echo.
echo 正在检查合约状态...
npx hardhat run scripts/check-contract.js --network localhost
echo.
echo 检查完成！
pause