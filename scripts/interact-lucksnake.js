const { ethers } = require("hardhat");

async function main() {
    console.log("开始与LuckSnake合约交互...");
    
    // 合约地址（从部署中获取）
    const contractAddress = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    
    // 获取签名者
    const [owner, user1, user2, user3] = await ethers.getSigners();
    console.log("Owner:", owner.address);
    console.log("User1:", user1.address);
    console.log("User2:", user2.address);
    console.log("User3:", user3.address);
    
    // 连接到已部署的合约
    const LuckSnake = await ethers.getContractFactory("LuckSnake");
    const luckSnake = LuckSnake.attach(contractAddress);
    
    console.log("\n合约信息:");
    console.log("合约地址:", await luckSnake.getAddress());
    console.log("合约所有者:", await luckSnake.owner());
    
    const generationPrice = await luckSnake.GENERATION_PRICE();
    console.log("生成价格:", ethers.formatEther(generationPrice), "ETH");
    
    // 检查当前状态
    console.log("\n当前状态:");
    const systemInfo = await luckSnake.getSystemInfo();
    console.log("已生成数字:", systemInfo.totalGenerated.toString());
    console.log("剩余数字:", systemInfo.remaining.toString());
    console.log("合约余额:", ethers.formatEther(systemInfo.contractBalance), "ETH");
    
    // 多用户生成数字测试
    console.log("\n=== 多用户生成数字测试 ===");
    
    const users = [user1, user2, user3];
    const userNumbers = {};
    
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        console.log(`\n用户 ${i + 1} (${user.address}) 生成数字:`);
        
        try {
            const tx = await luckSnake.connect(user).generateNumber({ value: generationPrice });
            const receipt = await tx.wait();
            
            // 查找事件
            const event = receipt.logs.find(log => {
                try {
                    const parsed = luckSnake.interface.parseLog(log);
                    return parsed.name === "NumberGenerated";
                } catch (e) {
                    return false;
                }
            });
            
            if (event) {
                const parsedEvent = luckSnake.interface.parseLog(event);
                const generatedNumber = parsedEvent.args.number.toString();
                console.log("生成的数字:", generatedNumber);
                userNumbers[user.address] = generatedNumber;
            }
            
            // 检查用户数字
            const numbers = await luckSnake.getUserNumbers(user.address);
            console.log("用户拥有的数字:", numbers.map(n => n.toString()));
            
        } catch (error) {
            console.error("生成数字失败:", error.message);
        }
    }
    
    // 测试重复生成
    console.log("\n=== 用户重复生成数字测试 ===");
    
    for (let i = 0; i < 2; i++) {
        console.log(`\nUser1 生成第 ${i + 2} 个数字:`);
        
        try {
            const tx = await luckSnake.connect(user1).generateNumber({ value: generationPrice });
            const receipt = await tx.wait();
            
            const event = receipt.logs.find(log => {
                try {
                    const parsed = luckSnake.interface.parseLog(log);
                    return parsed.name === "NumberGenerated";
                } catch (e) {
                    return false;
                }
            });
            
            if (event) {
                const parsedEvent = luckSnake.interface.parseLog(event);
                console.log("生成的数字:", parsedEvent.args.number.toString());
            }
            
            const numbers = await luckSnake.getUserNumbers(user1.address);
            console.log("User1现在拥有的数字:", numbers.map(n => n.toString()));
            
        } catch (error) {
            console.error("生成数字失败:", error.message);
        }
    }
    
    // 查询功能测试
    console.log("\n=== 查询功能测试 ===");
    
    // 检查所有用户的数字
    for (const user of users) {
        const numbers = await luckSnake.getUserNumbers(user.address);
        console.log(`${user.address} 拥有的数字:`, numbers.map(n => n.toString()));
        console.log(`数字数量:`, await luckSnake.getUserNumberCount(user.address));
        
        // 验证数字所有权
        for (const number of numbers) {
            const owner = await luckSnake.getNumberOwner(number);
            const isTaken = await luckSnake.isNumberTaken(number);
            console.log(`  数字 ${number}: 所有者=${owner}, 已占用=${isTaken}`);
        }
    }
    
    // 测试无效查询
    console.log("\n=== 边界条件测试 ===");
    
    try {
        await luckSnake.getNumberOwner(1000); // 超出范围
        console.log("错误：应该拒绝无效数字查询");
    } catch (error) {
        console.log("正确：拒绝了无效数字查询");
    }
    
    // 检查未使用的数字
    console.log("\n检查几个未使用的数字:");
    const testNumbers = [1, 100, 500, 888, 999];
    for (const num of testNumbers) {
        const isTaken = await luckSnake.isNumberTaken(num);
        const owner = await luckSnake.getNumberOwner(num);
        console.log(`数字 ${num}: 已占用=${isTaken}, 所有者=${owner}`);
    }
    
    // 测试支付功能
    console.log("\n=== 支付功能测试 ===");
    
    // 测试支付不足
    try {
        const insufficientPayment = ethers.parseEther("0.00005");
        await luckSnake.connect(user2).generateNumber({ value: insufficientPayment });
        console.log("错误：应该拒绝支付不足");
    } catch (error) {
        console.log("正确：拒绝了支付不足");
    }
    
    // 测试超额支付
    console.log("\n测试超额支付和退款:");
    const initialBalance = await ethers.provider.getBalance(user2.address);
    console.log("User2初始余额:", ethers.formatEther(initialBalance), "ETH");
    
    const overpayment = ethers.parseEther("0.0002"); // 超额支付
    const tx = await luckSnake.connect(user2).generateNumber({ value: overpayment });
    const receipt = await tx.wait();
    
    const finalBalance = await ethers.provider.getBalance(user2.address);
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    const actualCost = initialBalance - finalBalance;
    const expectedCost = generationPrice + gasUsed;
    
    console.log("User2最终余额:", ethers.formatEther(finalBalance), "ETH");
    console.log("实际支付:", ethers.formatEther(actualCost), "ETH");
    console.log("预期支付:", ethers.formatEther(expectedCost), "ETH");
    console.log("退款是否正确:", actualCost === expectedCost ? "是" : "否");
    
    // 管理员功能测试
    console.log("\n=== 管理员功能测试 ===");
    
    const contractBalance = await luckSnake.getContractBalance();
    console.log("提取前合约余额:", ethers.formatEther(contractBalance), "ETH");
    
    if (contractBalance > 0) {
        const ownerInitialBalance = await ethers.provider.getBalance(owner.address);
        
        console.log("所有者提取资金...");
        const withdrawTx = await luckSnake.connect(owner).withdrawFunds();
        const withdrawReceipt = await withdrawTx.wait();
        
        const ownerFinalBalance = await ethers.provider.getBalance(owner.address);
        const finalContractBalance = await luckSnake.getContractBalance();
        
        console.log("提取后合约余额:", ethers.formatEther(finalContractBalance), "ETH");
        console.log("所有者余额增加:", ethers.formatEther(ownerFinalBalance - ownerInitialBalance), "ETH");
    }
    
    // 测试非所有者权限
    try {
        await luckSnake.connect(user1).withdrawFunds();
        console.log("错误：非所有者不应该能提取资金");
    } catch (error) {
        console.log("正确：非所有者无法提取资金");
    }
    
    // 最终状态报告
    console.log("\n=== 最终状态报告 ===");
    const finalSystemInfo = await luckSnake.getSystemInfo();
    console.log("最终已生成数字:", finalSystemInfo.totalGenerated.toString());
    console.log("最终剩余数字:", finalSystemInfo.remaining.toString());
    console.log("最终合约余额:", ethers.formatEther(finalSystemInfo.contractBalance), "ETH");
    
    // 统计所有用户
    console.log("\n所有用户数字统计:");
    for (const user of [owner, user1, user2, user3]) {
        const count = await luckSnake.getUserNumberCount(user.address);
        const numbers = await luckSnake.getUserNumbers(user.address);
        console.log(`${user.address}: ${count} 个数字`, numbers.map(n => n.toString()));
    }
    
    console.log("\n交互测试完成！");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("交互测试失败:", error);
        process.exit(1);
    });