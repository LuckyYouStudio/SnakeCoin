const { ethers } = require("hardhat");

async function main() {
    console.log("开始部署LuckSnake合约...");

    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // 部署合约
    const LuckSnake = await ethers.getContractFactory("LuckSnake");
    console.log("正在部署LuckSnake合约...");
    
    const luckSnake = await LuckSnake.deploy();
    await luckSnake.waitForDeployment();
    
    const contractAddress = await luckSnake.getAddress();
    console.log("LuckSnake合约已部署到:", contractAddress);
    
    // 验证部署
    console.log("\n验证部署...");
    const owner = await luckSnake.owner();
    console.log("合约所有者:", owner);
    console.log("部署者是否为所有者:", owner === deployer.address);
    
    // 检查合约常量
    console.log("\n合约参数:");
    console.log("生成价格:", ethers.formatEther(await luckSnake.GENERATION_PRICE()), "ETH");
    console.log("最小数字:", await luckSnake.MIN_NUMBER());
    console.log("最大数字:", await luckSnake.MAX_NUMBER());
    
    // 检查初始状态
    console.log("\n初始状态:");
    const systemInfo = await luckSnake.getSystemInfo();
    console.log("生成价格:", ethers.formatEther(systemInfo.price), "ETH");
    console.log("已生成数字总数:", systemInfo.totalGenerated.toString());
    console.log("剩余可生成数字:", systemInfo.remaining.toString());
    console.log("合约余额:", ethers.formatEther(systemInfo.contractBalance), "ETH");
    
    // 测试生成数字功能
    console.log("\n测试数字生成功能...");
    const generationPrice = await luckSnake.GENERATION_PRICE();
    
    console.log("用户生成第一个数字...");
    const tx1 = await luckSnake.connect(deployer).generateNumber({ value: generationPrice });
    const receipt1 = await tx1.wait();
    
    // 查找NumberGenerated事件
    const event1 = receipt1.logs.find(log => {
        try {
            const parsed = luckSnake.interface.parseLog(log);
            return parsed.name === "NumberGenerated";
        } catch (e) {
            return false;
        }
    });
    
    if (event1) {
        const parsedEvent1 = luckSnake.interface.parseLog(event1);
        console.log("生成的第一个数字:", parsedEvent1.args.number.toString());
        console.log("支付金额:", ethers.formatEther(parsedEvent1.args.price), "ETH");
    }
    
    // 检查用户拥有的数字
    const userNumbers = await luckSnake.getUserNumbers(deployer.address);
    console.log("用户拥有的数字:", userNumbers.map(n => n.toString()));
    console.log("用户数字数量:", await luckSnake.getUserNumberCount(deployer.address));
    
    // 再生成一个数字
    console.log("\n生成第二个数字...");
    const tx2 = await luckSnake.connect(deployer).generateNumber({ value: generationPrice });
    const receipt2 = await tx2.wait();
    
    const event2 = receipt2.logs.find(log => {
        try {
            const parsed = luckSnake.interface.parseLog(log);
            return parsed.name === "NumberGenerated";
        } catch (e) {
            return false;
        }
    });
    
    if (event2) {
        const parsedEvent2 = luckSnake.interface.parseLog(event2);
        console.log("生成的第二个数字:", parsedEvent2.args.number.toString());
    }
    
    // 检查更新后的状态
    const updatedNumbers = await luckSnake.getUserNumbers(deployer.address);
    console.log("用户现在拥有的数字:", updatedNumbers.map(n => n.toString()));
    
    // 验证数字所有权
    for (let number of updatedNumbers) {
        const numberOwner = await luckSnake.getNumberOwner(number);
        console.log(`数字 ${number} 的所有者:`, numberOwner);
        console.log(`数字 ${number} 是否已被占用:`, await luckSnake.isNumberTaken(number));
    }
    
    // 检查最终状态
    console.log("\n最终状态:");
    const finalSystemInfo = await luckSnake.getSystemInfo();
    console.log("已生成数字总数:", finalSystemInfo.totalGenerated.toString());
    console.log("剩余可生成数字:", finalSystemInfo.remaining.toString());
    console.log("合约余额:", ethers.formatEther(finalSystemInfo.contractBalance), "ETH");
    
    console.log("\n部署和测试完成！");
    console.log("LuckSnake合约地址:", contractAddress);
    
    // 保存部署信息
    const deploymentInfo = {
        contractAddress: contractAddress,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        network: "localhost",
        generationPrice: ethers.formatEther(generationPrice),
        userGeneratedNumbers: updatedNumbers.map(n => n.toString())
    };
    
    console.log("\n部署信息:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    return {
        contract: luckSnake,
        address: contractAddress,
        deployer: deployer.address
    };
}

// 如果直接运行此脚本
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("部署失败:", error);
            process.exit(1);
        });
}

module.exports = main;