const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🔍 调试NFT扫描问题...");
    
    // 从部署文件读取合约地址
    const deploymentData = JSON.parse(fs.readFileSync('./deployment-numbercoin.json', 'utf8'));
    console.log(`📋 合约地址: ${deploymentData.contractAddress}`);

    // 获取合约
    const NumberCoin = await ethers.getContractFactory("NumberCoin");
    const contract = NumberCoin.attach(deploymentData.contractAddress);

    // 获取测试账户
    const [owner, user1, user2] = await ethers.getSigners();
    
    console.log("\n👥 测试账户:");
    console.log(`- Owner: ${owner.address}`);
    console.log(`- User1: ${user1.address}`);
    console.log(`- User2: ${user2.address}`);

    // 检查合约基本信息
    console.log("\n📊 合约基本信息:");
    const totalSupply = await contract.totalSupply();
    const maxSupply = await contract.MAX_SUPPLY();
    console.log(`- 总供应量: ${totalSupply}`);
    console.log(`- 最大供应量: ${maxSupply}`);

    // 检查用户余额
    console.log("\n💰 用户NFT余额:");
    for (const [name, signer] of [['Owner', owner], ['User1', user1], ['User2', user2]]) {
        try {
            const balance = await contract.balanceOf(signer.address);
            console.log(`- ${name} (${signer.address}): ${balance} NFTs`);
        } catch (error) {
            console.log(`- ${name}: 查询失败 - ${error.message}`);
        }
    }

    // 扫描所有Token的所有者
    console.log("\n🔍 扫描所有Token所有者:");
    if (totalSupply > 0) {
        for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
            try {
                const owner = await contract.ownerOf(tokenId);
                console.log(`- Token #${tokenId}: ${owner}`);
                
                // 检查metadata
                try {
                    const tokenURI = await contract.tokenURI(tokenId);
                    if (tokenURI.startsWith("data:application/json;base64,")) {
                        const base64Data = tokenURI.replace("data:application/json;base64,", "");
                        const jsonData = JSON.parse(Buffer.from(base64Data, 'base64').toString());
                        const numberAttr = jsonData.attributes?.find(attr => attr.trait_type === 'Number');
                        console.log(`  └─ 名称: ${jsonData.name}, 数字: ${numberAttr?.value || 'N/A'}`);
                    }
                } catch (metaError) {
                    console.log(`  └─ 元数据获取失败: ${metaError.message}`);
                }
            } catch (error) {
                console.log(`- Token #${tokenId}: 不存在或查询失败`);
            }
        }
    } else {
        console.log("没有任何Token存在");
    }

    // 特别检查User1的NFT
    console.log("\n🎯 特别检查User1的NFT:");
    const user1Balance = await contract.balanceOf(user1.address);
    console.log(`User1余额: ${user1Balance}`);
    
    if (user1Balance > 0) {
        console.log("查找User1拥有的具体Token:");
        const userTokens = [];
        for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
            try {
                const tokenOwner = await contract.ownerOf(tokenId);
                if (tokenOwner.toLowerCase() === user1.address.toLowerCase()) {
                    userTokens.push(tokenId);
                    console.log(`  ✅ User1拥有Token #${tokenId}`);
                }
            } catch (error) {
                // Token不存在，跳过
            }
        }
        console.log(`User1实际拥有的Token: [${userTokens.join(', ')}]`);
    }

    // 测试不同的查询方法
    console.log("\n🧪 测试不同的查询方法:");
    
    // 方法1: 直接调用
    try {
        const directBalance = await contract.balanceOf(user1.address);
        console.log(`方法1 - 直接调用: ${directBalance}`);
    } catch (error) {
        console.log(`方法1失败: ${error.message}`);
    }

    // 方法2: 使用call()
    try {
        const callBalance = await contract.balanceOf.staticCall(user1.address);
        console.log(`方法2 - staticCall: ${callBalance}`);
    } catch (error) {
        console.log(`方法2失败: ${error.message}`);
    }

    // 方法3: 使用provider直接调用
    try {
        const provider = ethers.provider;
        const balanceData = contract.interface.encodeFunctionData("balanceOf", [user1.address]);
        const result = await provider.call({
            to: deploymentData.contractAddress,
            data: balanceData
        });
        const decodedBalance = contract.interface.decodeFunctionResult("balanceOf", result)[0];
        console.log(`方法3 - provider.call: ${decodedBalance}`);
    } catch (error) {
        console.log(`方法3失败: ${error.message}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });