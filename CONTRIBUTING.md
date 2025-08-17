# 🤝 贡献指南

感谢您对 LuckSnake 项目的兴趣！我们欢迎所有形式的贡献。

## 📋 贡献方式

### 🐛 报告Bug
- 使用 GitHub Issues 报告bug
- 提供详细的重现步骤
- 包含错误信息和环境详情

### 💡 提出功能建议
- 在 Issues 中描述新功能
- 解释为什么需要这个功能
- 提供实现思路（可选）

### 🔧 代码贡献
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 遵循代码规范
4. 添加测试覆盖
5. 提交更改 (`git commit -m 'Add amazing feature'`)
6. 推送到分支 (`git push origin feature/amazing-feature`)
7. 创建 Pull Request

## 📝 代码规范

### Solidity
- 使用 Solidity 0.8.28+
- 遵循 [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- 添加完整的 NatSpec 注释
- 使用 OpenZeppelin 库

### JavaScript
- 使用 ES6+ 语法
- 保持代码简洁清晰
- 添加适当的注释

### 测试
- 为新功能添加测试
- 确保测试覆盖率 > 90%
- 使用描述性的测试名称

## 🧪 开发流程

### 1. 环境设置
```bash
npm install
```

### 2. 运行测试
```bash
npm test
```

### 3. 本地部署
```bash
npx hardhat node
npx hardhat run scripts/deploy-lucksnake.js --network localhost
```

### 4. 代码检查
```bash
npx hardhat compile
```

## 📚 项目结构

```
LuckSnake/
├── contracts/      # 智能合约
├── scripts/        # 部署脚本
├── test/          # 测试文件
├── demo/          # 前端演示
└── docs/          # 项目文档
```

## 💬 沟通方式

- **GitHub Issues**: 功能讨论和bug报告
- **Pull Requests**: 代码审查和讨论

## 🎯 开发优先级

1. **安全性**: 确保合约安全
2. **用户体验**: 改进前端交互
3. **文档**: 完善项目文档
4. **测试**: 提高测试覆盖率

## 📄 许可证

贡献的代码将采用 MIT 许可证。

感谢您的贡献！🎉