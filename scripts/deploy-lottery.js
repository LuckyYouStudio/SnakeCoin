const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署蛇币NFT抽奖合约...");
    
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    
    // 部署合约
    const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
    const snakeCoin = await SnakeCoin.deploy();
    await snakeCoin.waitForDeployment();
    
    const contractAddress = await snakeCoin.getAddress();
    console.log("🐍 蛇币NFT抽奖合约已部署到:", contractAddress);
    
    // 初始化池子
    console.log("\n🏊 正在初始化NFT池子...");
    const initTx = await snakeCoin.refillPool();
    await initTx.wait();
    console.log("✅ 池子初始化完成!");
    
    // 验证部署
    console.log("\n📋 合约信息:");
    console.log("合约名称:", await snakeCoin.name());
    console.log("合约符号:", await snakeCoin.symbol());
    
    // 获取抽奖信息
    const lotteryInfo = await snakeCoin.getLotteryInfo();
    console.log("抽奖价格:", ethers.formatEther(lotteryInfo.price), "ETH");
    console.log("池子大小:", lotteryInfo.poolSize.toString());
    console.log("已铸造数量:", lotteryInfo.totalMinted.toString());
    console.log("剩余数量:", lotteryInfo.remaining.toString());
    
    // 测试抽奖功能
    console.log("\n🎲 测试抽奖功能...");
    
    // 模拟用户抽奖
    const testUser = new ethers.Wallet(ethers.randomBytes(32), deployer.provider);
    const lotteryPrice = await snakeCoin.lotteryPrice();
    
    console.log("测试用户地址:", testUser.address);
    console.log("抽奖价格:", ethers.formatEther(lotteryPrice), "ETH");
    
    // 给测试用户一些ETH
    const transferTx = await deployer.sendTransaction({
        to: testUser.address,
        value: lotteryPrice
    });
    await transferTx.wait();
    
    console.log("已给测试用户转账:", ethers.formatEther(lotteryPrice), "ETH");
    
    // 连接测试用户到合约
    const testUserContract = snakeCoin.connect(testUser);
    
    // 执行抽奖
    console.log("正在执行抽奖...");
    const lotteryTx = await testUserContract.playLottery({ value: lotteryPrice });
    const receipt = await lotteryTx.wait();
    
    // 查找抽奖事件
    const lotteryEvent = receipt.logs.find(log => {
        try {
            const parsed = snakeCoin.interface.parseLog(log);
            return parsed.name === "LotteryWon";
        } catch {
            return false;
        }
    });
    
    if (lotteryEvent) {
        const parsed = snakeCoin.interface.parseLog(lotteryEvent);
        console.log("🎉 抽奖成功!");
        console.log("获胜者:", parsed.args.winner);
        console.log("Token ID:", parsed.args.tokenId.toString());
        console.log("支付金额:", ethers.formatEther(parsed.args.price), "ETH");
        
        // 验证NFT所有权
        const owner = await snakeCoin.ownerOf(parsed.args.tokenId);
        console.log("NFT所有者:", owner);
        console.log("所有权验证:", owner === testUser.address ? "✅" : "❌");
        
        // 生成SVG预览
        const svg = await snakeCoin.generateSnakeSVG(parsed.args.tokenId);
        console.log("SVG长度:", svg.length);
        console.log("SVG包含svg标签:", svg.includes("<svg"));
        
        // 获取tokenURI
        const tokenURI = await snakeCoin.tokenURI(parsed.args.tokenId);
        console.log("TokenURI长度:", tokenURI.length);
        console.log("TokenURI格式正确:", tokenURI.startsWith("data:application/json;base64,"));
        
    } else {
        console.log("❌ 抽奖事件未找到");
    }
    
    // 更新后的池子信息
    const newLotteryInfo = await snakeCoin.getLotteryInfo();
    console.log("\n📊 抽奖后的池子信息:");
    console.log("池子大小:", newLotteryInfo.poolSize.toString());
    console.log("已铸造数量:", newLotteryInfo.totalMinted.toString());
    
    console.log("\n🎯 部署和测试完成!");
    console.log("合约地址:", contractAddress);
    console.log("可以在Etherscan上查看合约");
    console.log("\n💡 使用说明:");
    console.log("1. 用户调用 playLottery() 并支付 0.0001 ETH");
    console.log("2. 合约随机选择一个可用的 tokenId");
    console.log("3. 立即铸造NFT并转移到用户账户");
    console.log("4. 使用 Fisher-Yates 算法管理 tokenId 池");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("部署失败:", error);
        process.exit(1);
    });
