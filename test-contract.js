// 测试合约连接和基本功能
const { ethers } = require("hardhat");

async function testContract() {
    console.log("=== 开始测试合约连接功能 ===");
    
    // 合约地址（从部署输出中获取）
    const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    
    try {
        // 获取合约实例
        const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
        const snakeCoin = SnakeCoin.attach(contractAddress);
        
        console.log("✅ 合约连接成功");
        console.log("合约地址:", contractAddress);
        
        // 测试基本信息
        const name = await snakeCoin.name();
        const symbol = await snakeCoin.symbol();
        const totalSupply = await snakeCoin.totalSupply();
        const lotteryPrice = await snakeCoin.lotteryPrice();
        
        console.log("\n=== 合约基本信息 ===");
        console.log("合约名称:", name);
        console.log("合约符号:", symbol);
        console.log("当前供应量:", totalSupply.toString());
        console.log("抽奖价格:", ethers.utils.formatEther(lotteryPrice), "ETH");
        
        // 测试池子大小
        try {
            const poolSize = await snakeCoin.getPoolSize();
            console.log("池子大小:", poolSize.toString());
        } catch (error) {
            console.log("获取池子大小失败:", error.message);
        }
        
        // 测试最大供应量
        try {
            const maxSupply = await snakeCoin.MAX_SUPPLY();
            console.log("最大供应量:", maxSupply.toString());
        } catch (error) {
            console.log("获取最大供应量失败:", error.message);
        }
        
        // 测试SVG生成（如果有NFT）
        if (totalSupply.gt(0)) {
            console.log("\n=== 测试SVG生成 ===");
            try {
                const svg = await snakeCoin.generateSnakeSVG(0);
                console.log("Token #0 SVG长度:", svg.length);
                console.log("SVG开头:", svg.substring(0, 100));
            } catch (error) {
                console.log("生成SVG失败:", error.message);
            }
        }
        
        console.log("\n✅ 合约测试完成！");
        
    } catch (error) {
        console.error("❌ 合约测试失败:", error.message);
    }
}

// 运行测试
testContract()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });