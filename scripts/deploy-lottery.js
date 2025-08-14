const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署蛇币NFT抽奖合约...");
    
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    
    // 部署合约
    const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
    const snakeCoin = await SnakeCoin.deploy();
    await snakeCoin.waitForDeployment();
    
    const contractAddress = await snakeCoin.getAddress();
    console.log("🐍 蛇币NFT抽奖合约已部署到:", contractAddress);
    
    // 注意：池子初始化已延迟，部署后需要手动调用 refillPoolBatch() 来初始化
    console.log("\n🏊 注意：池子初始化已延迟");
    console.log("部署完成后，请运行以下命令来初始化池子：");
    console.log("npx hardhat run scripts/init-pool-batch.js --network localhost");
    
    // 验证部署
    console.log("\n📋 合约信息:");
    console.log("合约名称:", await snakeCoin.name());
    console.log("合约符号:", await snakeCoin.symbol());
    console.log("抽奖价格:", ethers.formatEther(await snakeCoin.lotteryPrice()), "ETH");
    console.log("池子大小:", (await snakeCoin.getPoolSize()).toString());
    
    console.log("\n🎯 部署完成!");
    console.log("合约地址:", contractAddress);
    console.log("\n💡 下一步:");
    console.log("1. 运行: npx hardhat run scripts/init-pool-batch.js --network localhost");
    console.log("2. 初始化完成后即可开始抽奖");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("部署失败:", error);
        process.exit(1);
    });
