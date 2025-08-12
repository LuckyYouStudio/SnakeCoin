const { ethers } = require("hardhat");

async function main() {
    console.log("🎨 蛇币NFT铸造功能测试");
    console.log("=====================================");
    
    // 使用已部署的合约地址
    const CONTRACT_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
    
    // 获取签名者
    const [deployer] = await ethers.getSigners();
    console.log("测试账户:", deployer.address);
    
    // 连接到合约
    const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
    const snakeCoin = SnakeCoin.attach(CONTRACT_ADDRESS);
    
    console.log("\n📋 合约信息:");
    console.log("合约地址:", CONTRACT_ADDRESS);
    console.log("合约名称:", await snakeCoin.name());
    console.log("合约符号:", await snakeCoin.symbol());
    
    // 测试铸造功能
    console.log("\n🎨 测试NFT铸造功能:");
    try {
        // 铸造几个测试NFT
        const mintAmount = 3;
        console.log(`正在铸造 ${mintAmount} 个NFT...`);
        
        const mintTx = await snakeCoin.mint(deployer.address, mintAmount);
        await mintTx.wait();
        
        console.log("✅ 铸造成功!");
        
        // 检查NFT数量
        const balance = await snakeCoin.balanceOf(deployer.address);
        console.log("当前NFT数量:", balance.toString());
        
        // 显示拥有的NFT
        console.log("\n👤 拥有的NFT:");
        for (let i = 0; i < balance; i++) {
            const tokenId = await snakeCoin.tokenOfOwnerByIndex(deployer.address, i);
            console.log(`  - Token #${tokenId}`);
            
            // 生成SVG
            const svg = await snakeCoin.generateSnakeSVG(tokenId);
            console.log(`    SVG长度: ${svg.length} 字符`);
            
            // 获取tokenURI
            const tokenURI = await snakeCoin.tokenURI(tokenId);
            console.log(`    TokenURI长度: ${tokenURI.length} 字符`);
            console.log(`    TokenURI格式: ${tokenURI.startsWith("data:application/json;base64,") ? "✅" : "❌"}`);
        }
        
    } catch (error) {
        console.log("❌ 铸造失败:", error.message);
    }
    
    // 测试SVG生成
    console.log("\n🎨 测试SVG生成:");
    try {
        const testTokenId = 0;
        const svg = await snakeCoin.generateSnakeSVG(testTokenId);
        console.log("✅ SVG生成成功!");
        console.log("SVG长度:", svg.length);
        console.log("SVG包含svg标签:", svg.includes("<svg"));
        console.log("SVG前100字符:", svg.substring(0, 100));
    } catch (error) {
        console.log("❌ SVG生成失败:", error.message);
    }
    
    // 测试tokenURI
    console.log("\n🔗 测试TokenURI:");
    try {
        const testTokenId = 0;
        const tokenURI = await snakeCoin.tokenURI(testTokenId);
        console.log("✅ TokenURI生成成功!");
        console.log("TokenURI长度:", tokenURI.length);
        console.log("TokenURI格式:", tokenURI.startsWith("data:application/json;base64,") ? "✅" : "❌");
        
        // 解码Base64查看内容
        const base64Data = tokenURI.replace("data:application/json;base64,", "");
        const jsonData = Buffer.from(base64Data, 'base64').toString();
        console.log("JSON内容预览:", jsonData.substring(0, 200) + "...");
        
    } catch (error) {
        console.log("❌ TokenURI生成失败:", error.message);
    }
    
    console.log("\n💡 测试完成!");
    console.log("合约地址:", CONTRACT_ADDRESS);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("测试失败:", error);
        process.exit(1);
    });
