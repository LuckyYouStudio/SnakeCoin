const { ethers } = require("hardhat");

async function main() {
    console.log("🎲 蛇币NFT抽奖合约交互脚本");
    console.log("=====================================");
    
    // 合约地址 (需要替换为实际部署的地址)
    const CONTRACT_ADDRESS = "0x..."; // 请替换为实际地址
    
    // 获取签名者
    const [deployer] = await ethers.getSigners();
    console.log("当前账户:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    
    // 连接到合约
    const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
    const snakeCoin = SnakeCoin.attach(CONTRACT_ADDRESS);
    
    console.log("\n📋 合约信息:");
    console.log("合约地址:", CONTRACT_ADDRESS);
    console.log("合约名称:", await snakeCoin.name());
    console.log("合约符号:", await snakeCoin.symbol());
    
    // 获取抽奖信息
    const lotteryInfo = await snakeCoin.getLotteryInfo();
    console.log("\n🎯 抽奖信息:");
    console.log("抽奖价格:", ethers.formatEther(lotteryInfo.price), "ETH");
    console.log("池子大小:", lotteryInfo.poolSize.toString());
    console.log("已铸造数量:", lotteryInfo.totalMinted.toString());
    console.log("剩余数量:", lotteryInfo.remaining.toString());
    
    // 检查用户是否拥有NFT
    const balance = await snakeCoin.balanceOf(deployer.address);
    console.log("\n👤 用户NFT信息:");
    console.log("NFT数量:", balance.toString());
    
    if (balance > 0) {
        console.log("拥有的Token IDs:");
        for (let i = 0; i < balance; i++) {
            const tokenId = await snakeCoin.tokenOfOwnerByIndex(deployer.address, i);
            console.log(`  - Token #${tokenId}`);
            
            // 显示SVG信息
            const svg = await snakeCoin.generateSnakeSVG(tokenId);
            console.log(`    SVG长度: ${svg.length} 字符`);
            
            // 显示tokenURI信息
            const tokenURI = await snakeCoin.tokenURI(tokenId);
            console.log(`    TokenURI长度: ${tokenURI.length} 字符`);
        }
    }
    
    // 显示池子状态
    console.log("\n🏊 池子状态:");
    const poolSize = await snakeCoin.getPoolSize();
    console.log("当前池子大小:", poolSize.toString());
    
    if (poolSize > 0) {
        console.log("池子中还有", poolSize.toString(), "个可用的Token ID");
        console.log("可以继续抽奖!");
    } else {
        console.log("池子已空，需要重新填充");
    }
    
    // 显示用户nonce
    const userNonce = await snakeCoin.getUserNonce(deployer.address);
    console.log("用户Nonce:", userNonce.toString());
    
    console.log("\n💡 可用操作:");
    console.log("1. 调用 playLottery() 进行抽奖 (需要支付 0.0001 ETH)");
    console.log("2. 调用 getLotteryInfo() 查看抽奖信息");
    console.log("3. 调用 getPoolSize() 查看池子大小");
    console.log("4. 调用 getUserNonce(address) 查看用户nonce");
    console.log("5. 调用 generateSnakeSVG(tokenId) 生成SVG");
    console.log("6. 调用 tokenURI(tokenId) 获取元数据");
    
    console.log("\n🔧 管理员操作 (仅合约所有者):");
    console.log("1. 调用 updateLotteryPrice(newPrice) 更新抽奖价格");
    console.log("2. 调用 refillPool() 重新填充池子");
    console.log("3. 调用 withdrawBalance() 提取合约余额");
    console.log("4. 调用 updateColor(index, newColor) 更新颜色");
    console.log("5. 调用 updateSnakePath(index, newPath) 更新路径");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("交互失败:", error);
        process.exit(1);
    });
