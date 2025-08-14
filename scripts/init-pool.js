const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
    
    console.log("🏊 初始化NFT池...");
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
        
        // 初始化池子
        console.log("正在初始化池子...");
        const tx = await contract.refillPool();
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
        console.error("❌ 初始化池子失败:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
