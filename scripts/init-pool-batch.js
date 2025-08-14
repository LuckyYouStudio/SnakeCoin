const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
    
    console.log("🏊 分批初始化NFT池...");
    console.log("合约地址:", contractAddress);
    
    try {
        // 获取合约实例
        const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
        const contract = SnakeCoin.attach(contractAddress);
        
        // 检查当前池子大小
        const currentPoolSize = await contract.getPoolSize();
        console.log("当前池子大小:", currentPoolSize.toString());
        
        if (currentPoolSize > 0) {
            console.log("✅ 池子已经初始化过了");
            return;
        }
        
        // 使用分批初始化，每批100个
        const batchSize = 100;
        console.log(`正在分批初始化池子，每批${batchSize}个...`);
        
        const tx = await contract.refillPoolBatch(batchSize);
        console.log("交易哈希:", tx.hash);
        
        // 等待交易确认
        const receipt = await tx.wait();
        console.log("交易确认，区块号:", receipt.blockNumber);
        
        // 检查池子大小
        const newPoolSize = await contract.getPoolSize();
        console.log("✅ 池子初始化完成！新池子大小:", newPoolSize.toString());
        
        // 检查抽奖价格
        const price = await contract.lotteryPrice();
        console.log("抽奖价格:", ethers.formatEther(price), "ETH");
        
    } catch (error) {
        console.error("❌ 分批初始化池子失败:", error.message);
        
        // 如果分批初始化还是失败，尝试更小的批次
        if (error.message.includes("out of gas")) {
            console.log("\n🔄 尝试更小的批次...");
            
            // 尝试多个小批次
            const batchSizes = [25, 10, 5];
            
            for (const batchSize of batchSizes) {
                try {
                    console.log(`\n尝试每批${batchSize}个...`);
                    
                    const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
                    const contract = SnakeCoin.attach(contractAddress);
                    
                    const tx = await contract.refillPoolBatch(batchSize);
                    console.log("交易哈希:", tx.hash);
                    
                    const receipt = await tx.wait();
                    console.log("交易确认，区块号:", receipt.blockNumber);
                    
                    const newPoolSize = await contract.getPoolSize();
                    console.log("✅ 小批次初始化成功！池子大小:", newPoolSize.toString());
                    
                    // 如果成功了，跳出循环
                    break;
                    
                } catch (smallError) {
                    console.error(`❌ 每批${batchSize}个也失败了:`, smallError.message);
                    
                    // 如果是最后一个尝试，给出建议
                    if (batchSize === 5) {
                        console.log("\n💡 建议：");
                        console.log("1. 减少合约中的 MAX_SUPPLY 到更小的值（如1,000）");
                        console.log("2. 或者使用更小的批次大小");
                    }
                }
            }
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
