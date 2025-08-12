# 🎲 蛇币NFT抽奖系统

## 📖 项目概述

蛇币NFT抽奖系统是一个创新的区块链应用，将生成式NFT与抽奖机制完美结合。用户支付ETH参与抽奖，获得独特的蛇形图案NFT，每个NFT都是基于数学算法在链上实时生成的。

## ✨ 核心特性

### 🎯 抽奖系统
- **支付抽奖**: 用户支付0.0001 ETH参与抽奖
- **随机分配**: 使用Fisher-Yates洗牌算法确保公平性
- **即时铸造**: 抽中后立即生成SVG并铸造NFT
- **智能池管理**: 自动管理可用的tokenId池

### 🐍 生成式NFT
- **链上SVG**: 完全在智能合约中生成图像
- **数学艺术**: 基于tokenId的7位数字生成独特图案
- **动态元数据**: tokenURI实时返回Base64编码的JSON+SVG
- **可定制性**: 支持更新颜色和路径配置

### 🔒 安全特性
- **防重入攻击**: 使用ReentrancyGuard保护
- **权限控制**: 仅合约所有者可执行管理操作
- **随机性保护**: 支持升级到Chainlink VRF等安全随机源

## 🏗️ 技术架构

### 智能合约
```solidity
contract SnakeCoin is ERC721, Ownable, ReentrancyGuard {
    // 抽奖价格
    uint256 public lotteryPrice = 0.01 ether;
    
    // NFT发放池
    mapping(uint256 => uint256) private _idPool;
    uint256 private _poolSize;
    
    // 随机性
    mapping(address => uint256) private _userNonce;
}
```

### 核心算法

#### Fisher-Yates洗牌算法
```solidity
function _initializePool() private {
    _poolSize = MAX_SUPPLY;
    for (uint256 i = 0; i < MAX_SUPPLY; i++) {
        _idPool[i] = i;
    }
}

// 随机选择并移除
uint256 randomIndex = _generateRandomNumber() % _poolSize;
uint256 tokenId = _idPool[randomIndex];
_idPool[randomIndex] = _idPool[_poolSize - 1];
_poolSize--;
```

#### 随机数生成
```solidity
function _generateRandomNumber() private view returns (uint256) {
    return uint256(
        keccak256(
            abi.encodePacked(
                blockhash(block.number - 1),
                msg.sender,
                _userNonce[msg.sender],
                block.timestamp,
                block.prevrandao
            )
        )
    );
}
```

## 🚀 快速开始

### 1. 环境准备
```bash
npm install
npm install @openzeppelin/contracts
```

### 2. 编译合约
```bash
.\compile.bat
```

### 3. 启动本地网络
```bash
start powershell -Command "npx hardhat node"
```

### 4. 部署合约
```bash
.\deploy-lottery.bat
```

### 5. 测试抽奖
```bash
.\interact-lottery.bat
```

## 💰 抽奖流程

### 用户参与
1. **支付费用**: 向合约发送0.0001 ETH
2. **随机选择**: 合约使用随机算法选择tokenId
3. **即时铸造**: 立即生成SVG并铸造NFT
4. **转移所有权**: NFT自动转移到用户账户

### 池子管理
- **初始化**: 部署时创建包含所有tokenId的池子
- **随机抽取**: 每次抽奖从池子中随机选择一个ID
- **动态更新**: 抽中的ID从池子中移除
- **重新填充**: 池子空时可重新初始化

## 🎨 NFT生成算法

### 7位数字解码
每个tokenId被解析为7位数字，每位数字控制不同的视觉元素：

```
Token ID: 1234567
解析为: [1,2,3,4,5,6,7]

位置0: 背景渐变色1
位置1: 背景渐变色2  
位置2: 主蛇形路径
位置3: 主路径颜色
位置4: 次蛇形路径
位置5: 次路径颜色
位置6: 装饰圆点位置
```

### SVG生成
```solidity
string memory svg = string(abi.encodePacked(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
    '<defs>',
    '<linearGradient id="grad', tokenId.toString(), '">',
    '<stop offset="0%" style="stop-color:', colors[digits[0]], '"/>',
    '<stop offset="100%" style="stop-color:', colors[digits[1]], '"/>',
    '</linearGradient>',
    '</defs>',
    '<rect width="100" height="100" fill="url(#grad', tokenId.toString(), ')" opacity="0.1"/>',
    '<path d="', snakePaths[digits[2]], '" stroke="', colors[digits[3]], '" stroke-width="3"/>',
    '<path d="', snakePaths[digits[4]], '" stroke="', colors[digits[5]], '" stroke-width="2"/>',
    '<circle cx="', (digits[6] * 10 + 5).toString(), '" cy="50" r="3" fill="', colors[digits[0]], '"/>',
    '</svg>'
));
```

