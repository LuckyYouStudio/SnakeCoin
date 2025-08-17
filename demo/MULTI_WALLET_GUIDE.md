# LuckSnake 多钱包支持指南

## 🎯 功能概述

LuckSnake 前端现在支持两种钱包：
- **MetaMask** 🦊 - 最流行的以太坊钱包
- **LuckYou Wallet** 🍀 - 您的自定义钱包扩展

## 🚀 快速开始

### 1. 访问多钱包版本
```
http://localhost:3000/lucksnake-multi-wallet.html
```

### 2. 钱包检测
页面会自动检测已安装的钱包：
- ✅ **可用** - 钱包已安装且可连接
- ❌ **未安装** - 钱包未检测到

### 3. 连接流程
1. 选择想要使用的钱包
2. 点击"连接选中的钱包"
3. 在钱包扩展中确认连接
4. 开始使用 LuckSnake 功能

## 🔧 技术实现

### 钱包检测逻辑

#### MetaMask 检测
```javascript
window.ethereum && window.ethereum.isMetaMask
```

#### LuckYou Wallet 检测
```javascript
window.luckyouWallet || 
(window.ethereum && window.ethereum.isLuckYouWallet)
```

### 钱包配置
```javascript
const walletConfigs = {
    metamask: {
        name: 'MetaMask',
        icon: '🦊',
        checkFunction: () => window.ethereum && window.ethereum.isMetaMask,
        getProvider: () => window.ethereum
    },
    luckyou: {
        name: 'LuckYou Wallet',
        icon: '🍀',
        checkFunction: () => window.luckyouWallet || 
                            (window.ethereum && window.ethereum.isLuckYouWallet),
        getProvider: () => window.luckyouWallet || 
                          (window.ethereum && window.ethereum.isLuckYouWallet ? window.ethereum : null)
    }
};
```

## 🎮 功能特性

### 智能钱包切换
- 自动检测已连接的钱包
- 支持钱包间切换
- 保持连接状态

### 统一接口
- 所有钱包使用相同的 Web3 接口
- 一致的用户体验
- 相同的功能支持

### 事件监听
- 账户变化检测
- 网络切换处理
- 连接状态管理

## 🧪 测试方案

### 1. MetaMask 测试
1. 确保已安装 MetaMask 扩展
2. 连接到本地网络 (Chain ID: 31337)
3. 导入测试账户
4. 测试所有功能

### 2. LuckYou Wallet 测试
1. 安装 LuckYou Wallet 扩展
2. 配置本地网络
3. 导入测试账户
4. 测试所有功能

### 3. 多钱包共存测试
1. 同时安装两个钱包
2. 测试钱包选择功能
3. 测试钱包切换
4. 验证功能一致性

## 🔍 调试信息

### 控制台日志
前端会输出详细的调试信息：
```
Initializing multi-wallet app...
MetaMask available: true
LuckYou Wallet available: true
Connecting to MetaMask...
Wallet connected successfully!
```

### 常见问题

#### Q: 为什么看不到我的钱包？
A: 确保钱包扩展已正确安装并刷新页面

#### Q: 连接失败怎么办？
A: 检查网络配置和账户权限

#### Q: 两个钱包冲突怎么办？
A: 使用钱包选择功能，手动选择要使用的钱包

## 📱 用户界面

### 钱包选择区域
- 卡片式布局显示可用钱包
- 视觉状态指示器
- 点击选择交互

### 连接状态显示
- 当前连接的钱包类型
- 账户地址和余额
- 网络信息

### 功能区域
- 数字生成功能
- 查询功能
- 用户数字显示

## 🛠️ 开发者说明

### 扩展其他钱包
要添加新钱包支持，只需在 `walletConfigs` 中添加配置：

```javascript
newWallet: {
    name: 'New Wallet',
    icon: '💫',
    description: 'New Wallet Description',
    checkFunction: () => window.newWallet,
    getProvider: () => window.newWallet
}
```

### 事件处理
所有钱包事件都通过统一的处理器管理：
- `accountsChanged`
- `chainChanged`
- `connect`
- `disconnect`

## 🔐 安全考虑

1. **权限管理** - 只请求必要的权限
2. **数据验证** - 验证所有用户输入
3. **错误处理** - 优雅处理连接错误
4. **状态管理** - 安全的状态切换

## 📞 支持

如有问题或建议，请：
1. 检查浏览器控制台错误信息
2. 验证钱包扩展状态
3. 确认网络配置正确
4. 查看交易哈希获取详细信息

---

**注意**: 确保在测试前部署了 LuckSnake 合约并更新了前端中的合约地址。