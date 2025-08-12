@echo off
echo 正在运行蛇币NFT合约测试...
npx hardhat test
if %errorlevel% equ 0 (
    echo 测试成功！
) else (
    echo 测试失败，错误代码: %errorlevel%
)
pause
