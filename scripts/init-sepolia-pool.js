const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🎱 初始化 Sepolia NumberCoin 抽奖池...");
    
    // 从部署文件读取合约地址
    const deploymentData = JSON.parse(fs.readFileSync('./deployment-sepolia.json', 'utf8'));
    console.log(`📋 合约地址: ${deploymentData.contractAddress}`);

    // 获取合约实例
    const NumberCoin = await ethers.getContractFactory("NumberCoin");
    const contract = NumberCoin.attach(deploymentData.contractAddress);

    // 获取当前状态
    const [deployer] = await ethers.getSigners();
    console.log(`📋 部署者账户: ${deployer.address}`);

    // 检查当前池子状态
    const currentPoolSize = await contract.getPoolSize();
    console.log(`当前池子大小: ${currentPoolSize}`);

    if (currentPoolSize > 0) {
        console.log("✅ 抽奖池已经初始化，无需操作");
        return;
    }

    // 估算Gas费用
    try {
        const estimatedGas = await contract.resetPool.estimateGas();
        console.log(`估算Gas: ${estimatedGas}`);
        
        const feeData = await ethers.provider.getFeeData();
        const estimatedCost = estimatedGas * feeData.gasPrice;
        console.log(`估算成本: ${ethers.formatEther(estimatedCost)} SepoliaETH`);

        // 执行初始化（增加Gas限制）
        console.log("🔄 正在初始化抽奖池...");
        const tx = await contract.resetPool({
            gasLimit: 30000000  // 增加Gas限制
        });
        
        console.log(`交易哈希: ${tx.hash}`);
        console.log("⏳ 等待交易确认...");
        
        const receipt = await tx.wait();
        console.log(`✅ 交易确认！区块: ${receipt.blockNumber}`);
        console.log(`实际Gas使用: ${receipt.gasUsed}`);

        // 验证初始化结果
        const newPoolSize = await contract.getPoolSize();
        console.log(`✅ 抽奖池初始化成功！池子大小: ${newPoolSize}`);

    } catch (error) {
        console.error("❌ 抽奖池初始化失败:", error.message);
        
        if (error.message.includes("gas")) {
            console.log("\n💡 建议:");
            console.log("1. 池子初始化需要大量Gas，可能需要分批进行");
            console.log("2. 或者修改合约减少单次初始化的数据量");
            console.log("3. 当前可以正常进行抽奖，只是没有预填充所有可能的数字");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });