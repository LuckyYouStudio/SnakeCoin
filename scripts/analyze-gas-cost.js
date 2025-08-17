// 分析合约Gas费用问题

console.log("🔍 分析NumberCoin合约Gas费用问题...\n");

// 基本Gas费用常量 (EIP-1559后的大概值)
const GAS_COSTS = {
    SSTORE_SET: 20000,      // 设置一个新的存储槽
    SSTORE_RESET: 5000,     // 重置已存在的存储槽
    SSTORE_CLEAR: 15000,    // 清除存储槽 (获得refund)
    LOOP_ITERATION: 50,     // 循环迭代的基本费用
    COMPARISON: 3,          // 比较操作
    INCREMENT: 3            // 增量操作
};

const MAX_SUPPLY = 10_000_000;

console.log("📊 合约参数:");
console.log(`- MAX_SUPPLY: ${MAX_SUPPLY.toLocaleString()}`);
console.log(`- 需要初始化的存储槽数量: ${MAX_SUPPLY.toLocaleString()}\n`);

console.log("💰 Gas费用分析:");

// resetPool() 函数的Gas计算
const loopBasicCost = MAX_SUPPLY * (GAS_COSTS.LOOP_ITERATION + GAS_COSTS.COMPARISON + GAS_COSTS.INCREMENT);
const deleteCost = MAX_SUPPLY * GAS_COSTS.SSTORE_CLEAR;
const totalResetGas = loopBasicCost + deleteCost;

console.log(`1. resetPool() 函数:`);
console.log(`   - 循环基本费用: ${loopBasicCost.toLocaleString()} Gas`);
console.log(`   - 删除存储费用: ${deleteCost.toLocaleString()} Gas`);
console.log(`   - 总计: ${totalResetGas.toLocaleString()} Gas`);

// 转换为ETH (假设Gas价格为10 Gwei)
const gasPriceGwei = 10;
const gasPriceWei = gasPriceGwei * 1e9;
const costInEth = (totalResetGas * gasPriceWei) / 1e18;

console.log(`   - 在主网 (10 Gwei): ~${costInEth.toFixed(4)} ETH`);

// 以太坊主网的Gas限制
const MAINNET_GAS_LIMIT = 30_000_000;
console.log(`\n🚫 问题分析:`);
console.log(`- 以太坊主网Gas限制: ${MAINNET_GAS_LIMIT.toLocaleString()} Gas`);
console.log(`- resetPool() 需要: ${totalResetGas.toLocaleString()} Gas`);
console.log(`- 超出限制: ${((totalResetGas / MAINNET_GAS_LIMIT - 1) * 100).toFixed(1)}%`);

console.log(`\n🛠️ 解决方案:`);
console.log(`1. 懒加载 (Lazy Loading):`);
console.log(`   - 不预先初始化所有数字`);
console.log(`   - 在抽奖时动态生成随机数`);
console.log(`   - Gas费用: ~100,000 Gas/次抽奖`);

console.log(`\n2. 分批初始化:`);
const batchSize = 1000;
const batchCount = Math.ceil(MAX_SUPPLY / batchSize);
const batchGas = batchSize * GAS_COSTS.SSTORE_SET;
console.log(`   - 分批大小: ${batchSize.toLocaleString()}`);
console.log(`   - 需要批次: ${batchCount.toLocaleString()}`);
console.log(`   - 每批Gas: ~${batchGas.toLocaleString()} Gas`);

console.log(`\n3. 预计算范围:`);
const reducedSize = 100000; // 10万个数字
const reducedGas = reducedSize * GAS_COSTS.SSTORE_SET;
console.log(`   - 减少到: ${reducedSize.toLocaleString()} 个数字`);
console.log(`   - 初始化Gas: ~${reducedGas.toLocaleString()} Gas`);
console.log(`   - 主网费用 (10 Gwei): ~${((reducedGas * gasPriceWei) / 1e18).toFixed(4)} ETH`);

console.log(`\n💡 推荐方案:`);
console.log(`使用懒加载 + 链上随机数生成，无需预先初始化`);
console.log(`- 部署Gas: ~2,500,000 Gas`);
console.log(`- 抽奖Gas: ~100,000 Gas`);
console.log(`- 无初始化费用，完全去中心化`);