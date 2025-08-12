@echo off
echo 正在编译蛇币NFT合约...
npx hardhat compile
if %errorlevel% equ 0 (
    echo 编译成功！
) else (
    echo 编译失败，错误代码: %errorlevel%
)
pause
