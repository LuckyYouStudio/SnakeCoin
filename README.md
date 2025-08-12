# 🐍 蛇币 (SnakeCoin) - 生成式NFT

蛇币是一个创新的生成式NFT项目，完全在区块链上生成独特的蛇形图案。每个NFT都是根据其tokenId动态生成的，无需存储元数据，所有图像都在链上实时生成。

## ✨ 特性

- **🎨 链上SVG生成**: 每个NFT的图案都在智能合约中动态生成
- **🔢 固定总量**: 最多1,000万个代币（0-9,999,999）
- **🌈 动态颜色**: 0-9数字映射到10种独特的十六进制颜色
- **🔄 无需存储**: tokenURI动态返回Base64编码的JSON+SVG
- **👑 所有者控制**: 只有合约所有者可以铸造和更新配置
- **📱 Etherscan预览**: 可在Etherscan上直接预览生成的SVG图像

## 🏗️ 技术架构

### 智能合约
- **标准**: ERC-721 (NFT标准)
- **语言**: Solidity 0.8.20
- **框架**: OpenZeppelin Contracts
- **网络**: 兼容所有EVM兼容区块链

### 核心功能
1. **SVG生成**: `generateSnakeSVG(tokenId)` - 根据tokenId生成SVG
2. **动态元数据**: `tokenURI(tokenId)` - 返回Base64编码的JSON+SVG
3. **铸造管理**: `mint()` 和 `batchMint()` - 控制NFT发行
4. **配置更新**: `updateColor()` 和 `updateSnakePath()` - 自定义外观

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 编译合约
```bash
npx hardhat compile
```

### 运行测试
```bash
npx hardhat test
```

### 部署合约
```bash
npx hardhat run scripts/deploy.js --network <your-network>
```

## 📊 合约接口

### 主要函数

#### 铸造函数
- `mint(address to, uint256 amount)` - 铸造指定数量的NFT
- `batchMint(address[] recipients)` - 批量铸造给多个地址

#### 查询函数
- `totalSupply()` - 获取当前铸造数量
- `remainingSupply()` - 获取剩余可铸造数量
- `exists(uint256 tokenId)` - 检查tokenId是否存在
- `generateSnakeSVG(uint256 tokenId)` - 生成SVG图像

#### 管理函数
- `updateColor(uint256 index, string newColor)` - 更新颜色映射
- `updateSnakePath(uint256 index, string newPath)` - 更新蛇形路径

### 常量
- `MAX_SUPPLY` - 最大供应量：10,000,000

## 🎨 生成算法

每个NFT的图案由以下元素组成：

1. **背景渐变**: 使用tokenId的前两位数字作为渐变色
2. **主蛇形路径**: 使用第三位数字选择路径模板
3. **次蛇形路径**: 使用第四位数字选择路径模板
4. **装饰圆点**: 使用第五位数字确定位置
5. **文本标签**: 显示完整的7位蛇码

### 颜色映射
```
0: #FF6B6B (红色)    5: #DDA0DD (紫色)
1: #4ECDC4 (青色)    6: #FFB347 (橙色)
2: #45B7D1 (蓝色)    7: #87CEEB (天蓝色)
3: #96CEB4 (绿色)    8: #98FB98 (浅绿色)
4: #FFEAA7 (黄色)    9: #F0E68C (卡其色)
```

### 路径模板
包含10种不同的SVG路径，从简单的直线到复杂的贝塞尔曲线，确保每个NFT都有独特的视觉效果。

## 🔧 自定义配置

### 更新颜色
```solidity
// 将索引0的颜色改为红色
await snakeCoin.updateColor(0, "#FF0000");
```

### 更新路径
```solidity
// 将索引0的路径改为自定义路径
await snakeCoin.updateSnakePath(0, "M10,10 L50,50");
```

## 📱 前端集成

### 获取NFT元数据
```javascript
const tokenURI = await snakeCoin.tokenURI(tokenId);
const base64Data = tokenURI.replace("data:application/json;base64,", "");
const metadata = JSON.parse(atob(base64Data));

// metadata.image 包含Base64编码的SVG
// metadata.attributes 包含NFT属性
```

### 直接获取SVG
```javascript
const svg = await snakeCoin.generateSnakeSVG(tokenId);
// 可以直接在HTML中使用
document.getElementById('nft-container').innerHTML = svg;
```

## 🧪 测试

项目包含完整的测试套件，覆盖：
- 合约部署和初始化
- NFT铸造功能
- SVG生成算法
- 元数据生成
- 权限控制
- 边界情况处理

运行测试：
```bash
npx hardhat test
```

## 🌐 网络支持

合约兼容所有EVM兼容区块链：
- Ethereum (主网/测试网)
- Polygon
- BSC
- Arbitrum
- Optimism
- 其他EVM兼容链

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

- GitHub: [项目仓库](https://github.com/ls19920505/SnakeCoin)
- Issues: [GitHub Issues](https://github.com/ls19920505/SnakeCoin/issues)

---

**蛇币** - 让每个数字都成为独特的艺术品 🐍✨
