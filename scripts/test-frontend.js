const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 测试前端和合约交互...");
    
    try {
        // 从部署文件读取合约地址
        const fs = require('fs');
        const deploymentInfo = JSON.parse(fs.readFileSync('deployment-numbercoin.json', 'utf8'));
        const contractAddress = deploymentInfo.contractAddress;
        
        console.log("合约地址:", contractAddress);
        
        // 获取合约实例
        const NumberCoin = await ethers.getContractFactory("NumberCoin");
        const numberCoin = NumberCoin.attach(contractAddress);
        
        // 获取测试账户
        const [owner, user1] = await ethers.getSigners();
        
        console.log("\n📊 合约状态检查:");
        
        // 检查合约基本信息
        const name = await numberCoin.name();
        const symbol = await numberCoin.symbol();
        const maxSupply = await numberCoin.MAX_SUPPLY();
        const lotteryPrice = await numberCoin.lotteryPrice();
        const poolSize = await numberCoin.getPoolSize();
        const totalSupply = await numberCoin.totalSupply();
        
        console.log("合约名称:", name);
        console.log("合约符号:", symbol);
        console.log("最大供应量:", maxSupply.toString());
        console.log("抽奖价格:", ethers.formatEther(lotteryPrice), "ETH");
        console.log("当前池子大小:", poolSize.toString());
        console.log("已铸造数量:", totalSupply.toString());
        
        // 测试Gas估算
        console.log("\n⛽ Gas估算测试:");
        try {
            const estimatedGas = await numberCoin.playLottery.estimateGas({
                from: user1.address,
                value: lotteryPrice
            });
            console.log("✅ 估算Gas成功:", estimatedGas.toString());
            
            // 计算Gas费用
            const gasPrice = await ethers.provider.getFeeData();
            const gasCost = estimatedGas * gasPrice.gasPrice;
            console.log("预计Gas费用:", ethers.formatEther(gasCost), "ETH");
            
        } catch (gasError) {
            console.error("❌ Gas估算失败:", gasError.message);
        }
        
        // 测试实际抽奖（小批量）
        console.log("\n🎲 实际抽奖测试:");
        
        const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
        console.log("User1抽奖前余额:", ethers.formatEther(user1BalanceBefore), "ETH");
        
        // 执行抽奖
        const startTime = Date.now();
        const lotteryTx = await numberCoin.connect(user1).playLottery({
            value: lotteryPrice,
            gasLimit: 500000
        });
        
        console.log("抽奖交易已发送，等待确认...");
        const receipt = await lotteryTx.wait();
        const endTime = Date.now();
        
        console.log("✅ 抽奖交易成功！");
        console.log("交易哈希:", receipt.hash);
        console.log("Gas使用量:", receipt.gasUsed.toString());
        console.log("交易时间:", (endTime - startTime) / 1000, "秒");
        
        // 查找事件
        const lotteryEvent = receipt.logs.find(log => {
            try {
                const parsed = numberCoin.interface.parseLog(log);
                return parsed.name === 'LotteryWon';
            } catch (e) {
                return false;
            }
        });
        
        if (lotteryEvent) {
            const parsed = numberCoin.interface.parseLog(lotteryEvent);
            const tokenId = parsed.args.tokenId;
            console.log("🎉 获得Token ID:", tokenId.toString());
            
            // 测试NFT元数据
            try {
                const tokenURI = await numberCoin.tokenURI(tokenId);
                console.log("✅ TokenURI获取成功");
                
                const svg = await numberCoin.generateNumberSVG(tokenId);
                console.log("✅ SVG生成成功，长度:", svg.length);
                
            } catch (metadataError) {
                console.error("❌ 元数据获取失败:", metadataError.message);
            }
        }
        
        // 检查最终状态
        const finalPoolSize = await numberCoin.getPoolSize();
        const finalTotalSupply = await numberCoin.totalSupply();
        
        console.log("\n📈 最终状态:");
        console.log("剩余池子大小:", finalPoolSize.toString());
        console.log("总铸造数量:", finalTotalSupply.toString());
        
        // 性能评估
        console.log("\n📊 性能评估:");
        console.log("单次抽奖时间:", (endTime - startTime) / 1000, "秒");
        console.log("Gas效率:", receipt.gasUsed.toString(), "gas");
        
        if ((endTime - startTime) > 10000) {
            console.log("⚠️  警告：交易时间超过10秒，可能存在性能问题");
        } else {
            console.log("✅ 交易时间正常");
        }
        
        if (receipt.gasUsed > 400000) {
            console.log("⚠️  警告：Gas使用量较高");
        } else {
            console.log("✅ Gas使用量正常");
        }
        
        console.log("\n🎉 前端测试验证完成！");
        
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