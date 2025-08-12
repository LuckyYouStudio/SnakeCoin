const { ethers } = require("hardhat");

async function main() {
    console.log("🐍 蛇币NFT合约交互示例");
    console.log("========================\n");

    // 获取合约实例（需要先部署）
    const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE"; // 替换为实际部署的合约地址
    const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
    const snakeCoin = SnakeCoin.attach(contractAddress);

    // 获取签名者
    const [owner, user1, user2] = await ethers.getSigners();
    
    try {
        // 1. 查看合约基本信息
        console.log("📋 合约基本信息:");
        console.log("名称:", await snakeCoin.name());
        console.log("符号:", await snakeCoin.symbol());
        console.log("最大供应量:", await snakeCoin.MAX_SUPPLY().toString());
        console.log("当前供应量:", await snakeCoin.totalSupply().toString());
        console.log("剩余供应量:", await snakeCoin.remainingSupply().toString());
        console.log("合约所有者:", await snakeCoin.owner());
        console.log("");

        // 2. 查看颜色配置
        console.log("🎨 当前颜色配置:");
        for (let i = 0; i < 10; i++) {
            const color = await snakeCoin.colors(i);
            console.log(`索引 ${i}: ${color}`);
        }
        console.log("");

        // 3. 查看路径配置
        console.log("🔄 当前路径配置:");
        for (let i = 0; i < 5; i++) { // 只显示前5个，避免输出过长
            const path = await snakeCoin.snakePaths(i);
            console.log(`索引 ${i}: ${path.substring(0, 50)}...`);
        }
        console.log("");

        // 4. 铸造一些NFT（只有所有者可以）
        if (owner.address === await snakeCoin.owner()) {
            console.log("🪙 铸造NFT...");
            
            // 铸造给用户1
            const mintTx1 = await snakeCoin.mint(user1.address, 3);
            await mintTx1.wait();
            console.log(`✅ 已铸造3个NFT给 ${user1.address}`);
            
            // 批量铸造给多个用户
            const recipients = [user1.address, user2.address];
            const batchMintTx = await snakeCoin.batchMint(recipients);
            await batchMintTx.wait();
            console.log(`✅ 已批量铸造给 ${recipients.length} 个地址`);
            
            console.log("当前供应量:", await snakeCoin.totalSupply().toString());
            console.log("");
        } else {
            console.log("⚠️  当前账户不是合约所有者，无法铸造");
            console.log("");
        }

        // 5. 生成SVG示例
        console.log("🎨 生成SVG示例:");
        for (let i = 0; i < Math.min(3, await snakeCoin.totalSupply()); i++) {
            if (await snakeCoin.exists(i)) {
                const svg = await snakeCoin.generateSnakeSVG(i);
                console.log(`Token #${i} SVG长度: ${svg.length} 字符`);
                console.log(`SVG预览: ${svg.substring(0, 100)}...`);
                console.log("");
            }
        }

        // 6. 获取tokenURI示例
        console.log("🔗 TokenURI示例:");
        for (let i = 0; i < Math.min(2, await snakeCoin.totalSupply()); i++) {
            if (await snakeCoin.exists(i)) {
                const tokenURI = await snakeCoin.tokenURI(i);
                console.log(`Token #${i} URI长度: ${tokenURI.length} 字符`);
                console.log(`URI格式: ${tokenURI.substring(0, 50)}...`);
                
                // 解析Base64数据
                const base64Data = tokenURI.replace("data:application/json;base64,", "");
                const jsonString = Buffer.from(base64Data, 'base64').toString();
                const metadata = JSON.parse(jsonString);
                
                console.log(`名称: ${metadata.name}`);
                console.log(`描述: ${metadata.description}`);
                console.log(`图像长度: ${metadata.image.length} 字符`);
                console.log(`属性数量: ${metadata.attributes.length}`);
                console.log("");
            }
        }

        // 7. 查看用户拥有的NFT
        console.log("👤 用户拥有的NFT:");
        const user1Balance = await snakeCoin.balanceOf(user1.address);
        const user2Balance = await snakeCoin.balanceOf(user2.address);
        
        console.log(`${user1.address}: ${user1Balance} 个NFT`);
        console.log(`${user2.address}: ${user2Balance} 个NFT`);
        console.log("");

        // 8. 演示颜色更新（只有所有者可以）
        if (owner.address === await snakeCoin.owner()) {
            console.log("🎨 更新颜色配置...");
            const newColor = "#FF0000"; // 红色
            const updateColorTx = await snakeCoin.updateColor(0, newColor);
            await updateColorTx.wait();
            console.log(`✅ 已将索引0的颜色更新为: ${newColor}`);
            
            // 验证更新
            const updatedColor = await snakeCoin.colors(0);
            console.log(`验证: 索引0的颜色现在是: ${updatedColor}`);
            console.log("");
        }

        // 9. 演示路径更新（只有所有者可以）
        if (owner.address === await snakeCoin.owner()) {
            console.log("🔄 更新路径配置...");
            const newPath = "M10,10 L90,90"; // 对角线
            const updatePathTx = await snakeCoin.updateSnakePath(0, newPath);
            await updatePathTx.wait();
            console.log(`✅ 已将索引0的路径更新为: ${newPath}`);
            
            // 验证更新
            const updatedPath = await snakeCoin.snakePaths(0);
            console.log(`验证: 索引0的路径现在是: ${updatedPath}`);
            console.log("");
        }

        // 10. 生成更新后的SVG
        console.log("🔄 更新后的SVG示例:");
        if (await snakeCoin.exists(0)) {
            const updatedSvg = await snakeCoin.generateSnakeSVG(0);
            console.log(`Token #0 更新后SVG长度: ${updatedSvg.length} 字符`);
            console.log(`更新后SVG预览: ${updatedSvg.substring(0, 100)}...`);
            console.log("");
        }

        console.log("🎉 交互示例完成！");
        console.log("💡 提示: 可以在Etherscan上查看生成的SVG图像");
        console.log("🔗 合约地址:", contractAddress);

    } catch (error) {
        console.error("❌ 交互过程中出现错误:", error.message);
        
        if (error.message.includes("YOUR_CONTRACT_ADDRESS_HERE")) {
            console.log("\n💡 解决方案:");
            console.log("1. 先运行部署脚本: npx hardhat run scripts/deploy.js --network <your-network>");
            console.log("2. 将部署脚本输出的合约地址复制到 scripts/interact.js 中");
            console.log("3. 重新运行此脚本");
        }
    }
}

// 运行脚本
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 脚本执行失败:", error);
        process.exit(1);
    });
