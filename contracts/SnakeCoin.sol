// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SnakeCoin
 * @dev SnakeCoin NFT Contract - Generative NFT with Lottery System
 * Fixed total supply: Maximum 10,000,000 tokens (0..9,999,999)
 * Lottery system: Users pay ETH to get random NFTs
 * On-chain SVG generation with Fisher-Yates shuffle algorithm
 * No metadata storage needed: tokenURI dynamically returns Base64 JSON+SVG
 * Color mapping: 0-9 maps to 10 hexadecimal colors, modifiable
 */
contract SnakeCoin is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // Maximum supply: 1,000 (further reduced for testing)
    uint256 public constant MAX_SUPPLY = 1_000;
    
    // Lottery price per NFT
    uint256 public lotteryPrice = 0.0001 ether;
    
    // Current minted amount
    uint256 private _tokenIdCounter;
    
    // Available tokenId pool size
    uint256 private _poolSize;
    
    // Mapping for Fisher-Yates shuffle algorithm
    mapping(uint256 => uint256) private _idPool;
    
    // User nonce for randomness
    mapping(address => uint256) private _userNonce;
    
    // Events
    event LotteryWon(address indexed winner, uint256 indexed tokenId, uint256 price);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event PoolRefilled(uint256 newPoolSize);
    
    // Color mapping: 0-9 corresponds to 10 hexadecimal colors
    string[10] public colors = [
        "#FF6B6B", // 0 - Red
        "#4ECDC4", // 1 - Cyan
        "#45B7D1", // 2 - Blue
        "#96CEB4", // 3 - Green
        "#FFEAA7", // 4 - Yellow
        "#DDA0DD", // 5 - Purple
        "#FFB347", // 6 - Orange
        "#87CEEB", // 7 - Sky Blue
        "#98FB98", // 8 - Light Green
        "#F0E68C"  // 9 - Khaki
    ];
    
    // Snake path templates (SVG paths)
    string[10] public snakePaths = [
        "M10,10 Q20,5 30,10 T50,10", // 0 - Wave
        "M10,10 C20,5 30,15 50,10",  // 1 - Curve
        "M10,10 L30,5 L50,10",       // 2 - Zigzag
        "M10,10 Q30,5 50,10",        // 3 - Parabola
        "M10,10 Q25,5 40,10 Q55,15 70,10", // 4 - Double wave
        "M10,10 C15,5 25,15 35,10 C45,5 55,15 65,10", // 5 - Double curve
        "M10,10 L20,5 L30,10 L40,5 L50,10", // 6 - Sawtooth
        "M10,10 Q20,5 30,10 Q40,15 50,10", // 7 - Symmetric wave
        "M10,10 C20,5 30,15 40,10 C50,5 60,15 70,10", // 8 - Complex curve
        "M10,10 Q15,5 20,10 Q25,15 30,10 Q35,5 40,10 Q45,15 50,10" // 9 - Dense wave
    ];
    
    constructor() ERC721("SnakeCoin", "SNAKE") Ownable(msg.sender) {
        // 延迟初始化池子，避免部署时gas不足
        _poolSize = 0;
    }
    
    /**
     * @dev Initialize the tokenId pool with Fisher-Yates shuffle
     */
    function _initializePool() private {
        _poolSize = MAX_SUPPLY;
        // Initialize pool with sequential IDs
        for (uint256 i = 0; i < MAX_SUPPLY; i++) {
            _idPool[i] = i;
        }
    }
    
    /**
     * @dev Initialize pool in batches to avoid gas issues
     */
    function _initializePoolBatch(uint256 startIndex, uint256 batchSize) private {
        uint256 endIndex = startIndex + batchSize;
        if (endIndex > MAX_SUPPLY) {
            endIndex = MAX_SUPPLY;
        }
        
        for (uint256 i = startIndex; i < endIndex; i++) {
            _idPool[i] = i;
        }
        
        if (endIndex == MAX_SUPPLY) {
            _poolSize = MAX_SUPPLY;
        }
    }
    
    /**
     * @dev Play lottery to get a random NFT
     */
    function playLottery() public payable nonReentrant {
        require(msg.value >= lotteryPrice, "Insufficient payment");
        require(_poolSize > 0, "No NFTs available");
        
        // Generate random tokenId using Fisher-Yates algorithm
        uint256 randomIndex = _generateRandomNumber() % _poolSize;
        uint256 tokenId = _idPool[randomIndex];
        
        // If the slot is empty, use the index itself
        if (tokenId == 0 && randomIndex != 0) {
            tokenId = randomIndex;
        }
        
        // Remove the selected tokenId from pool
        _idPool[randomIndex] = _idPool[_poolSize - 1];
        _poolSize--;
        
        // Mint the NFT to the winner
        _safeMint(msg.sender, tokenId);
        _tokenIdCounter++;
        
        // Increment user nonce for next lottery
        _userNonce[msg.sender]++;
        
        // Emit event
        emit LotteryWon(msg.sender, tokenId, msg.value);
        
        // Refund excess payment
        if (msg.value > lotteryPrice) {
            payable(msg.sender).transfer(msg.value - lotteryPrice);
        }
    }
    
    /**
     * @dev Generate pseudo-random number (for testnet)
     * In production, use Chainlink VRF or similar
     */
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
    
    /**
     * @dev Refill the pool (owner only)
     */
    function refillPool() public onlyOwner {
        require(_poolSize == 0, "Pool is empty or not initialized");
        _initializePool();
        emit PoolRefilled(_poolSize);
    }
    
    /**
     * @dev Refill the pool in batches (owner only)
     * @param batchSize Size of each batch (recommended: 100-500)
     */
    function refillPoolBatch(uint256 batchSize) public onlyOwner {
        require(_poolSize == 0, "Pool is empty or not initialized");
        require(batchSize > 0 && batchSize <= 1000, "Invalid batch size");
        
        uint256 startIndex = 0;
        while (startIndex < MAX_SUPPLY) {
            _initializePoolBatch(startIndex, batchSize);
            startIndex += batchSize;
        }
        
        emit PoolRefilled(_poolSize);
    }
    
    /**
     * @dev Update lottery price (owner only)
     */
    function updateLotteryPrice(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = lotteryPrice;
        lotteryPrice = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdrawBalance() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Get current pool size
     */
    function getPoolSize() public view returns (uint256) {
        return _poolSize;
    }
    
    /**
     * @dev Get user nonce
     */
    function getUserNonce(address user) public view returns (uint256) {
        return _userNonce[user];
    }
    
    /**
     * @dev Legacy mint function (owner only, for testing)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(_tokenIdCounter + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        
        for (uint256 i = 0; i < amount; i++) {
            _safeMint(to, _tokenIdCounter);
            _tokenIdCounter++;
        }
    }
    
    /**
     * @dev Generate snake pattern SVG based on tokenId
     * @param tokenId Token ID
     * @return SVG string
     */
    function generateSnakeSVG(uint256 tokenId) public view returns (string memory) {
        require(tokenId < MAX_SUPPLY, "Invalid tokenId");
        
        // Convert tokenId to 7-digit string, pad with leading zeros if needed
        string memory tokenIdStr = tokenId.toString();
        uint256 length = bytes(tokenIdStr).length;
        
        // Pad with zeros to 7 digits
        string memory paddedId = "";
        for (uint256 i = 0; i < 7 - length; i++) {
            paddedId = string(abi.encodePacked("0", paddedId));
        }
        paddedId = string(abi.encodePacked(paddedId, tokenIdStr));
        
        // Generate SVG
        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">',
            '<defs>',
            '<linearGradient id="grad', tokenId.toString(), '" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:', colors[uint8(bytes(paddedId)[0]) - 48], ';stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:', colors[uint8(bytes(paddedId)[1]) - 48], ';stop-opacity:1" />',
            '</linearGradient>',
            '</defs>',
            '<rect width="100" height="100" fill="url(#grad', tokenId.toString(), ')" opacity="0.1"/>',
            '<path d="', snakePaths[uint8(bytes(paddedId)[2]) - 48], '" stroke="', colors[uint8(bytes(paddedId)[3]) - 48], '" stroke-width="3" fill="none"/>',
            '<path d="', snakePaths[uint8(bytes(paddedId)[4]) - 48], '" stroke="', colors[uint8(bytes(paddedId)[5]) - 48], '" stroke-width="2" fill="none" transform="translate(0,20)"/>',
            '<circle cx="', (uint256(uint8(bytes(paddedId)[6])) * 10 + 5).toString(), '" cy="50" r="3" fill="', colors[uint8(bytes(paddedId)[0]) - 48], '"/>',
            '<text x="50" y="90" text-anchor="middle" font-family="Arial" font-size="8" fill="', colors[uint8(bytes(paddedId)[1]) - 48], '">#', paddedId, '</text>',
            '</svg>'
        ));
        
        return svg;
    }
    
    /**
     * @dev Generate tokenURI, returns Base64 encoded JSON metadata
     * @param tokenId Token ID
     * @return Base64 encoded JSON string
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        
        // Generate SVG
        string memory svg = generateSnakeSVG(tokenId);
        
        // Convert tokenId to 7-digit string for safe indexing
        string memory tokenIdStr = tokenId.toString();
        uint256 length = bytes(tokenIdStr).length;
        
        // Pad with zeros to 7 digits
        string memory paddedId = "";
        for (uint256 i = 0; i < 7 - length; i++) {
            paddedId = string(abi.encodePacked("0", paddedId));
        }
        paddedId = string(abi.encodePacked(paddedId, tokenIdStr));
        
        // Build JSON metadata using safe indexing
        string memory json = string(abi.encodePacked(
            '{"name": "SnakeCoin #', tokenId.toString(), '",',
            '"description": "SnakeCoin NFT - Unique snake pattern generated on-chain",',
            '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
            '"attributes": [',
            '{"trait_type": "Snake Code", "value": "', paddedId, '"},',
            '{"trait_type": "Color Theme", "value": "', colors[uint8(bytes(paddedId)[0]) - 48], '"},',
            '{"trait_type": "Pattern Type", "value": "', snakePaths[uint8(bytes(paddedId)[2]) - 48], '"}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }
    
    /**
     * @dev Update color mapping
     * @param index Color index (0-9)
     * @param newColor New hexadecimal color value
     */
    function updateColor(uint256 index, string memory newColor) public onlyOwner {
        require(index < 10, "Invalid color index");
        colors[index] = newColor;
    }
    
    /**
     * @dev Update snake path
     * @param index Path index (0-9)
     * @param newPath New SVG path
     */
    function updateSnakePath(uint256 index, string memory newPath) public onlyOwner {
        require(index < 10, "Invalid path index");
        snakePaths[index] = newPath;
    }
    
    /**
     * @dev Get current minted amount
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get remaining mintable amount
     */
    function remainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - _tokenIdCounter;
    }
    
    /**
     * @dev Check if token exists
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }
    
    /**
     * @dev Get lottery information
     */
    function getLotteryInfo() public view returns (
        uint256 price,
        uint256 poolSize,
        uint256 totalMinted,
        uint256 remaining
    ) {
        return (
            lotteryPrice,
            _poolSize,
            _tokenIdCounter,
            remainingSupply()
        );
    }
    
    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {
        // Allow contract to receive ETH for lottery
    }
}
