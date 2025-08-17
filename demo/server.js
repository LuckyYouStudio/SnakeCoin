const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'lucksnake.html' : req.url);
    
    // 获取文件扩展名
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (ext) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
    }
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('文件未找到');
            } else {
                res.writeHead(500);
                res.end('服务器错误');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 LuckSnake前端服务器已启动`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`🐍 LuckSnake测试页面: http://localhost:${PORT}/lucksnake.html`);
    console.log('');
    console.log('📋 使用说明:');
    console.log('1. 确保Hardhat本地网络正在运行 (npx hardhat node)');
    console.log('2. 确保LuckSnake合约已部署');
    console.log('3. 在浏览器中打开上述地址');
    console.log('4. 连接MetaMask钱包到本地网络 (Chain ID: 31337)');
    console.log('5. 导入测试账户私钥或使用已有账户');
    console.log('');
    console.log('💡 提示: 使用 Ctrl+C 停止服务器');
});