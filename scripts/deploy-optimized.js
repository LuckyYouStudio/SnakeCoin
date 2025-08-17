const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 部署优化版 NumberCoinOptimized 合约...");
    
    // 获取部署账户信息
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);
    
    // 检查账户余额
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`账户余额: ${ethers.formatEther(balance)} ETH`);
    
    // 获取网络信息
    const network = await ethers.provider.getNetwork();
    console.log(`网络: ${network.name} (Chain ID: ${network.chainId})`);
    
    // 部署合约
    console.log("\n📋 部署 NumberCoinOptimized 合约...");
    const NumberCoinOptimized = await ethers.getContractFactory("NumberCoinOptimized");
    
    // 估算部署Gas费用
    const deploymentData = NumberCoinOptimized.interface.encodeDeploy([]);
    const estimatedGas = await ethers.provider.estimateGas({
        data: deploymentData
    });
    
    const feeData = await ethers.provider.getFeeData();
    const estimatedCost = estimatedGas * feeData.gasPrice;
    
    console.log(`估算部署Gas: ${estimatedGas}`);
    console.log(`估算Gas价格: ${ethers.formatUnits(feeData.gasPrice, "gwei")} Gwei`);
    console.log(`估算部署成本: ${ethers.formatEther(estimatedCost)} ETH`);
    
    // 部署合约
    const contract = await NumberCoinOptimized.deploy();
    console.log(`✅ 部署交易已发送，交易哈希: ${contract.deploymentTransaction().hash}`);
    console.log("⏳ 等待合约部署确认...");
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`✅ NumberCoinOptimized 合约部署成功！`);
    console.log(`合约地址: ${contractAddress}`);
    
    // 获取部署区块信息
    const deploymentTx = await ethers.provider.getTransaction(contract.deploymentTransaction().hash);
    const deploymentReceipt = await ethers.provider.getTransactionReceipt(contract.deploymentTransaction().hash);
    
    console.log(`区块高度: ${deploymentReceipt.blockNumber}`);
    console.log(`实际Gas使用: ${deploymentReceipt.gasUsed}`);
    console.log(`实际部署成本: ${ethers.formatEther(deploymentReceipt.gasUsed * deploymentTx.gasPrice)} ETH`);
    
    // 验证合约部署
    console.log("\n🔍 验证合约部署...");
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
        throw new Error("❌ 合约部署失败，合约地址没有代码");
    }
    console.log(`✅ 合约代码验证成功，代码长度: ${code.length}`);
    
    // 测试合约功能
    console.log("\n📊 测试合约基本功能...");
    try {
        const name = await contract.name();
        const symbol = await contract.symbol();
        const maxSupply = await contract.MAX_SUPPLY();
        const lotteryPrice = await contract.lotteryPrice();
        const totalSupply = await contract.totalSupply();
        const remaining = await contract.remainingSupply();
        
        console.log(`合约名称: ${name}`);
        console.log(`合约符号: ${symbol}`);
        console.log(`最大供应量: ${maxSupply}`);
        console.log(`抽奖价格: ${ethers.formatEther(lotteryPrice)} ETH`);
        console.log(`当前铸造: ${totalSupply}`);
        console.log(`剩余数量: ${remaining}`);
        
        console.log("✅ 合约功能测试通过");
    } catch (error) {
        console.error("❌ 合约功能测试失败:", error.message);
    }
    
    // 对比Gas使用情况
    console.log("\n⚡ Gas使用对比:");
    console.log(`- 优化版部署Gas: ${deploymentReceipt.gasUsed}`);
    console.log(`- 原版估算Gas: ~2,545,966`);
    const gasUsedNum = Number(deploymentReceipt.gasUsed);
    console.log(`- Gas节省: ${((2545966 - gasUsedNum) / 2545966 * 100).toFixed(1)}%`);
    
    // 保存部署信息
    const deploymentInfo = {
        contractName: "NumberCoinOptimized",
        contractAddress: contractAddress,
        deployerAddress: deployer.address,
        network: network.name,
        chainId: Number(network.chainId),
        blockNumber: deploymentReceipt.blockNumber,
        transactionHash: contract.deploymentTransaction().hash,
        deploymentTime: new Date().toISOString(),
        gasUsed: deploymentReceipt.gasUsed.toString(),
        gasCost: ethers.formatEther(deploymentReceipt.gasUsed * deploymentTx.gasPrice),
        maxSupply: "10000000",
        lotteryPrice: "0.0001",
        optimizations: [
            "移除预分配池子",
            "懒加载数字生成",
            "简化状态变量",
            "优化随机数生成"
        ]
    };
    
    const deploymentFile = `./deployment-optimized-${network.name}.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 部署信息已保存到 ${deploymentFile}`);
    
    // 输出部署总结
    console.log("\n🎉 优化版部署完成！");
    console.log("==================================================");
    console.log(`NumberCoinOptimized 合约地址: ${contractAddress}`);
    console.log(`网络: ${network.name} (${network.chainId})`);
    console.log(`区块高度: ${deploymentReceipt.blockNumber}`);
    if (network.name === 'sepolia') {
        console.log(`Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    }
    console.log("==================================================");
    
    console.log("\n✨ 优化特性:");
    console.log("- ❌ 无需预分配池子初始化");
    console.log("- ⚡ 懒加载数字生成");
    console.log("- 💰 大幅降低Gas费用");
    console.log("- 🎯 保持相同功能");
    
    console.log("\n📝 下一步:");
    console.log("1. 验证合约源代码 (如果在测试网)");
    console.log("2. 更新前端配置中的合约地址");
    console.log("3. 测试抽奖功能");
    
    if (network.name === 'sepolia') {
        console.log("\n🔧 验证合约命令:");
        console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });