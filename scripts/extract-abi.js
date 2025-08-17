const fs = require('fs');

function extractABI() {
    try {
        // 读取编译后的合约文件
        const contractJson = JSON.parse(fs.readFileSync('./artifacts/contracts/NumberCoin.sol/NumberCoin.json', 'utf8'));
        
        // 提取ABI
        const abi = contractJson.abi;
        
        // 过滤出我们需要的函数
        const filteredABI = abi.filter(item => {
            return item.type === 'function' && [
                'name', 'symbol', 'MAX_SUPPLY', 'lotteryPrice', 'getPoolSize', 
                'totalSupply', 'remainingSupply', 'playLottery', 'generateNumberSVG',
                'ownerOf', 'tokenURI', 'balanceOf', 'getLotteryInfo'
            ].includes(item.name);
        });
        
        // 添加事件
        const events = abi.filter(item => {
            return item.type === 'event' && item.name === 'LotteryWon';
        });
        
        const fullABI = [...filteredABI, ...events];
        
        console.log('完整的合约ABI:');
        console.log(JSON.stringify(fullABI, null, 2));
        
        // 保存到文件
        fs.writeFileSync('./contract-abi.json', JSON.stringify(fullABI, null, 2));
        console.log('\nABI已保存到 contract-abi.json');
        
        return fullABI;
        
    } catch (error) {
        console.error('提取ABI失败:', error);
        return null;
    }
}

extractABI();