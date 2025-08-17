const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    console.log("🔍 调试NFT池状态...");
    console.log("合约地址:", contractAddress);
    
    try {
        // 获取合约实例
        const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
        const contract = SnakeCoin.attach(contractAddress);
        
        // 检查基本信息
        const poolSize = await contract.getPoolSize();
        const totalSupply = await contract.totalSupply();
        const maxSupply = await contract.MAX_SUPPLY();
        
        console.log("\n📊 基本信息:");
        console.log("池子大小:", poolSize.toString());
        console.log("总供应量:", totalSupply.toString());
        console.log("最大供应量:", maxSupply.toString());
        
        // 检查池子中的前几个ID
        console.log("\n🔍 检查池子内容 (前10个位置):");
        for (let i = 0; i < Math.min(10, Number(poolSize)); i++) {
            try {
                // 这里我们无法直接访问_idPool，但可以尝试其他方法
                console.log(`位置 ${i}: 无法直接访问（私有变量）`);
            } catch (error) {
                console.log(`位置 ${i}: 错误 -`, error.message);
            }
        }
        
        // 尝试模拟抽奖调用
        console.log("\n🎲 模拟抽奖调用:");
        try {
            const [signer] = await ethers.getSigners();
            const price = await contract.lotteryPrice();
            
            // 使用 callStatic 来模拟调用而不实际执行
            await contract.connect(signer).playLottery.staticCall({ value: price });
            console.log("✅ 抽奖调用模拟成功");
        } catch (error) {
            console.log("❌ 抽奖调用模拟失败:", error.message);
            
            // 检查具体的revert原因
            if (error.message.includes("No NFTs available")) {
                console.log("📝 错误原因: 池子中没有可用的NFT");
                
                // 检查是否是池子初始化问题
                console.log("\n🔧 尝试诊断池子状态...");
                
                // 获取owner地址
                const owner = await contract.owner();
                console.log("合约拥有者:", owner);
                
                const signerAddress = await signer.getAddress();
                console.log("当前签名者:", signerAddress);
                
                if (owner.toLowerCase() === signerAddress.toLowerCase()) {
                    console.log("✅ 当前签名者是合约拥有者，可以尝试重新填充池子");
                    
                    // 但是由于合约要求poolSize == 0才能重新填充，我们需要特殊处理
                    if (Number(poolSize) > 0) {
                        console.log("⚠️  池子大小 > 0，无法使用 refillPool() 方法");
                        console.log("💡 建议：重新部署合约或修改合约逻辑");
                    }
                } else {
                    console.log("❌ 当前签名者不是合约拥有者");
                }
            }
        }
        
    } catch (error) {
        console.error("❌ 调试失败:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });