const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🎲 为测试账户铸造一些NFT...");
    
    // 从部署文件读取合约地址
    let deploymentData;
    try {
        const deploymentFile = './deployment-numbercoin.json';
        if (fs.existsSync(deploymentFile)) {
            deploymentData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
            console.log(`📋 从部署文件读取合约地址: ${deploymentData.contractAddress}`);
        } else {
            throw new Error('部署文件不存在');
        }
    } catch (error) {
        console.error('❌ 读取部署文件失败:', error.message);
        return;
    }

    // 获取合约
    const NumberCoin = await ethers.getContractFactory("NumberCoin");
    const contract = NumberCoin.attach(deploymentData.contractAddress);

    // 获取测试账户
    const [owner, user1, user2] = await ethers.getSigners();
    
    console.log("测试账户:");
    console.log(`- Owner: ${owner.address}`);
    console.log(`- User1: ${user1.address}`);
    console.log(`- User2: ${user2.address}`);

    // 获取抽奖价格
    const lotteryPrice = await contract.lotteryPrice();
    console.log(`\n🎯 抽奖价格: ${ethers.formatEther(lotteryPrice)} ETH`);

    // 为user1铸造5个NFT
    console.log(`\n🎲 为 User1 (${user1.address}) 铸造5个NFT...`);
    for (let i = 0; i < 5; i++) {
        try {
            const tx = await contract.connect(user1).playLottery({
                value: lotteryPrice
            });
            const receipt = await tx.wait();
            
            const lotteryEvent = receipt.events.find(e => e.event === 'LotteryWon');
            if (lotteryEvent) {
                const tokenId = lotteryEvent.args.tokenId;
                console.log(`  ✅ 第${i+1}次抽奖成功，获得 NFT #${tokenId}`);
            }
        } catch (error) {
            console.error(`  ❌ 第${i+1}次抽奖失败:`, error.message);
        }
    }

    // 检查用户余额
    const user1Balance = await contract.balanceOf(user1.address);
    console.log(`\n📊 User1 NFT余额: ${user1Balance}`);

    // 显示用户拥有的NFT详情
    if (user1Balance > 0) {
        console.log(`\n🔍 扫描 User1 拥有的NFT...`);
        const totalSupply = await contract.totalSupply();
        console.log(`总供应量: ${totalSupply}`);
        
        for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
            try {
                const owner = await contract.ownerOf(tokenId);
                if (owner.toLowerCase() === user1.address.toLowerCase()) {
                    const tokenURI = await contract.tokenURI(tokenId);
                    console.log(`  - Token #${tokenId}: ${user1.address}`);
                    
                    // 解析metadata
                    if (tokenURI.startsWith("data:application/json;base64,")) {
                        const base64Data = tokenURI.replace("data:application/json;base64,", "");
                        const jsonData = JSON.parse(Buffer.from(base64Data, 'base64').toString());
                        console.log(`    名称: ${jsonData.name}`);
                        const numberAttr = jsonData.attributes.find(attr => attr.trait_type === 'Number');
                        if (numberAttr) {
                            console.log(`    数字: ${numberAttr.value}`);
                        }
                    }
                }
            } catch (error) {
                // Token不存在，跳过
            }
        }
    }

    console.log("\n🎉 测试NFT铸造完成！");
    console.log(`\n📝 测试信息:`);
    console.log(`- 合约地址: ${deploymentData.contractAddress}`);
    console.log(`- 测试账户: ${user1.address}`);
    console.log(`- NFT数量: ${user1Balance}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });