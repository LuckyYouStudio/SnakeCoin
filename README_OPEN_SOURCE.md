# 🐍 LuckSnake - 幸运数字生成器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-blue.svg)](https://sepolia.etherscan.io/address/0xe342E701f808D942FF70a5a48E596fF9056406F7)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-red.svg)](https://docs.soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Tested-green.svg)](https://hardhat.org/)

> 一个去中心化的幸运数字生成器，支持MetaMask和LuckYou钱包

## 🎯 项目简介

LuckSnake是一个基于以太坊的智能合约应用，用户可以支付0.0001 ETH生成000-999范围内的唯一随机数字。每个数字只能被生成一次，确保稀缺性和唯一性。

### ✨ 核心特性

- 🎲 **随机数字生成**: 支付0.0001 ETH获取000-999的唯一数字
- 🔒 **防重复机制**: 每个数字只能生成一次
- 👥 **多钱包支持**: 支持MetaMask和LuckYou钱包
- 🌐 **多网络部署**: 支持本地测试网和Sepolia测试网
- 📱 **响应式前端**: 适配桌面和移动设备
- 🔍 **完整查询**: 查询用户数字和数字所有者

## 📍 部署信息

### Sepolia测试网
- **合约地址**: `0xe342E701f808D942FF70a5a48E596fF9056406F7`
- **网络**: Sepolia (Chain ID: 11155111)
- **Etherscan**: [查看合约](https://sepolia.etherscan.io/address/0xe342E701f808D942FF70a5a48E596fF9056406F7)
- **源码验证**: ✅ 已验证

## 🚀 快速开始

### 前提条件

- Node.js >= 16.0.0
- npm 或 yarn
- MetaMask 或 LuckYou 钱包
- Sepolia ETH (从[水龙头](https://sepoliafaucet.com/)获取)

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
npm test
```

### 部署到本地网络

```bash
# 启动本地节点
npx hardhat node

# 部署合约
npx hardhat run scripts/deploy-lucksnake.js --network localhost
```

### 部署到Sepolia

```bash
# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的私钥和RPC URL

# 部署到Sepolia
npx hardhat run scripts/deploy-lucksnake-sepolia.js --network sepolia
```

## 💻 前端使用

### 启动前端服务器

```bash
cd demo
node server.js
```

### 访问地址

- **本地版本**: http://localhost:3000/lucksnake-multi-wallet.html
- **Sepolia版本**: http://localhost:3000/lucksnake-sepolia.html

## 🔧 技术栈

### 智能合约
- **Solidity**: 0.8.28
- **OpenZeppelin**: 安全的合约库
- **Hardhat**: 开发框架
- **Ethers.js**: 以太坊交互库

### 前端
- **HTML/CSS/JavaScript**: 原生Web技术
- **Ethers.js**: Web3集成
- **响应式设计**: 支持多设备

### 安全特性
- **ReentrancyGuard**: 防重入攻击
- **Ownable**: 权限控制
- **输入验证**: 完整的参数检查

## 📊 合约功能

### 核心函数

```solidity
// 生成随机数字
function generateNumber() external payable

// 查询用户拥有的数字
function getUserNumbers(address user) external view returns (uint256[])

// 查询数字的所有者
function getNumberOwner(uint256 number) external view returns (address)

// 检查数字是否已被占用
function isNumberTaken(uint256 number) external view returns (bool)

// 获取系统信息
function getSystemInfo() external view returns (uint256, uint256, uint256, uint256)
```

### 事件

```solidity
event NumberGenerated(address indexed user, uint256 indexed number, uint256 price);
```

## 🧪 测试覆盖

项目包含25个测试用例，覆盖：

- ✅ 合约部署和初始化
- ✅ 数字生成功能
- ✅ 查询功能
- ✅ 防重复逻辑
- ✅ 权限控制
- ✅ 边界条件
- ✅ 安全性测试

```bash
# 运行完整测试套件
npm test

# 运行特定测试
npx hardhat test test/LuckSnake.js
```

## 🎮 使用指南

### 1. 连接钱包
1. 打开前端页面
2. 选择MetaMask或LuckYou钱包
3. 点击"连接钱包"
4. 确认网络为Sepolia测试网

### 2. 生成数字
1. 确保钱包有足够的Sepolia ETH
2. 点击"生成数字"按钮
3. 确认交易 (费用: 0.0001 ETH + Gas费)
4. 等待交易确认
5. 查看生成的幸运数字

### 3. 查询功能
- **查询用户数字**: 输入地址查看拥有的数字
- **查询数字所有者**: 输入数字查看所有者

## 📁 项目结构

```
LuckSnake/
├── contracts/           # 智能合约
│   └── LuckSnake.sol   # 主合约
├── scripts/            # 部署脚本
│   ├── deploy-lucksnake.js
│   └── deploy-lucksnake-sepolia.js
├── test/               # 测试文件
│   └── LuckSnake.js
├── demo/               # 前端演示
│   ├── lucksnake-multi-wallet.html
│   ├── lucksnake-sepolia.html
│   └── server.js
├── docs/               # 项目文档
├── hardhat.config.js   # Hardhat配置
├── package.json        # 项目依赖
└── README.md          # 项目说明
```

## 🛡️ 安全考虑

### 智能合约安全
- **重入攻击防护**: 使用ReentrancyGuard
- **权限控制**: 关键函数仅限所有者
- **输入验证**: 严格的参数检查
- **随机数生成**: 多因子伪随机数

### 前端安全
- **钱包权限**: 最小权限原则
- **交易验证**: 完整的错误处理
- **网络检查**: 自动验证正确网络

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 开发规范
- 遵循 Solidity 最佳实践
- 添加完整的测试覆盖
- 更新相关文档
- 保持代码风格一致

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- **合约地址**: [0xe342E701f808D942FF70a5a48E596fF9056406F7](https://sepolia.etherscan.io/address/0xe342E701f808D942FF70a5a48E596fF9056406F7)
- **Etherscan**: [源码验证](https://sepolia.etherscan.io/address/0xe342E701f808D942FF70a5a48E596fF9056406F7#code)
- **Sepolia水龙头**: [获取测试ETH](https://sepoliafaucet.com/)

## 📞 联系我们

如有问题或建议，请：

1. 创建 GitHub Issue
2. 检查 [故障排除文档](docs/TROUBLESHOOTING.md)
3. 查看 [FAQ](docs/FAQ.md)

## 🙏 致谢

感谢以下项目和社区：

- [OpenZeppelin](https://openzeppelin.com/) - 安全的智能合约库
- [Hardhat](https://hardhat.org/) - 以太坊开发框架
- [Ethers.js](https://ethers.org/) - 以太坊JavaScript库

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！

🐍 **LuckSnake** - 让每个数字都带来好运！