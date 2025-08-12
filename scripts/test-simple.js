const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 蛇币NFT抽奖合约简化测试");
    console.log("=====================================");
    
    // 使用已部署的合约地址
    const CONTRACT_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
    
    // 获取签名者
    const [deployer] = await ethers.getSigners();
    console.log("测试账户:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    
    // 连接到合约
    const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
    const snakeCoin = SnakeCoin.attach(CONTRACT_ADDRESS);
    
    console.log("\n📋 合约信息:");
    console.log("合约地址:", CONTRACT_ADDRESS);
    console.log("合约名称:", await snakeCoin.name());
    console.log("合约符号:", await snakeCoin.symbol());
    
    // 获取抽奖信息
    const lotteryInfo = await snakeCoin.getLotteryInfo();
    console.log("\n🎯 抽奖信息:");
    console.log("抽奖价格:", ethers.formatEther(lotteryInfo.price), "ETH");
    console.log("池子大小:", lotteryInfo.poolSize.toString());
    console.log("已铸造数量:", lotteryInfo.totalMinted.toString());
    console.log("剩余数量:", lotteryInfo.remaining.toString());
    
    // 测试SVG生成
    console.log("\n🎨 测试SVG生成:");
    try {
        const svg = await snakeCoin.generateSnakeSVG(0);
        console.log("✅ SVG生成成功，长度:", svg.length);
        console.log("SVG包含svg标签:", svg.includes("<svg"));
    } catch (error) {
        console.log("❌ SVG生成失败:", error.message);
    }
    
    // 测试颜色和路径配置
    console.log("\n🎨 颜色配置:");
    for (let i = 0; i < 5; i++) {
        const color = await snakeCoin.colors(i);
        console.log(`颜色[${i}]: ${color}`);
    }
    
    console.log("\n🐍 路径配置:");
    for (let i = 0; i < 5; i++) {
        const path = await snakeCoin.snakePaths(i);
        console.log(`路径[${i}]: ${path.substring(0, 30)}...`);
    }
    
    // 测试管理功能
    console.log("\n🔧 测试管理功能:");
    try {
        const owner = await snakeCoin.owner();
        console.log("合约所有者:", owner);
        console.log("当前账户是否为所有者:", owner === deployer.address ? "✅" : "❌");
        
        if (owner === deployer.address) {
            console.log("可以执行管理操作");
        }
    } catch (error) {
        console.log("❌ 获取所有者失败:", error.message);
    }
    
    console.log("\n💡 测试完成!");
    console.log("合约地址:", CONTRACT_ADDRESS);
    console.log("\n下一步可以:");
    console.log("1. 手动初始化池子 (需要大量gas)");
    console.log("2. 测试NFT生成功能");
    console.log("3. 测试抽奖功能");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("测试失败:", error);
        process.exit(1);
    });
