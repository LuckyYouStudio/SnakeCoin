const { ethers } = require("hardhat");

async function main() {
    console.log("开始部署蛇币NFT合约...");

    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // 部署合约
    const SnakeCoin = await ethers.getContractFactory("SnakeCoin");
    const snakeCoin = await SnakeCoin.deploy();
    
    await snakeCoin.waitForDeployment();
    const contractAddress = await snakeCoin.getAddress();
    
    console.log("蛇币NFT合约已部署到:", contractAddress);
    console.log("合约名称:", await snakeCoin.name());
    console.log("合约符号:", await snakeCoin.symbol());
    console.log("最大供应量:", await snakeCoin.MAX_SUPPLY().toString());
    console.log("当前供应量:", await snakeCoin.totalSupply().toString());
    console.log("剩余供应量:", await snakeCoin.remainingSupply().toString());
    
    // 验证部署
    console.log("\n验证部署...");
    const owner = await snakeCoin.owner();
    console.log("合约所有者:", owner);
    console.log("部署者是否为所有者:", owner === deployer.address);
    
    // 测试铸造功能
    console.log("\n测试铸造功能...");
    const testAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // 测试地址
    const mintAmount = 5;
    
    console.log(`铸造 ${mintAmount} 个NFT到地址: ${testAddress}`);
    const mintTx = await snakeCoin.mint(testAddress, mintAmount);
    await mintTx.wait();
    
    console.log("铸造完成！");
    console.log("当前供应量:", await snakeCoin.totalSupply().toString());
    console.log("剩余供应量:", await snakeCoin.remainingSupply().toString());
    
    // 测试SVG生成
    console.log("\n测试SVG生成...");
    const svg = await snakeCoin.generateSnakeSVG(0);
    console.log("SVG长度:", svg.length);
    console.log("SVG包含svg标签:", svg.includes("<svg"));
    
    // 测试tokenURI
    console.log("\n测试tokenURI...");
    const tokenURI = await snakeCoin.tokenURI(0);
    console.log("tokenURI长度:", tokenURI.length);
    console.log("tokenURI格式正确:", tokenURI.startsWith("data:application/json;base64,"));
    
    console.log("\n部署和测试完成！");
    console.log("合约地址:", contractAddress);
    console.log("可以在Etherscan上查看合约");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("部署失败:", error);
        process.exit(1);
    });
