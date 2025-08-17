const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 开始在 Sepolia 网络部署 NumberCoin 合约...");
    
    // 获取部署账户信息
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);
    
    // 检查账户余额
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`账户余额: ${ethers.formatEther(balance)} SepoliaETH`);
    
    if (ethers.parseEther("0.01") > balance) {
        console.warn("⚠️ 账户余额可能不足，建议至少有 0.01 SepoliaETH");
    }
    
    // 获取网络信息
    const network = await ethers.provider.getNetwork();
    console.log(`网络: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 11155111n) {
        throw new Error(`❌ 错误的网络！期望 Sepolia (11155111)，实际: ${network.chainId}`);
    }
    
    // 部署合约
    console.log("\n📋 部署 NumberCoin 合约...");
    const NumberCoin = await ethers.getContractFactory("NumberCoin");
    
    // 估算部署Gas费用
    const deploymentData = NumberCoin.interface.encodeDeploy([]);
    const estimatedGas = await ethers.provider.estimateGas({
        data: deploymentData
    });
    
    const gasPrice = await ethers.provider.getFeeData();
    const estimatedCost = estimatedGas * gasPrice.gasPrice;
    
    console.log(`估算部署Gas: ${estimatedGas}`);
    console.log(`估算Gas价格: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} Gwei`);
    console.log(`估算部署成本: ${ethers.formatEther(estimatedCost)} SepoliaETH`);
    
    // 部署合约（带超时）
    const contract = await NumberCoin.deploy();
    console.log(`✅ 部署交易已发送，交易哈希: ${contract.deploymentTransaction().hash}`);
    console.log("⏳ 等待合约部署确认...");
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`✅ NumberCoin 合约部署成功！`);
    console.log(`合约地址: ${contractAddress}`);
    
    // 获取部署区块信息
    const deploymentTx = await ethers.provider.getTransaction(contract.deploymentTransaction().hash);
    const deploymentReceipt = await ethers.provider.getTransactionReceipt(contract.deploymentTransaction().hash);
    
    console.log(`区块高度: ${deploymentReceipt.blockNumber}`);
    console.log(`实际Gas使用: ${deploymentReceipt.gasUsed}`);
    console.log(`实际部署成本: ${ethers.formatEther(deploymentReceipt.gasUsed * deploymentTx.gasPrice)} SepoliaETH`);
    
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
        
        console.log(`合约名称: ${name}`);
        console.log(`合约符号: ${symbol}`);
        console.log(`最大供应量: ${maxSupply}`);
        console.log(`抽奖价格: ${ethers.formatEther(lotteryPrice)} SepoliaETH`);
    } catch (error) {
        console.error("❌ 合约功能测试失败:", error.message);
    }
    
    // 初始化抽奖池
    console.log("\n🎱 初始化抽奖池...");
    try {
        const poolSize = await contract.getPoolSize();
        console.log(`当前池子大小: ${poolSize}`);
        
        if (poolSize === 0n) {
            console.log("初始化抽奖池...");
            const initTx = await contract.resetPool();
            await initTx.wait();
            console.log("✅ 抽奖池初始化完成");
            
            const newPoolSize = await contract.getPoolSize();
            console.log(`新池子大小: ${newPoolSize}`);
        } else {
            console.log("✅ 抽奖池已经初始化");
        }
    } catch (error) {
        console.error("❌ 抽奖池初始化失败:", error.message);
    }
    
    // 保存部署信息
    const deploymentInfo = {
        contractName: "NumberCoin",
        contractAddress: contractAddress,
        deployerAddress: deployer.address,
        network: "sepolia",
        chainId: Number(network.chainId),
        blockNumber: deploymentReceipt.blockNumber,
        transactionHash: contract.deploymentTransaction().hash,
        deploymentTime: new Date().toISOString(),
        gasUsed: deploymentReceipt.gasUsed.toString(),
        gasCost: ethers.formatEther(deploymentReceipt.gasUsed * deploymentTx.gasPrice),
        maxSupply: "10000000",
        lotteryPrice: "0.0001"
    };
    
    const deploymentFile = './deployment-sepolia.json';
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 部署信息已保存到 ${deploymentFile}`);
    
    // 输出部署总结
    console.log("\n🎉 部署完成！");
    console.log("==================================================");
    console.log(`NumberCoin 合约地址: ${contractAddress}`);
    console.log(`网络: Sepolia (${network.chainId})`);
    console.log(`区块高度: ${deploymentReceipt.blockNumber}`);
    console.log(`Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("==================================================");
    
    console.log("\n📝 下一步:");
    console.log("1. 在 Etherscan 上验证合约源代码");
    console.log("2. 更新前端配置中的合约地址");
    console.log("3. 确保钱包连接到 Sepolia 网络");
    console.log("\n🔧 验证合约命令:");
    console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });