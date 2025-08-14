const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
    
    console.log("🎲 测试抽奖功能...");
    console.log("合约地址:", contractAddress);
    
    try {
        // 获取合约实例
        const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
        const contract = SnakeCoin.attach(contractAddress);
        
        // 检查池子状态
        const poolSize = await contract.getPoolSize();
        const totalSupply = await contract.totalSupply();
        const price = await contract.lotteryPrice();
        
        console.log("\n📊 当前状态:");
        console.log("池子大小:", poolSize.toString());
        console.log("已铸造数量:", totalSupply.toString());
        console.log("抽奖价格:", ethers.formatEther(price), "ETH");
        
        if (poolSize == 0) {
            console.log("❌ 池子为空，无法抽奖");
            return;
        }
        
        // 获取部署账户
        const [deployer] = await ethers.getSigners();
        console.log("\n👤 测试账户:", deployer.address);
        console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
        
        // 执行抽奖
        console.log("\n🎯 开始抽奖...");
        const lotteryTx = await contract.playLottery({ value: price });
        console.log("交易哈希:", lotteryTx.hash);
        
        // 等待交易确认
        const receipt = await lotteryTx.wait();
        console.log("交易确认，区块号:", receipt.blockNumber);
        
        // 查找抽奖事件
        const lotteryEvent = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === "LotteryWon";
            } catch {
                return false;
            }
        });
        
        if (lotteryEvent) {
            const parsed = contract.interface.parseLog(lotteryEvent);
            console.log("\n🎉 抽奖成功!");
            console.log("获胜者:", parsed.args.winner);
            console.log("Token ID:", parsed.args.tokenId.toString());
            console.log("支付金额:", ethers.formatEther(parsed.args.price), "ETH");
            
            // 验证NFT所有权
            const owner = await contract.ownerOf(parsed.args.tokenId);
            console.log("NFT所有者:", owner);
            console.log("所有权验证:", owner === deployer.address ? "✅" : "❌");
            
            // 生成SVG预览
            const svg = await contract.generateSnakeSVG(parsed.args.tokenId);
            console.log("SVG长度:", svg.length);
            console.log("SVG包含svg标签:", svg.includes("<svg"));
            
            // 获取tokenURI
            const tokenURI = await contract.tokenURI(parsed.args.tokenId);
            console.log("TokenURI长度:", tokenURI.length);
            console.log("TokenURI格式正确:", tokenURI.startsWith("data:application/json;base64,"));
            
        } else {
            console.log("❌ 抽奖事件未找到");
        }
        
        // 更新后的状态
        const newPoolSize = await contract.getPoolSize();
        const newTotalSupply = await contract.totalSupply();
        
        console.log("\n📊 抽奖后的状态:");
        console.log("新池子大小:", newPoolSize.toString());
        console.log("新总供应量:", newTotalSupply.toString());
        
        console.log("\n✅ 测试完成!");
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
