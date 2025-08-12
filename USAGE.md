# 🐍 蛇币NFT - 使用说明

## 📋 项目概述

蛇币是一个创新的生成式NFT项目，完全在区块链上生成独特的蛇形图案。每个NFT都是根据其tokenId动态生成的，无需存储元数据，所有图像都在链上实时生成。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 编译合约
```bash
npm run compile
```

### 3. 运行测试
```bash
npm test
```

### 4. 启动本地节点（可选）
```bash
npm run node
```

### 5. 部署合约
```bash
# 部署到本地网络
npm run deploy:local

# 部署到测试网
npm run deploy:testnet

# 部署到主网
npm run deploy:mainnet
```

### 6. 与合约交互
```bash
npm run interact
```

### 7. 查看演示页面
```bash
npm run demo
```

## 🔧 配置网络

在 `hardhat.config.js` 中配置您的网络：

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    testnet: {
      url: process.env.TESTNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

创建 `.env` 文件：
```env
PRIVATE_KEY=your_private_key_here
TESTNET_RPC_URL=https://testnet.rpc.url
MAINNET_RPC_URL=https://mainnet.rpc.url
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

### 铸造NFT
```javascript
// 只有合约所有者可以铸造
const mintTx = await snakeCoin.mint(userAddress, amount);
await mintTx.wait();
```

### 批量铸造
```javascript
const recipients = [address1, address2, address3];
const batchMintTx = await snakeCoin.batchMint(recipients);
await batchMintTx.wait();
```

## 🎨 自定义配置

### 更新颜色
```javascript
// 只有合约所有者可以更新
const newColor = "#FF0000"; // 红色
const updateColorTx = await snakeCoin.updateColor(0, newColor);
await updateColorTx.wait();
```

### 更新路径
```javascript
const newPath = "M10,10 L90,90"; // 对角线
const updatePathTx = await snakeCoin.updateSnakePath(0, newPath);
await updatePathTx.wait();
```

## 📊 合约函数

### 铸造函数
- `mint(address to, uint256 amount)` - 铸造指定数量的NFT
- `batchMint(address[] recipients)` - 批量铸造给多个地址

### 查询函数
- `totalSupply()` - 获取当前铸造数量
- `remainingSupply()` - 获取剩余可铸造数量
- `exists(uint256 tokenId)` - 检查tokenId是否存在
- `generateSnakeSVG(uint256 tokenId)` - 生成SVG图像
- `tokenURI(uint256 tokenId)` - 获取NFT元数据

### 管理函数
- `updateColor(uint256 index, string newColor)` - 更新颜色映射
- `updateSnakePath(uint256 index, string newPath)` - 更新蛇形路径

### 常量
- `MAX_SUPPLY` - 最大供应量：10,000,000

## 🧪 测试

项目包含完整的测试套件：

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npx hardhat test test/SnakeCoin.js

# 运行测试并显示详细输出
npx hardhat test --verbose
```

测试覆盖：
- 合约部署和初始化
- NFT铸造功能
- SVG生成算法
- 元数据生成
- 权限控制
- 边界情况处理

## 🌐 部署到不同网络

### 本地网络
```bash
# 启动本地节点
npm run node

# 在另一个终端部署
npm run deploy:local
```

### 测试网（如Sepolia）
```bash
# 确保有测试网ETH
npm run deploy:testnet
```

### 主网
```bash
# 确保有主网ETH
npm run deploy:mainnet
```

## 📱 演示页面

演示页面位于 `demo/index.html`，展示了：

- NFT生成效果
- 不同Token ID的图案
- 颜色和路径配置
- 响应式设计

打开方式：
```bash
npm run demo
```

或在浏览器中直接打开 `demo/index.html` 文件。

## 🔍 Etherscan验证

部署后，您可以在Etherscan上验证合约：

1. 复制合约地址
2. 在Etherscan上搜索地址
3. 点击"Contract"标签
4. 点击"Verify and Publish"
5. 选择编译器版本和优化设置
6. 上传源代码进行验证

## 🚨 注意事项

1. **私钥安全**: 永远不要将私钥提交到代码仓库
2. **测试网**: 先在测试网上测试所有功能
3. **Gas费用**: 部署和交互需要支付Gas费用
4. **权限控制**: 只有合约所有者可以铸造和更新配置
5. **供应量限制**: 最大供应量为10,000,000个

## 🆘 常见问题

### Q: 编译失败怎么办？
A: 检查Solidity版本和依赖是否正确安装

### Q: 部署失败怎么办？
A: 检查网络配置、账户余额和私钥是否正确

### Q: 如何查看生成的SVG？
A: 使用 `generateSnakeSVG()` 函数或查看Etherscan上的合约

### Q: 可以修改颜色和路径吗？
A: 可以，但只有合约所有者有权限

## 📞 获取帮助

- 查看测试文件了解功能用法
- 检查合约代码注释
- 提交GitHub Issue
- 查看Hardhat文档

## 🎯 下一步

1. 部署到测试网
2. 测试所有功能
3. 自定义颜色和路径
4. 集成到前端应用
5. 部署到主网

---

**祝您使用愉快！** 🐍✨
