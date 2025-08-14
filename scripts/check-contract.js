const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
    
    console.log("🔍 检查合约状态...");
    console.log("合约地址:", contractAddress);
    
    try {
        // 获取合约实例
        const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
        const contract = SnakeCoin.attach(contractAddress);
        
        // 检查基本信息
        console.log("\n📊 合约基本信息:");
        
        try {
            const price = await contract.lotteryPrice();
            console.log("抽奖价格:", ethers.formatEther(price), "ETH");
        } catch (e) {
            console.log("❌ 无法获取抽奖价格:", e.message);
        }
        
        try {
            const poolSize = await contract.getPoolSize();
            console.log("池子大小:", poolSize.toString());
        } catch (e) {
            console.log("❌ 无法获取池子大小:", e.message);
        }
        
        try {
            const totalSupply = await contract.totalSupply();
            console.log("总供应量:", totalSupply.toString());
        } catch (e) {
            console.log("❌ 无法获取总供应量:", e.message);
        }
        
        // 检查合约代码
        const code = await ethers.provider.getCode(contractAddress);
        if (code === "0x") {
            console.log("\n❌ 合约地址上没有代码！");
        } else {
            console.log("\n✅ 合约代码存在");
            console.log("代码长度:", code.length - 2, "字节");
        }
        
    } catch (error) {
        console.error("❌ 检查合约失败:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
