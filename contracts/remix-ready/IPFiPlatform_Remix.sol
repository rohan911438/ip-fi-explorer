// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPFiPlatform - Remix Ready Version
 * @dev Platform contract for IP-Fi ecosystem
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Interface for IPAssetNFT contract
interface IIPAssetNFT {
    function mintIPAsset(
        address creator,
        string memory ipfsHash,
        uint256 totalShares,
        uint256 pricePerShare,
        string memory assetType,
        uint256 royaltyRate
    ) external returns (uint256);
    
    function purchaseShares(uint256 tokenId, uint256 shareCount) external payable;
    
    struct IPAsset {
        address creator;
        string ipfsHash;
        uint256 totalShares;
        uint256 availableShares;
        uint256 pricePerShare;
        uint256 totalRaised;
        bool isListed;
        string assetType;
        uint256 createdAt;
        uint256 royaltyRate;
    }
    
    function getAsset(uint256 tokenId) external view returns (IPAsset memory);
}

contract IPFiPlatform is Ownable, ReentrancyGuard {
    // Platform statistics
    struct PlatformStats {
        uint256 totalAssets;
        uint256 totalInvestments;
        uint256 totalValueLocked;
        uint256 totalRoyaltiesDistributed;
        uint256 totalUsers;
    }

    // Events
    event AssetCreated(uint256 indexed assetId, address indexed creator, string assetType);
    event InvestmentMade(uint256 indexed assetId, address indexed investor, uint256 amount, uint256 shares);
    event UserRegistered(address indexed user, string userType);
    event RoyaltyPaid(uint256 indexed assetId, uint256 amount, address indexed creator);

    // State variables
    IIPAssetNFT public immutable assetContract;
    PlatformStats public stats;
    
    mapping(address => bool) public registeredUsers;
    mapping(address => string) public userTypes; // "creator", "investor", "both"
    
    // Platform configuration
    uint256 public minimumAssetValue = 0.01 ether;
    uint256 public maximumAssetValue = 1000 ether;
    uint256 public minimumSharePrice = 0.001 ether;
    
    // Supported asset types
    mapping(string => bool) public supportedAssetTypes;
    string[] public assetTypesList;

    constructor(address _assetContract) Ownable(msg.sender) {
        assetContract = IIPAssetNFT(_assetContract);
        
        // Initialize supported asset types
        _addAssetType("digital-art");
        _addAssetType("patent");
        _addAssetType("music-rights");
        _addAssetType("trademark");
        _addAssetType("copyright");
        _addAssetType("character-ip");
        _addAssetType("software");
    }

    /**
     * @dev Register a new user on the platform
     */
    function registerUser(string memory userType) external {
        require(!registeredUsers[msg.sender], "User already registered");
        require(
            keccak256(bytes(userType)) == keccak256(bytes("creator")) ||
            keccak256(bytes(userType)) == keccak256(bytes("investor")) ||
            keccak256(bytes(userType)) == keccak256(bytes("both")),
            "Invalid user type"
        );

        registeredUsers[msg.sender] = true;
        userTypes[msg.sender] = userType;
        stats.totalUsers++;

        emit UserRegistered(msg.sender, userType);
    }

    /**
     * @dev Create a new IP asset for fractionalization
     */
    function createAsset(
        string memory ipfsHash,
        uint256 totalShares,
        uint256 pricePerShare,
        string memory assetType,
        uint256 royaltyRate
    ) external returns (uint256) {
        require(registeredUsers[msg.sender], "User not registered");
        require(
            keccak256(bytes(userTypes[msg.sender])) == keccak256(bytes("creator")) ||
            keccak256(bytes(userTypes[msg.sender])) == keccak256(bytes("both")),
            "Only creators can create assets"
        );
        require(supportedAssetTypes[assetType], "Unsupported asset type");
        
        uint256 totalValue = totalShares * pricePerShare;
        require(totalValue >= minimumAssetValue, "Asset value too low");
        require(totalValue <= maximumAssetValue, "Asset value too high");
        require(pricePerShare >= minimumSharePrice, "Share price too low");

        uint256 assetId = assetContract.mintIPAsset(
            msg.sender,
            ipfsHash,
            totalShares,
            pricePerShare,
            assetType,
            royaltyRate
        );

        stats.totalAssets++;
        
        emit AssetCreated(assetId, msg.sender, assetType);
        return assetId;
    }

    /**
     * @dev Invest in an IP asset
     */
    function investInAsset(uint256 assetId, uint256 shareCount) external payable {
        require(registeredUsers[msg.sender], "User not registered");
        require(
            keccak256(bytes(userTypes[msg.sender])) == keccak256(bytes("investor")) ||
            keccak256(bytes(userTypes[msg.sender])) == keccak256(bytes("both")),
            "Only investors can invest"
        );

        // Call the asset contract to make the investment
        assetContract.purchaseShares{value: msg.value}(assetId, shareCount);

        stats.totalInvestments++;
        stats.totalValueLocked += msg.value;

        emit InvestmentMade(assetId, msg.sender, msg.value, shareCount);
    }

    /**
     * @dev Pay royalties for an asset
     */
    function payRoyalties(uint256 assetId) external payable {
        require(msg.value > 0, "Royalty amount must be greater than 0");
        
        IIPAssetNFT.IPAsset memory asset = assetContract.getAsset(assetId);
        require(asset.creator == msg.sender, "Only asset creator can pay royalties");

        // Forward the royalty payment to the asset contract
        (bool success, ) = address(assetContract).call{value: msg.value}(
            abi.encodeWithSignature("distributeRoyalties(uint256)", assetId)
        );
        require(success, "Royalty distribution failed");
        
        stats.totalRoyaltiesDistributed += msg.value;

        emit RoyaltyPaid(assetId, msg.value, msg.sender);
    }

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (PlatformStats memory) {
        return stats;
    }

    /**
     * @dev Get supported asset types
     */
    function getSupportedAssetTypes() external view returns (string[] memory) {
        return assetTypesList;
    }

    /**
     * @dev Add new supported asset type (only owner)
     */
    function addAssetType(string memory assetType) external onlyOwner {
        _addAssetType(assetType);
    }

    /**
     * @dev Remove supported asset type (only owner)
     */
    function removeAssetType(string memory assetType) external onlyOwner {
        require(supportedAssetTypes[assetType], "Asset type not supported");
        
        supportedAssetTypes[assetType] = false;
        
        // Remove from array
        for (uint256 i = 0; i < assetTypesList.length; i++) {
            if (keccak256(bytes(assetTypesList[i])) == keccak256(bytes(assetType))) {
                assetTypesList[i] = assetTypesList[assetTypesList.length - 1];
                assetTypesList.pop();
                break;
            }
        }
    }

    /**
     * @dev Update minimum asset value (only owner)
     */
    function updateMinimumAssetValue(uint256 newMinimum) external onlyOwner {
        minimumAssetValue = newMinimum;
    }

    /**
     * @dev Update maximum asset value (only owner)
     */
    function updateMaximumAssetValue(uint256 newMaximum) external onlyOwner {
        maximumAssetValue = newMaximum;
    }

    /**
     * @dev Internal function to add asset type
     */
    function _addAssetType(string memory assetType) internal {
        if (!supportedAssetTypes[assetType]) {
            supportedAssetTypes[assetType] = true;
            assetTypesList.push(assetType);
        }
    }

    /**
     * @dev Check if user is registered
     */
    function isUserRegistered(address user) external view returns (bool) {
        return registeredUsers[user];
    }

    /**
     * @dev Get user type
     */
    function getUserType(address user) external view returns (string memory) {
        require(registeredUsers[user], "User not registered");
        return userTypes[user];
    }

    /**
     * @dev Update platform statistics manually (owner only)
     */
    function updateStats(
        uint256 totalAssets,
        uint256 totalInvestments,
        uint256 totalValueLocked,
        uint256 totalRoyaltiesDistributed
    ) external onlyOwner {
        stats.totalAssets = totalAssets;
        stats.totalInvestments = totalInvestments;
        stats.totalValueLocked = totalValueLocked;
        stats.totalRoyaltiesDistributed = totalRoyaltiesDistributed;
    }

    receive() external payable {}
}