## 🔧 管理功能

### 合约所有者权限
- **更新抽奖价格**: `updateLotteryPrice(uint256 newPrice)`
- **重新填充池子**: `refillPool()`
- **提取合约余额**: `withdrawBalance()`
- **更新颜色配置**: `updateColor(uint256 index, string memory newColor)`
- **更新路径配置**: `updateSnakePath(uint256 index, string memory newPath)`

### 查询功能
- **抽奖信息**: `getLotteryInfo()` - 返回价格、池子大小、铸造数量等
- **池子状态**: `getPoolSize()` - 当前可用tokenId数量
- **用户状态**: `getUserNonce(address user)` - 用户参与次数

## 📊 经济模型

### 收入来源
- **抽奖费用**: 每次抽奖收取0.0001 ETH
- **可调整价格**: 合约所有者可调整抽奖价格
- **自动收集**: 费用自动累积在合约中

### 成本结构
- **Gas费用**: 用户承担抽奖和铸造的gas费用
- **维护成本**: 合约部署和升级成本
- **随机性成本**: 可选的Chainlink VRF费用

## 🔮 未来扩展

### 随机性升级
- **Chainlink VRF**: 集成可验证随机函数
- **多链支持**: 扩展到其他EVM兼容链
- **随机性聚合**: 结合多个随机源

### 功能增强
- **批量抽奖**: 支持一次支付多次抽奖
- **稀有度系统**: 基于tokenId的稀有度分级
- **社区治理**: DAO治理抽奖参数
- **跨链桥接**: 支持NFT跨链转移

### 用户体验
- **前端界面**: 完整的Web3抽奖界面
- **移动应用**: 移动端抽奖体验
- **社交功能**: 分享和展示NFT
- **交易市场**: 内置NFT交易功能

## 🛡️ 安全考虑

### 当前实现
- **测试网随机性**: 使用blockhash + userNonce (有操纵风险)
- **防重入保护**: ReentrancyGuard防止重入攻击
- **权限控制**: 仅所有者可执行管理操作

### 生产环境建议
- **安全随机性**: 使用Chainlink VRF或类似服务
- **多重签名**: 关键操作需要多签确认
- **时间锁**: 重要参数更新需要时间锁
- **审计**: 第三方安全审计

## 📁 项目结构

```
SnakeCoinn/
├── contracts/
│   └── SnakeCoin.sol          # 主合约
├── scripts/
│   ├── deploy-lottery.js      # 抽奖版部署脚本
│   └── interact-lottery.js    # 抽奖功能交互脚本
├── demo/
│   ├── index.html             # 基础演示页面
│   └── lottery.html           # 抽奖演示页面
├── test/
│   └── SnakeCoin.js           # 测试套件
├── deploy-lottery.bat         # 抽奖版部署脚本
├── interact-lottery.bat       # 抽奖交互脚本
└── README-LOTTERY.md          # 本文档
```

## 🎯 使用场景

### 娱乐应用
- **游戏内奖励**: 游戏胜利后获得独特NFT
- **社区活动**: 社区抽奖和奖励发放
- **粉丝互动**: 艺术家与粉丝的互动方式

### 商业应用
- **营销活动**: 品牌推广和用户参与
- **会员福利**: VIP用户的专属奖励
- **产品促销**: 购买产品获得抽奖机会

### 教育应用
- **学习奖励**: 完成课程获得NFT证书
- **技能验证**: 技能认证的数字化表示
- **成就系统**: 学习成就的永久记录

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 开发环境
- Solidity ^0.8.20
- Hardhat ^2.26.3
- OpenZeppelin Contracts ^5.4.0

### 代码规范
- 遵循Solidity官方编码规范
- 添加完整的NatSpec注释
- 包含充分的测试用例

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 📞 联系方式

- **项目地址**: [GitHub](https://github.com/ls19920505/SnakeCoin)
- **问题反馈**: [Issues](https://github.com/ls19920505/SnakeCoin/issues)
- **讨论交流**: [Discussions](https://github.com/ls19920505/SnakeCoin/discussions)

---

**🎲 立即体验蛇币NFT抽奖系统，开启您的区块链艺术之旅！**
