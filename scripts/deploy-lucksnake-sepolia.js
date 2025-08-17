const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 开始部署LuckSnake合约到Sepolia测试网...");

    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("📝 部署账户:", deployer.address);
    
    // 检查账户余额
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
        console.log("⚠️  警告: 账户余额较低，可能影响部署");
        console.log("💡 请确保账户有足够的Sepolia ETH");
        console.log("🔗 获取测试币: https://sepoliafaucet.com/");
    }

    // 获取网络信息
    const network = await ethers.provider.getNetwork();
    console.log("🌐 网络信息:");
    console.log("   - 网络名称:", network.name);
    console.log("   - Chain ID:", network.chainId);
    console.log("   - 确认这是Sepolia测试网 (Chain ID: 11155111)");
    
    if (network.chainId !== 11155111n) {
        throw new Error("❌ 错误: 当前网络不是Sepolia测试网!");
    }

    // 编译合约
    console.log("\n🔨 编译LuckSnake合约...");
    const LuckSnake = await ethers.getContractFactory("LuckSnake");
    
    // 估算部署费用
    console.log("\n💸 估算部署费用...");
    const deployTransaction = await LuckSnake.getDeployTransaction();
    const estimatedGas = await ethers.provider.estimateGas(deployTransaction);
    const gasPrice = await ethers.provider.getFeeData();
    
    console.log("📊 Gas估算:");
    console.log("   - 估算Gas:", estimatedGas.toString());
    console.log("   - Gas价格:", ethers.formatUnits(gasPrice.gasPrice, "gwei"), "Gwei");
    
    const estimatedCost = estimatedGas * gasPrice.gasPrice;
    console.log("   - 预计费用:", ethers.formatEther(estimatedCost), "ETH");

    // 部署合约
    console.log("\n🚀 正在部署LuckSnake合约...");
    console.log("⏳ 请等待交易确认...");
    
    const luckSnake = await LuckSnake.deploy();
    console.log("📝 部署交易哈希:", luckSnake.deploymentTransaction().hash);
    
    // 等待部署确认
    await luckSnake.waitForDeployment();
    const contractAddress = await luckSnake.getAddress();
    
    console.log("\n✅ LuckSnake合约部署成功!");
    console.log("📍 合约地址:", contractAddress);
    console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    
    // 验证部署
    console.log("\n🔍 验证部署结果...");
    const owner = await luckSnake.owner();
    const generationPrice = await luckSnake.GENERATION_PRICE();
    const minNumber = await luckSnake.MIN_NUMBER();
    const maxNumber = await luckSnake.MAX_NUMBER();
    
    console.log("📋 合约信息:");
    console.log("   - 所有者:", owner);
    console.log("   - 部署者匹配:", owner === deployer.address ? "✅" : "❌");
    console.log("   - 生成价格:", ethers.formatEther(generationPrice), "ETH");
    console.log("   - 数字范围:", minNumber.toString(), "-", maxNumber.toString());
    
    // 检查初始状态
    console.log("\n📊 检查初始状态...");
    const systemInfo = await luckSnake.getSystemInfo();
    console.log("   - 已生成数字:", systemInfo.totalGenerated.toString());
    console.log("   - 剩余数字:", systemInfo.remaining.toString());
    console.log("   - 合约余额:", ethers.formatEther(systemInfo.contractBalance), "ETH");
    
    // 测试基本功能
    console.log("\n🧪 测试合约基本功能...");
    
    try {
        // 测试查询功能（只读操作）
        const testAddress = "0x0000000000000000000000000000000000000000";
        const userNumbers = await luckSnake.getUserNumbers(testAddress);
        console.log("✅ getUserNumbers 函数正常");
        
        const numberOwner = await luckSnake.getNumberOwner(0);
        console.log("✅ getNumberOwner 函数正常");
        
        const isNumberTaken = await luckSnake.isNumberTaken(0);
        console.log("✅ isNumberTaken 函数正常");
        
        console.log("🎉 所有只读函数测试通过!");
        
    } catch (error) {
        console.error("❌ 函数测试失败:", error.message);
    }

    // 保存部署信息
    const deploymentInfo = {
        network: "sepolia",
        chainId: network.chainId.toString(),
        contractAddress: contractAddress,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        transactionHash: luckSnake.deploymentTransaction().hash,
        etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
        gasUsed: estimatedGas.toString(),
        deploymentCost: ethers.formatEther(estimatedCost),
        contractInfo: {
            owner: owner,
            generationPrice: ethers.formatEther(generationPrice),
            numberRange: `${minNumber}-${maxNumber}`
        }
    };
    
    // 保存到文件
    const deploymentFile = 'deployment-lucksnake-sepolia.json';
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 部署信息已保存到: ${deploymentFile}`);
    
    // 显示最终信息
    console.log("\n🎯 部署完成总结:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 合约地址:", contractAddress);
    console.log("🌐 网络: Sepolia 测试网");
    console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("💰 生成价格: 0.0001 ETH");
    console.log("🎲 数字范围: 0-999");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("\n📋 下一步操作:");
    console.log("1. 💰 确保钱包有足够的Sepolia ETH进行测试");
    console.log("2. 🔄 更新前端合约地址");
    console.log("3. 🌐 在钱包中添加Sepolia网络");
    console.log("4. 🧪 进行前端功能测试");
    console.log("5. 📊 可选: 在Etherscan上验证合约源码");
    
    return {
        contract: luckSnake,
        address: contractAddress,
        deployer: deployer.address,
        deploymentInfo: deploymentInfo
    };
}

// 如果直接运行此脚本
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("\n❌ 部署失败:");
            console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.error("错误信息:", error.message);
            
            if (error.message.includes("insufficient funds")) {
                console.error("\n💡 解决方案:");
                console.error("1. 检查账户ETH余额");
                console.error("2. 从水龙头获取测试币: https://sepoliafaucet.com/");
                console.error("3. 等待几分钟后重试");
            } else if (error.message.includes("network")) {
                console.error("\n💡 解决方案:");
                console.error("1. 检查网络连接");
                console.error("2. 验证RPC_URL配置");
                console.error("3. 确认Sepolia网络状态");
            } else if (error.message.includes("private key")) {
                console.error("\n💡 解决方案:");
                console.error("1. 检查.env文件中的PRIVATE_KEY");
                console.error("2. 确保私钥格式正确");
                console.error("3. 不要包含0x前缀");
            }
            
            console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            process.exit(1);
        });
}

module.exports = main;