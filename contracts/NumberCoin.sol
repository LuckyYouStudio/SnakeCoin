// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NumberCoin
 * @dev NumberCoin NFT Contract - Simple Number-based NFT with Lottery System
 * Total supply: 10,000,000 tokens (0000000 to 9999999)
 * Lottery system: Users pay ETH to get random number NFTs
 * On-chain number generation with Fisher-Yates shuffle algorithm
 * Each NFT displays a unique 7-digit number with colorful styling
 */
contract NumberCoin is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // Maximum supply: 10,000,000 (0000000 to 9999999)
    uint256 public constant MAX_SUPPLY = 10_000_000;
    
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
    
    // Color palette for number styling
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
    
    constructor() ERC721("NumberCoin", "NUM") Ownable(msg.sender) {
        // Initialize with empty pool
        _poolSize = 0;
    }
    
    /**
     * @dev Initialize the tokenId pool with Fisher-Yates shuffle
     */
    function initializePool() public onlyOwner {
        require(_poolSize == 0, "Pool already initialized");
        _poolSize = MAX_SUPPLY;
        
        // Note: We don't pre-populate the mapping to save gas
        // Instead, we use the default behavior where _idPool[i] = 0 initially
        // and treat 0 as meaning "use index i"
    }
    
    /**
     * @dev Play lottery to get a random number NFT
     */
    function playLottery() public payable nonReentrant {
        require(msg.value >= lotteryPrice, "Insufficient payment");
        require(_poolSize > 0, "No NFTs available");
        
        // Generate random tokenId using Fisher-Yates algorithm
        uint256 randomIndex = _generateRandomNumber() % _poolSize;
        uint256 tokenId = _idPool[randomIndex];
        
        // If the slot is empty (0), use the index itself
        if (tokenId == 0) {
            tokenId = randomIndex;
        }
        
        // Move the last element to the selected position
        uint256 lastIndex = _poolSize - 1;
        if (randomIndex != lastIndex) {
            uint256 lastElement = _idPool[lastIndex];
            if (lastElement == 0) {
                _idPool[randomIndex] = lastIndex;
            } else {
                _idPool[randomIndex] = lastElement;
            }
        }
        
        // Clear the last position and reduce pool size
        delete _idPool[lastIndex];
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
     * @dev Reset the pool (owner only) - for testing
     */
    function resetPool() public onlyOwner {
        _poolSize = MAX_SUPPLY;
        // Clear all mappings
        for (uint256 i = 0; i < MAX_SUPPLY; i++) {
            delete _idPool[i];
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
     * @dev Convert number to 7-digit string with leading zeros
     */
    function _formatNumber(uint256 number) private pure returns (string memory) {
        require(number < MAX_SUPPLY, "Number too large");
        
        string memory numStr = number.toString();
        bytes memory numBytes = bytes(numStr);
        
        // Calculate padding needed
        uint256 padding = 7 - numBytes.length;
        
        // Build padded string
        bytes memory result = new bytes(7);
        
        // Add leading zeros
        for (uint256 i = 0; i < padding; i++) {
            result[i] = "0";
        }
        
        // Add the actual number
        for (uint256 i = 0; i < numBytes.length; i++) {
            result[padding + i] = numBytes[i];
        }
        
        return string(result);
    }
    
    /**
     * @dev Generate colorful number SVG based on tokenId
     * @param tokenId Token ID (0000000 to 9999999)
     * @return SVG string
     */
    function generateNumberSVG(uint256 tokenId) public view returns (string memory) {
        require(tokenId < MAX_SUPPLY, "Invalid tokenId");
        
        string memory formattedNumber = _formatNumber(tokenId);
        bytes memory numberBytes = bytes(formattedNumber);
        
        // Use first two digits for gradient colors
        uint256 color1Index = uint256(uint8(numberBytes[0])) - 48; // Convert ASCII to number
        uint256 color2Index = uint256(uint8(numberBytes[1])) - 48;
        
        // Use third digit for text color
        uint256 textColorIndex = uint256(uint8(numberBytes[2])) - 48;
        
        // Build SVG with colorful styling
        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">',
            '<defs>',
            '<linearGradient id="bgGrad', tokenId.toString(), '" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:', colors[color1Index], ';stop-opacity:0.8" />',
            '<stop offset="100%" style="stop-color:', colors[color2Index], ';stop-opacity:0.8" />',
            '</linearGradient>',
            '<filter id="glow">',
            '<feGaussianBlur stdDeviation="3" result="coloredBlur"/>',
            '<feMerge>',
            '<feMergeNode in="coloredBlur"/>',
            '<feMergeNode in="SourceGraphic"/>',
            '</feMerge>',
            '</filter>',
            '</defs>'
        ));
        
        svg = string(abi.encodePacked(
            svg,
            '<rect width="400" height="400" fill="url(#bgGrad', tokenId.toString(), ')"/>',
            '<circle cx="200" cy="200" r="180" fill="none" stroke="white" stroke-width="2" opacity="0.3"/>',
            '<circle cx="200" cy="200" r="120" fill="none" stroke="white" stroke-width="1" opacity="0.2"/>',
            '<text x="200" y="220" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="48" font-weight="bold" fill="white" filter="url(#glow)">',
            formattedNumber,
            '</text>',
            '<text x="200" y="260" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white" opacity="0.8">',
            'NumberCoin #', tokenId.toString(),
            '</text>',
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
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        
        // Generate SVG
        string memory svg = generateNumberSVG(tokenId);
        string memory formattedNumber = _formatNumber(tokenId);
        
        // Get color information for metadata
        bytes memory numberBytes = bytes(formattedNumber);
        uint256 color1Index = uint256(uint8(numberBytes[0])) - 48;
        uint256 color2Index = uint256(uint8(numberBytes[1])) - 48;
        
        // Build JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name": "NumberCoin #', formattedNumber, '",',
            '"description": "NumberCoin NFT - Unique 7-digit number generated through lottery",',
            '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
            '"attributes": [',
            '{"trait_type": "Number", "value": "', formattedNumber, '"},',
            '{"trait_type": "Primary Color", "value": "', colors[color1Index], '"},',
            '{"trait_type": "Secondary Color", "value": "', colors[color2Index], '"},',
            '{"trait_type": "Rarity", "value": "', _getRarity(tokenId), '"}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }
    
    /**
     * @dev Determine rarity based on number pattern
     */
    function _getRarity(uint256 tokenId) private pure returns (string memory) {
        string memory formattedNumber = _formatNumberStatic(tokenId);
        bytes memory numberBytes = bytes(formattedNumber);
        
        // Check for special patterns
        
        // All same digits (0000000, 1111111, etc.)
        bool allSame = true;
        for (uint256 i = 1; i < 7; i++) {
            if (numberBytes[i] != numberBytes[0]) {
                allSame = false;
                break;
            }
        }
        if (allSame) return "Legendary";
        
        // Sequential ascending (0123456, 1234567, etc.)
        bool ascending = true;
        for (uint256 i = 1; i < 7; i++) {
            if (uint8(numberBytes[i]) != uint8(numberBytes[i-1]) + 1) {
                ascending = false;
                break;
            }
        }
        if (ascending) return "Epic";
        
        // Sequential descending (6543210, 9876543, etc.)
        bool descending = true;
        for (uint256 i = 1; i < 7; i++) {
            if (uint8(numberBytes[i]) != uint8(numberBytes[i-1]) - 1) {
                descending = false;
                break;
            }
        }
        if (descending) return "Epic";
        
        // Palindrome (1234321, 0001000, etc.)
        bool palindrome = true;
        for (uint256 i = 0; i < 3; i++) {
            if (numberBytes[i] != numberBytes[6-i]) {
                palindrome = false;
                break;
            }
        }
        if (palindrome) return "Rare";
        
        // Default rarity
        return "Common";
    }
    
    /**
     * @dev Static version of _formatNumber for pure functions
     */
    function _formatNumberStatic(uint256 number) private pure returns (string memory) {
        require(number < 10_000_000, "Number too large");
        
        string memory numStr = number.toString();
        bytes memory numBytes = bytes(numStr);
        
        // Calculate padding needed
        uint256 padding = 7 - numBytes.length;
        
        // Build padded string
        bytes memory result = new bytes(7);
        
        // Add leading zeros
        for (uint256 i = 0; i < padding; i++) {
            result[i] = "0";
        }
        
        // Add the actual number
        for (uint256 i = 0; i < numBytes.length; i++) {
            result[padding + i] = numBytes[i];
        }
        
        return string(result);
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
        return _poolSize;
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
            _poolSize
        );
    }
    
    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {
        // Allow contract to receive ETH for lottery
    }
}