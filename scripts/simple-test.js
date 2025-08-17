// 简单的合约测试脚本 - 专门测试Web3.js兼容性
const fs = require('fs');

async function main() {
    console.log('🧪 开始简单合约测试...');
    
    try {
        // 读取部署信息
        const deploymentPath = './deployment-numbercoin.json';
        if (!fs.existsSync(deploymentPath)) {
            throw new Error('部署文件不存在，请先部署合约');
        }
        
        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        const contractAddress = deployment.contractAddress;
        
        console.log('📋 合约地址:', contractAddress);
        
        // 连接到Hardhat本地网络
        const [owner] = await ethers.getSigners();
        console.log('📋 测试账户:', owner.address);
        
        // 获取合约实例
        const NumberCoin = await ethers.getContractFactory('NumberCoin');
        const contract = NumberCoin.attach(contractAddress);
        
        console.log('📊 测试基础函数...');
        
        // 测试数字函数（这些应该工作正常）
        const maxSupply = await contract.MAX_SUPPLY();
        console.log('✅ MAX_SUPPLY:', maxSupply.toString());
        
        const poolSize = await contract.getPoolSize();
        console.log('✅ Pool Size:', poolSize.toString());
        
        const lotteryPrice = await contract.lotteryPrice();
        console.log('✅ Lottery Price:', ethers.formatEther(lotteryPrice), 'ETH');
        
        const lotteryInfo = await contract.getLotteryInfo();
        console.log('✅ Lottery Info:', {
            price: ethers.formatEther(lotteryInfo.price),
            poolSize: lotteryInfo.poolSize.toString(),
            totalMinted: lotteryInfo.totalMinted.toString(),
            remaining: lotteryInfo.remaining.toString()
        });
        
        // 测试字符串函数（这些可能有问题）
        console.log('📊 测试字符串函数...');
        
        try {
            const name = await contract.name();
            console.log('✅ Contract Name:', name);
        } catch (error) {
            console.error('❌ name() 失败:', error.message);
        }
        
        try {
            const symbol = await contract.symbol();
            console.log('✅ Contract Symbol:', symbol);
        } catch (error) {
            console.error('❌ symbol() 失败:', error.message);
        }
        
        // 测试总供应量
        try {
            const totalSupply = await contract.totalSupply();
            console.log('✅ Total Supply:', totalSupply.toString());
        } catch (error) {
            console.error('❌ totalSupply() 失败:', error.message);
        }
        
        console.log('🎉 基础测试完成！');
        
        // 如果池子大小大于0，测试一次抽奖
        if (poolSize > 0) {
            console.log('🎲 测试抽奖功能...');
            try {
                const balanceBefore = await owner.provider.getBalance(owner.address);
                
                const tx = await contract.playLottery({
                    value: lotteryPrice
                });
                
                console.log('📝 抽奖交易提交:', tx.hash);
                const receipt = await tx.wait();
                console.log('✅ 抽奖交易确认，Gas使用:', receipt.gasUsed.toString());
                
                // 检查事件
                const events = receipt.logs;
                for (const event of events) {
                    if (event.fragment && event.fragment.name === 'LotteryWon') {
                        console.log('🎉 抽奖成功！TokenID:', event.args.tokenId.toString());
                        
                        // 测试NFT函数
                        try {
                            const ownerOf = await contract.ownerOf(event.args.tokenId);
                            console.log('✅ NFT Owner:', ownerOf);
                            
                            const tokenURI = await contract.tokenURI(event.args.tokenId);
                            console.log('✅ Token URI 长度:', tokenURI.length);
                            
                            const svg = await contract.generateNumberSVG(event.args.tokenId);
                            console.log('✅ SVG 长度:', svg.length);
                            
                        } catch (nftError) {
                            console.error('❌ NFT函数测试失败:', nftError.message);
                        }
                        break;
                    }
                }
                
                const balanceAfter = await owner.provider.getBalance(owner.address);
                console.log('💰 余额变化:', ethers.formatEther(balanceBefore - balanceAfter), 'ETH');
                
            } catch (lotteryError) {
                console.error('❌ 抽奖测试失败:', lotteryError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ 脚本执行失败:', error);
        process.exit(1);
    });