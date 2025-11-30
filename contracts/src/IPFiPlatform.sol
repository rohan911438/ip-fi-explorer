// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IPAssetNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IPFiPlatform
 * @dev Main platform contract that orchestrates all IP-Fi operations
 * Handles asset creation, investment processing, and marketplace functions
 */
contract IPFiPlatform is Ownable, ReentrancyGuard {
    // Platform statistics
    struct PlatformStats {
        uint256 totalAssets;
        uint256 totalInvestments;
        uint256 totalValueLocked;
        uint256 totalRoyaltiesDistributed;
        uint256 totalUsers;
    }

    // Investment pool for large-scale investments
    struct InvestmentPool {
        uint256 poolId;
        string name;
        string description;
        uint256[] assetIds;
        uint256 totalPoolShares;
        uint256 availablePoolShares;
        uint256 pricePerPoolShare;
        uint256 minimumInvestment;
        bool isActive;
        address manager;
        uint256 createdAt;
    }

    // Events
    event AssetCreated(uint256 indexed assetId, address indexed creator, string assetType);
    event InvestmentMade(uint256 indexed assetId, address indexed investor, uint256 amount, uint256 shares);
    event PoolCreated(uint256 indexed poolId, string name, address indexed manager);
    event PoolInvestment(uint256 indexed poolId, address indexed investor, uint256 amount);
    event UserRegistered(address indexed user, string userType);
    event RoyaltyPaid(uint256 indexed assetId, uint256 amount, address indexed creator);

    // State variables
    IPAssetNFT public immutable assetContract;
    PlatformStats public stats;
    
    uint256 private _poolIdCounter;
    mapping(uint256 => InvestmentPool) public investmentPools;
    mapping(address => bool) public registeredUsers;
    mapping(address => string) public userTypes; // "creator", "investor", "both"
    mapping(address => uint256[]) public userPools;
    
    // Platform configuration
    uint256 public minimumAssetValue = 0.01 ether;
    uint256 public maximumAssetValue = 1000 ether;
    uint256 public minimumSharePrice = 0.001 ether;
    
    // Supported asset types
    mapping(string => bool) public supportedAssetTypes;
    string[] public assetTypesList;

    constructor(address _assetContract) Ownable(msg.sender) {
        assetContract = IPAssetNFT(_assetContract);
        _poolIdCounter = 1;
        
        // Initialize supported asset types
        _addAssetType("digital-art");
        _addAssetType("patent");
        _addAssetType("music-rights");
        _addAssetType("trademark");
        _addAssetType("copyright");
        _addAssetType("trade-secret");
        _addAssetType("character-ip");
        _addAssetType("software");
        _addAssetType("design");
        _addAssetType("brand");
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

        // Get current investment amount for this user
        IPAssetNFT.Investment memory currentInvestment = assetContract.getInvestment(assetId, msg.sender);
        bool isNewInvestment = currentInvestment.shares == 0;

        assetContract.purchaseShares{value: msg.value}(assetId, shareCount);

        if (isNewInvestment) {
            stats.totalInvestments++;
        }
        
        stats.totalValueLocked += msg.value;

        emit InvestmentMade(assetId, msg.sender, msg.value, shareCount);
    }

    /**
     * @dev Create an investment pool
     */
    function createInvestmentPool(
        string memory name,
        string memory description,
        uint256[] memory assetIds,
        uint256 totalPoolShares,
        uint256 pricePerPoolShare,
        uint256 minimumInvestment
    ) external returns (uint256) {
        require(registeredUsers[msg.sender], "User not registered");
        require(bytes(name).length > 0, "Pool name cannot be empty");
        require(assetIds.length > 0, "Pool must contain at least one asset");
        require(totalPoolShares > 0, "Total shares must be greater than 0");
        require(pricePerPoolShare > 0, "Price per share must be greater than 0");

        uint256 poolId = _poolIdCounter++;
        
        investmentPools[poolId] = InvestmentPool({
            poolId: poolId,
            name: name,
            description: description,
            assetIds: assetIds,
            totalPoolShares: totalPoolShares,
            availablePoolShares: totalPoolShares,
            pricePerPoolShare: pricePerPoolShare,
            minimumInvestment: minimumInvestment,
            isActive: true,
            manager: msg.sender,
            createdAt: block.timestamp
        });

        userPools[msg.sender].push(poolId);

        emit PoolCreated(poolId, name, msg.sender);
        return poolId;
    }

    /**
     * @dev Invest in a pool
     */
    function investInPool(uint256 poolId, uint256 shareCount) external payable {
        require(registeredUsers[msg.sender], "User not registered");
        
        InvestmentPool storage pool = investmentPools[poolId];
        require(pool.isActive, "Pool is not active");
        require(shareCount > 0, "Share count must be greater than 0");
        require(shareCount <= pool.availablePoolShares, "Not enough pool shares available");
        
        uint256 totalCost = shareCount * pool.pricePerPoolShare;
        require(msg.value >= totalCost, "Insufficient payment");
        require(msg.value >= pool.minimumInvestment, "Investment below minimum");

        pool.availablePoolShares -= shareCount;

        // Distribute investment across pool assets
        // This is simplified - in practice, you'd want more sophisticated distribution logic
        uint256 amountPerAsset = totalCost / pool.assetIds.length;
        
        for (uint256 i = 0; i < pool.assetIds.length; i++) {
            if (i == pool.assetIds.length - 1) {
                // Give remaining amount to last asset to handle division remainder
                amountPerAsset = totalCost - (amountPerAsset * (pool.assetIds.length - 1));
            }
            
            // This would need more sophisticated logic to convert amount to shares
            // For now, we'll just track the pool investment
        }

        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        stats.totalValueLocked += totalCost;

        emit PoolInvestment(poolId, msg.sender, totalCost);
    }

    /**
     * @dev Distribute royalties for an asset (can be called by asset creator)
     */
    function payRoyalties(uint256 assetId) external payable {
        require(msg.value > 0, "Royalty amount must be greater than 0");
        
        IPAssetNFT.IPAsset memory asset = assetContract.getAsset(assetId);
        require(asset.creator == msg.sender, "Only asset creator can pay royalties");

        assetContract.distributeRoyalties{value: msg.value}(assetId);
        
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
     * @dev Get investment pool information
     */
    function getInvestmentPool(uint256 poolId) external view returns (InvestmentPool memory) {
        return investmentPools[poolId];
    }

    /**
     * @dev Get all pools managed by a user
     */
    function getUserPools(address user) external view returns (uint256[] memory) {
        return userPools[user];
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
        
        // Remove from array (simple approach - could be optimized)
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
     * @dev Update minimum share price (only owner)
     */
    function updateMinimumSharePrice(uint256 newMinimum) external onlyOwner {
        minimumSharePrice = newMinimum;
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
     * @dev Emergency function to pause asset contract (only owner)
     */
    function pauseAssetContract() external onlyOwner {
        assetContract.pause();
    }

    /**
     * @dev Emergency function to unpause asset contract (only owner)
     */
    function unpauseAssetContract() external onlyOwner {
        assetContract.unpause();
    }

    /**
     * @dev Get current pool counter
     */
    function getCurrentPoolId() external view returns (uint256) {
        return _poolIdCounter;
    }

    /**
     * @dev Receive function to accept payments
     */
    receive() external payable {}
}