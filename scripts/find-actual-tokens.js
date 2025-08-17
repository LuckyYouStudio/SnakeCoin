const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🔍 查找实际的Token ID...");
    
    // 从部署文件读取合约地址
    const deploymentData = JSON.parse(fs.readFileSync('./deployment-numbercoin.json', 'utf8'));
    console.log(`📋 合约地址: ${deploymentData.contractAddress}`);

    // 获取合约
    const NumberCoin = await ethers.getContractFactory("NumberCoin");
    const contract = NumberCoin.attach(deploymentData.contractAddress);

    // 获取测试账户
    const [owner, user1, user2] = await ethers.getSigners();
    
    console.log(`\n👤 测试账户: ${user1.address}`);

    // 通过查询事件来找到实际的Token ID
    console.log("\n🎯 查询抽奖事件...");
    
    try {
        // 查询LotteryWon事件
        const filter = contract.filters.LotteryWon();
        const events = await contract.queryFilter(filter, 0, 'latest');
        
        console.log(`找到 ${events.length} 个抽奖事件:`);
        
        const user1TokenIds = [];
        for (const event of events) {
            const { winner, tokenId, price } = event.args;
            console.log(`- 赢家: ${winner}, Token ID: ${tokenId}, 价格: ${ethers.formatEther(price)} ETH`);
            
            if (winner.toLowerCase() === user1.address.toLowerCase()) {
                user1TokenIds.push(tokenId.toString());
            }
        }
        
        console.log(`\n✅ User1 拥有的Token ID: [${user1TokenIds.join(', ')}]`);
        
        // 验证所有权
        console.log("\n🔍 验证Token所有权:");
        for (const tokenId of user1TokenIds) {
            try {
                const owner = await contract.ownerOf(tokenId);
                console.log(`Token #${tokenId}: ${owner === user1.address ? '✅' : '❌'} ${owner}`);
                
                // 获取Token的metadata
                try {
                    const tokenURI = await contract.tokenURI(tokenId);
                    if (tokenURI.startsWith("data:application/json;base64,")) {
                        const base64Data = tokenURI.replace("data:application/json;base64,", "");
                        const jsonData = JSON.parse(Buffer.from(base64Data, 'base64').toString());
                        const numberAttr = jsonData.attributes?.find(attr => attr.trait_type === 'Number');
                        console.log(`  └─ 数字: ${numberAttr?.value || 'N/A'}, 稀有度: ${jsonData.attributes?.find(attr => attr.trait_type === 'Rarity')?.value || 'N/A'}`);
                    }
                } catch (metaError) {
                    console.log(`  └─ 获取元数据失败: ${metaError.message}`);
                }
                
            } catch (error) {
                console.log(`Token #${tokenId}: ❌ 查询失败 - ${error.message}`);
            }
        }
        
        // 保存Token ID列表到文件
        const testData = {
            contractAddress: deploymentData.contractAddress,
            testAccount: user1.address,
            tokenIds: user1TokenIds,
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync('./test-tokens.json', JSON.stringify(testData, null, 2));
        console.log(`\n💾 测试数据已保存到 test-tokens.json`);
        
    } catch (error) {
        console.error("查询事件失败:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });