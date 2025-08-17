// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LuckSnake
 * @dev LuckSnake Contract - 随机数字生成系统
 * 用户支付0.0001ETH获取000-999范围内的随机数字
 * 包含用户地址到数字数组的映射和数字到用户地址的映射
 * 防止重复数字生成
 */
contract LuckSnake is ReentrancyGuard, Ownable {
    
    // 生成数字的价格
    uint256 public constant GENERATION_PRICE = 0.0001 ether;
    
    // 数字范围：000-999
    uint256 public constant MIN_NUMBER = 0;
    uint256 public constant MAX_NUMBER = 999;
    
    // 用户地址 => 拥有的数字数组
    mapping(address => uint256[]) public userNumbers;
    
    // 数字 => 拥有者地址
    mapping(uint256 => address) public numberOwner;
    
    // 已生成的数字集合 (用于防重复)
    mapping(uint256 => bool) public isNumberGenerated;
    
    // 已生成数字的数量
    uint256 public totalGeneratedNumbers;
    
    // 用户随机数种子
    mapping(address => uint256) private userNonce;
    
    // 事件
    event NumberGenerated(address indexed user, uint256 indexed number, uint256 price);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev 用户支付0.0001ETH生成随机数字
     */
    function generateNumber() public payable nonReentrant {
        require(msg.value >= GENERATION_PRICE, "Insufficient payment");
        require(totalGeneratedNumbers < 1000, "All numbers have been generated");
        
        uint256 randomNumber;
        uint256 attempts = 0;
        uint256 maxAttempts = 100; // 防止无限循环
        
        // 生成未被使用的随机数字
        do {
            randomNumber = _generateRandomNumber();
            attempts++;
            require(attempts <= maxAttempts, "Unable to generate unique number");
        } while (isNumberGenerated[randomNumber]);
        
        // 标记数字为已生成
        isNumberGenerated[randomNumber] = true;
        totalGeneratedNumbers++;
        
        // 更新映射关系
        userNumbers[msg.sender].push(randomNumber);
        numberOwner[randomNumber] = msg.sender;
        
        // 增加用户随机数种子
        userNonce[msg.sender]++;
        
        // 发出事件
        emit NumberGenerated(msg.sender, randomNumber, msg.value);
        
        // 退还多余的ETH
        if (msg.value > GENERATION_PRICE) {
            payable(msg.sender).transfer(msg.value - GENERATION_PRICE);
        }
    }
    
    /**
     * @dev 获取指定地址拥有的所有数字
     * @param user 用户地址
     * @return 用户拥有的数字数组
     */
    function getUserNumbers(address user) public view returns (uint256[] memory) {
        return userNumbers[user];
    }
    
    /**
     * @dev 获取指定数字的拥有者
     * @param number 数字 (0-999)
     * @return 数字的拥有者地址，如果数字未被生成则返回零地址
     */
    function getNumberOwner(uint256 number) public view returns (address) {
        require(number <= MAX_NUMBER, "Invalid number range");
        return numberOwner[number];
    }
    
    /**
     * @dev 检查数字是否已被生成
     * @param number 数字 (0-999)
     * @return 如果数字已被生成返回true，否则返回false
     */
    function isNumberTaken(uint256 number) public view returns (bool) {
        require(number <= MAX_NUMBER, "Invalid number range");
        return isNumberGenerated[number];
    }
    
    /**
     * @dev 获取用户拥有的数字数量
     * @param user 用户地址
     * @return 用户拥有的数字数量
     */
    function getUserNumberCount(address user) public view returns (uint256) {
        return userNumbers[user].length;
    }
    
    /**
     * @dev 获取剩余可生成的数字数量
     * @return 剩余可生成数字数量
     */
    function getRemainingNumbers() public view returns (uint256) {
        return 1000 - totalGeneratedNumbers;
    }
    
    /**
     * @dev 生成伪随机数字 (000-999)
     * 在生产环境中建议使用Chainlink VRF
     */
    function _generateRandomNumber() private view returns (uint256) {
        uint256 randomHash = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    msg.sender,
                    userNonce[msg.sender],
                    block.timestamp,
                    block.prevrandao,
                    totalGeneratedNumbers
                )
            )
        );
        return randomHash % 1000; // 返回0-999的数字
    }
    
    /**
     * @dev 获取用户的随机数种子
     * @param user 用户地址
     * @return 用户的随机数种子
     */
    function getUserNonce(address user) public view returns (uint256) {
        return userNonce[user];
    }
    
    /**
     * @dev 提取合约余额 (仅所有者)
     */
    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
        emit FundsWithdrawn(owner(), balance);
    }
    
    /**
     * @dev 获取合约余额
     * @return 合约当前余额
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev 获取系统统计信息
     * @return price 生成价格
     * @return totalGenerated 已生成数字总数
     * @return remaining 剩余可生成数字数量
     * @return contractBalance 合约余额
     */
    function getSystemInfo() public view returns (
        uint256 price,
        uint256 totalGenerated,
        uint256 remaining,
        uint256 contractBalance
    ) {
        return (
            GENERATION_PRICE,
            totalGeneratedNumbers,
            getRemainingNumbers(),
            getContractBalance()
        );
    }
    
    /**
     * @dev 接收ETH的回退函数
     */
    receive() external payable {
        // 允许合约接收ETH
    }
}