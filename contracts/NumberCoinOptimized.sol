// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title NumberCoin - 优化版本
 * @dev Gas优化的数字NFT抽奖合约
 * 使用懒加载方式，避免预先初始化大量数据
 */
contract NumberCoinOptimized is ERC721, Ownable {
    using Strings for uint256;

    // 常量
    uint256 public constant MAX_SUPPLY = 10000000; // 1000万
    uint256 public lotteryPrice = 0.0001 ether;

    // 状态变量 - 大幅简化
    uint256 private _tokenIdCounter = 0;
    mapping(uint256 => bool) private _mintedNumbers; // 记录已铸造的数字
    mapping(address => uint256) private _userNonce; // 用户随机数种子

    // 事件
    event LotteryWon(address indexed winner, uint256 indexed tokenId, uint256 price);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);

    constructor() ERC721("NumberCoin", "NUM") Ownable(msg.sender) {
        // 无需任何初始化！
    }

    /**
     * @dev 参与抽奖 - 极简版本
     */
    function playLottery() public payable {
        require(msg.value >= lotteryPrice, "Insufficient payment");
        require(_tokenIdCounter < MAX_SUPPLY, "All NFTs minted");

        // 生成随机数字
        uint256 randomNumber = _generateRandomNumber();
        
        // 如果数字已被铸造，使用简单的线性查找下一个可用数字
        while (_mintedNumbers[randomNumber] && _tokenIdCounter < MAX_SUPPLY) {
            randomNumber = (randomNumber + 1) % MAX_SUPPLY;
        }
        
        require(!_mintedNumbers[randomNumber], "No more unique numbers available");

        // 标记数字为已使用
        _mintedNumbers[randomNumber] = true;
        
        // 铸造NFT
        _safeMint(msg.sender, randomNumber);
        _tokenIdCounter++;
        
        // 增加用户随机数种子
        _userNonce[msg.sender]++;
        
        // 触发事件
        emit LotteryWon(msg.sender, randomNumber, msg.value);
        
        // 退还多余的支付
        if (msg.value > lotteryPrice) {
            payable(msg.sender).transfer(msg.value - lotteryPrice);
        }
    }
    
    /**
     * @dev 生成伪随机数
     */
    function _generateRandomNumber() private view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    msg.sender,
                    _userNonce[msg.sender],
                    block.timestamp,
                    block.prevrandao,
                    _tokenIdCounter
                )
            )
        ) % MAX_SUPPLY;
    }
    
    /**
     * @dev 获取抽奖信息
     */
    function getLotteryInfo() public view returns (
        uint256 price,
        uint256 maxSupply,
        uint256 totalMinted,
        uint256 remaining
    ) {
        return (
            lotteryPrice,
            MAX_SUPPLY,
            _tokenIdCounter,
            MAX_SUPPLY - _tokenIdCounter
        );
    }
    
    /**
     * @dev 获取剩余数量
     */
    function remainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - _tokenIdCounter;
    }
    
    /**
     * @dev 获取总供应量
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev 检查数字是否已被铸造
     */
    function isNumberMinted(uint256 number) public view returns (bool) {
        require(number < MAX_SUPPLY, "Invalid number");
        return _mintedNumbers[number];
    }
    
    /**
     * @dev 生成NFT的SVG图像
     */
    function generateNumberSVG(uint256 tokenId) public pure returns (string memory) {
        require(tokenId < MAX_SUPPLY, "Invalid token ID");
        
        string memory numberStr = _formatNumber(tokenId);
        
        // 基于数字生成颜色
        uint256 colorSeed = tokenId;
        string memory primaryColor = _generateColor(colorSeed);
        string memory secondaryColor = _generateColor(colorSeed + 1);
        
        return string(abi.encodePacked(
            '<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
            '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:', primaryColor, ';stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:', secondaryColor, ';stop-opacity:1" />',
            '</linearGradient>',
            '</defs>',
            '<rect width="300" height="300" fill="url(#grad)" rx="15"/>',
            '<text x="150" y="180" text-anchor="middle" font-family="Arial,sans-serif" font-size="48" font-weight="bold" fill="white" stroke="black" stroke-width="1">',
            numberStr,
            '</text>',
            '</svg>'
        ));
    }
    
    /**
     * @dev 生成NFT的metadata URI
     */
    function tokenURI(uint256 tokenId) public pure override returns (string memory) {
        require(tokenId < MAX_SUPPLY, "Invalid token ID");
        
        string memory numberStr = _formatNumber(tokenId);
        string memory rarity = _calculateRarity(tokenId);
        
        string memory json = string(abi.encodePacked(
            '{"name": "NumberCoin #', tokenId.toString(), '",',
            '"description": "NumberCoin NFT - Unique 7-digit number generated through lottery",',
            '"attributes": [',
            '{"trait_type": "Number", "value": "', numberStr, '"},',
            '{"trait_type": "Rarity", "value": "', rarity, '"}',
            '],',
            '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(generateNumberSVG(tokenId))), '"}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }
    
    /**
     * @dev 将数字格式化为7位字符串
     */
    function _formatNumber(uint256 number) private pure returns (string memory) {
        string memory numStr = number.toString();
        bytes memory numBytes = bytes(numStr);
        
        if (numBytes.length >= 7) {
            return numStr;
        }
        
        // 补零
        bytes memory result = new bytes(7);
        uint256 padding = 7 - numBytes.length;
        
        for (uint256 i = 0; i < padding; i++) {
            result[i] = "0";
        }
        
        for (uint256 i = 0; i < numBytes.length; i++) {
            result[padding + i] = numBytes[i];
        }
        
        return string(result);
    }
    
    /**
     * @dev 生成颜色
     */
    function _generateColor(uint256 seed) private pure returns (string memory) {
        bytes memory colors = "0123456789ABCDEF";
        bytes memory color = new bytes(7);
        color[0] = "#";
        
        for (uint256 i = 1; i < 7; i++) {
            color[i] = colors[seed % 16];
            seed = seed / 16;
        }
        
        return string(color);
    }
    
    /**
     * @dev 计算稀有度
     */
    function _calculateRarity(uint256 number) private pure returns (string memory) {
        // 简化的稀有度计算
        if (number % 10000 == 0) return "Legendary";
        if (number % 1000 == 0) return "Epic";
        if (number % 100 == 0) return "Rare";
        return "Common";
    }
    
    /**
     * @dev 更新抽奖价格 (仅所有者)
     */
    function updateLotteryPrice(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = lotteryPrice;
        lotteryPrice = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev 提取合约余额 (仅所有者)
     */
    function withdrawBalance() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev 获取用户随机数种子
     */
    function getUserNonce(address user) public view returns (uint256) {
        return _userNonce[user];
    }
}