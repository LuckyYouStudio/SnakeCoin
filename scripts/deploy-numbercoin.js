const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署 NumberCoin 合约...");
    
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    
    try {
        // 部署 NumberCoin 合约
        console.log("\n📋 部署 NumberCoin 合约...");
        const NumberCoin = await ethers.getContractFactory("NumberCoin");
        const numberCoin = await NumberCoin.deploy();
        
        // 等待部署完成
        await numberCoin.waitForDeployment();
        const contractAddress = await numberCoin.getAddress();
        
        console.log("✅ NumberCoin 合约部署成功！");
        console.log("合约地址:", contractAddress);
        
        // 验证部署
        console.log("\n🔍 验证合约部署...");
        const code = await ethers.provider.getCode(contractAddress);
        if (code === "0x") {
            throw new Error("合约代码为空，部署失败");
        }
        console.log("✅ 合约代码验证成功，代码长度:", code.length);
        
        // 获取合约信息
        console.log("\n📊 合约信息:");
        console.log("名称:", await numberCoin.name());
        console.log("符号:", await numberCoin.symbol());
        console.log("最大供应量:", (await numberCoin.MAX_SUPPLY()).toString());
        console.log("抽奖价格:", ethers.formatEther(await numberCoin.lotteryPrice()), "ETH");
        console.log("当前池子大小:", (await numberCoin.getPoolSize()).toString());
        
        // 初始化池子
        console.log("\n🎱 初始化抽奖池...");
        const initTx = await numberCoin.initializePool();
        await initTx.wait();
        console.log("✅ 抽奖池初始化完成");
        console.log("池子大小:", (await numberCoin.getPoolSize()).toString());
        
        // 输出部署结果
        console.log("\n🎉 部署完成！");
        console.log("=".repeat(50));
        console.log("NumberCoin 合约地址:", contractAddress);
        console.log("网络:", (await ethers.provider.getNetwork()).name);
        console.log("区块高度:", await ethers.provider.getBlockNumber());
        console.log("=".repeat(50));
        
        // 保存部署信息到文件
        const fs = require('fs');
        const deploymentInfo = {
            contractName: "NumberCoin",
            contractAddress: contractAddress,
            deployerAddress: deployer.address,
            network: (await ethers.provider.getNetwork()).name,
            blockNumber: await ethers.provider.getBlockNumber(),
            deploymentTime: new Date().toISOString(),
            maxSupply: (await numberCoin.MAX_SUPPLY()).toString(),
            lotteryPrice: ethers.formatEther(await numberCoin.lotteryPrice()),
            initialPoolSize: (await numberCoin.getPoolSize()).toString()
        };
        
        fs.writeFileSync(
            'deployment-numbercoin.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );
        console.log("📄 部署信息已保存到 deployment-numbercoin.json");
        
        return contractAddress;
        
    } catch (error) {
        console.error("❌ 部署失败:", error.message);
        console.error("错误详情:", error);
        process.exit(1);
    }
}

main()
    .then((address) => {
        console.log(`\n🎯 请将合约地址 ${address} 更新到前端代码中`);
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });