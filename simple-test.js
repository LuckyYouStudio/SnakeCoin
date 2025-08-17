// 简单测试合约部署状态
async function main() {
    const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    
    // 检查合约代码
    const code = await hre.ethers.provider.getCode(contractAddress);
    console.log("合约代码长度:", code.length);
    
    if (code === "0x" || code === "0x0") {
        console.log("❌ 合约未部署或地址错误");
        return;
    }
    
    console.log("✅ 合约已部署");
    
    // 获取网络信息
    const network = await hre.ethers.provider.getNetwork();
    console.log("网络信息:", network);
    
    // 获取最新区块
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log("最新区块:", blockNumber);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });