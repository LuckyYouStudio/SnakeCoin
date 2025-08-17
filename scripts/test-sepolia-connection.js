const { ethers } = require("hardhat");

async function main() {
    console.log("🔗 测试 Sepolia 网络连接...");
    
    try {
        // 获取网络信息
        const network = await ethers.provider.getNetwork();
        console.log(`✅ 网络连接成功: ${network.name} (Chain ID: ${network.chainId})`);
        
        // 检查是否是 Sepolia
        if (network.chainId !== 11155111n) {
            console.error(`❌ 错误的网络！期望 Sepolia (11155111)，实际: ${network.chainId}`);
            return;
        }
        
        // 获取部署账户
        const [deployer] = await ethers.getSigners();
        console.log(`📋 部署账户: ${deployer.address}`);
        
        // 检查余额
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log(`💰 账户余额: ${ethers.formatEther(balance)} SepoliaETH`);
        
        if (balance === 0n) {
            console.warn("⚠️ 账户余额为0！请从水龙头获取 SepoliaETH:");
            console.log("   - https://sepoliafaucet.com/");
            console.log("   - https://faucets.chain.link/sepolia");
        } else if (ethers.parseEther("0.01") > balance) {
            console.warn("⚠️ 账户余额可能不足，建议至少有 0.01 SepoliaETH");
        } else {
            console.log("✅ 账户余额充足，可以进行部署");
        }
        
        // 获取当前Gas价格
        const feeData = await ethers.provider.getFeeData();
        console.log(`⛽ 当前Gas价格: ${ethers.formatUnits(feeData.gasPrice, "gwei")} Gwei`);
        
        // 获取最新区块
        const latestBlock = await ethers.provider.getBlockNumber();
        console.log(`📦 最新区块: ${latestBlock}`);
        
        console.log("\n🎉 Sepolia 网络连接测试成功！可以开始部署。");
        
    } catch (error) {
        console.error("❌ 网络连接失败:", error.message);
        console.log("\n🔧 请检查:");
        console.log("1. .env 文件中的 RPC_URL 是否正确");
        console.log("2. 网络连接是否正常");
        console.log("3. Infura/Alchemy 项目ID是否有效");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });