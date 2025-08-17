const { ethers } = require("hardhat");

async function main() {
    // 从部署文件读取合约地址
    const fs = require('fs');
    let contractAddress;
    
    try {
        const deploymentInfo = JSON.parse(fs.readFileSync('deployment-numbercoin.json', 'utf8'));
        contractAddress = deploymentInfo.contractAddress;
        console.log("📋 从部署文件读取合约地址:", contractAddress);
    } catch (error) {
        console.error("❌ 无法读取部署文件，请先运行部署脚本");
        process.exit(1);
    }
    
    console.log("🧪 开始测试 NumberCoin 合约...");
    
    try {
        // 获取合约实例
        const NumberCoin = await ethers.getContractFactory("NumberCoin");
        const numberCoin = NumberCoin.attach(contractAddress);
        
        // 获取测试账户
        const [owner, user1, user2] = await ethers.getSigners();
        console.log("测试账户:");
        console.log("- Owner:", owner.address);
        console.log("- User1:", user1.address);
        console.log("- User2:", user2.address);
        
        // 测试合约基本信息
        console.log("\n📊 合约信息:");
        console.log("名称:", await numberCoin.name());
        console.log("符号:", await numberCoin.symbol());
        console.log("最大供应量:", (await numberCoin.MAX_SUPPLY()).toString());
        console.log("抽奖价格:", ethers.formatEther(await numberCoin.lotteryPrice()), "ETH");
        
        // 检查池子状态
        console.log("\n🎱 池子状态:");
        const poolSize = await numberCoin.getPoolSize();
        console.log("池子大小:", poolSize.toString());
        
        if (poolSize.toString() === "0") {
            console.log("⚠️ 池子未初始化，正在初始化...");
            const initTx = await numberCoin.initializePool();
            await initTx.wait();
            console.log("✅ 池子初始化完成");
            console.log("新池子大小:", (await numberCoin.getPoolSize()).toString());
        }
        
        // 测试抽奖功能
        console.log("\n🎲 测试抽奖功能...");
        const lotteryPrice = await numberCoin.lotteryPrice();
        
        // User1 进行抽奖
        console.log("\n👤 User1 进行抽奖...");
        const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
        console.log("User1 抽奖前余额:", ethers.formatEther(user1BalanceBefore), "ETH");
        
        const lotteryTx1 = await numberCoin.connect(user1).playLottery({
            value: lotteryPrice
        });
        const receipt1 = await lotteryTx1.wait();
        
        // 查找LotteryWon事件
        const lotteryEvent1 = receipt1.logs.find(log => {
            try {
                const parsed = numberCoin.interface.parseLog(log);
                return parsed.name === 'LotteryWon';
            } catch (e) {
                return false;
            }
        });
        
        if (lotteryEvent1) {
            const parsed1 = numberCoin.interface.parseLog(lotteryEvent1);
            console.log("🎉 User1 抽奖成功！");
            console.log("获得 NumberCoin #" + parsed1.args.tokenId.toString());
            
            // 测试NFT元数据
            console.log("\n🖼️ 测试NFT元数据...");
            const tokenId1 = parsed1.args.tokenId;
            
            try {
                const tokenURI = await numberCoin.tokenURI(tokenId1);
                console.log("✅ TokenURI 生成成功");
                
                // 解码Base64 JSON
                const base64Json = tokenURI.replace("data:application/json;base64,", "");
                const jsonStr = Buffer.from(base64Json, 'base64').toString('utf8');
                const metadata = JSON.parse(jsonStr);
                
                console.log("NFT 名称:", metadata.name);
                console.log("NFT 描述:", metadata.description);
                console.log("NFT 属性:");
                metadata.attributes.forEach(attr => {
                    console.log(`  - ${attr.trait_type}: ${attr.value}`);
                });
                
                // 测试SVG生成
                const svg = await numberCoin.generateNumberSVG(tokenId1);
                console.log("✅ SVG 生成成功，长度:", svg.length);
                
            } catch (error) {
                console.error("❌ NFT元数据测试失败:", error.message);
            }
        }
        
        // User2 进行抽奖
        console.log("\n👤 User2 进行抽奖...");
        const lotteryTx2 = await numberCoin.connect(user2).playLottery({
            value: lotteryPrice
        });
        const receipt2 = await lotteryTx2.wait();
        
        // 查找LotteryWon事件
        const lotteryEvent2 = receipt2.logs.find(log => {
            try {
                const parsed = numberCoin.interface.parseLog(log);
                return parsed.name === 'LotteryWon';
            } catch (e) {
                return false;
            }
        });
        
        if (lotteryEvent2) {
            const parsed2 = numberCoin.interface.parseLog(lotteryEvent2);
            console.log("🎉 User2 抽奖成功！");
            console.log("获得 NumberCoin #" + parsed2.args.tokenId.toString());
        }
        
        // 检查最终状态
        console.log("\n📈 最终状态:");
        console.log("总铸造数量:", (await numberCoin.totalSupply()).toString());
        console.log("剩余池子大小:", (await numberCoin.getPoolSize()).toString());
        
        // 检查用户拥有的NFT
        console.log("\n👥 用户NFT:");
        const user1Balance = await numberCoin.balanceOf(user1.address);
        const user2Balance = await numberCoin.balanceOf(user2.address);
        console.log("User1 拥有NFT数量:", user1Balance.toString());
        console.log("User2 拥有NFT数量:", user2Balance.toString());
        
        // 测试合约余额提取
        console.log("\n💰 测试合约余额提取...");
        const contractBalance = await ethers.provider.getBalance(contractAddress);
        console.log("合约余额:", ethers.formatEther(contractBalance), "ETH");
        
        if (contractBalance > 0) {
            const withdrawTx = await numberCoin.withdrawBalance();
            await withdrawTx.wait();
            console.log("✅ 余额提取成功");
        }
        
        console.log("\n🎉 所有测试完成！");
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
        console.error("错误详情:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });