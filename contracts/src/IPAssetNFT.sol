// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title IPAssetNFT
 * @dev NFT contract for representing fractional intellectual property assets
 * Each NFT represents a unique IP asset that can be fractionalized
 */
contract IPAssetNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    // Events
    event AssetMinted(uint256 indexed tokenId, address indexed creator, string ipfsHash, uint256 totalShares);
    event SharesPurchased(uint256 indexed tokenId, address indexed investor, uint256 shares, uint256 amount);
    event RoyaltyDistributed(uint256 indexed tokenId, uint256 totalAmount, uint256 timestamp);
    event AssetListed(uint256 indexed tokenId, uint256 pricePerShare, uint256 availableShares);
    event AssetDelisted(uint256 indexed tokenId);

    // Structs
    struct IPAsset {
        address creator;           // Original creator of the IP
        string ipfsHash;          // IPFS hash containing asset metadata
        uint256 totalShares;      // Total shares available for this asset
        uint256 availableShares;  // Shares still available for purchase
        uint256 pricePerShare;    // Price per share in wei
        uint256 totalRaised;      // Total amount raised from share sales
        bool isListed;            // Whether the asset is currently listed for investment
        string assetType;         // Type of IP (patent, artwork, music, etc.)
        uint256 createdAt;        // Timestamp when asset was created
        uint256 royaltyRate;      // Royalty rate in basis points (e.g., 1000 = 10%)
    }

    struct Investment {
        uint256 shares;           // Number of shares owned
        uint256 amountInvested;   // Total amount invested
        uint256 lastRoyaltyPayout; // Timestamp of last royalty payout
        uint256 totalRoyaltiesReceived; // Total royalties received
    }

    // State variables
    uint256 private _tokenIdCounter;
    uint256 public platformFee = 250; // 2.5% platform fee in basis points
    address public feeRecipient;
    
    // Mappings
    mapping(uint256 => IPAsset) public assets;
    mapping(uint256 => mapping(address => Investment)) public investments;
    mapping(uint256 => address[]) public assetInvestors;
    mapping(address => uint256[]) public creatorAssets;
    mapping(address => uint256[]) public investorAssets;

    // Modifiers
    modifier validTokenId(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");
        _;
    }

    modifier onlyAssetCreator(uint256 tokenId) {
        require(assets[tokenId].creator == msg.sender, "Only asset creator can perform this action");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address _feeRecipient
    ) ERC721(name, symbol) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
        _tokenIdCounter = 1; // Start token IDs from 1
    }

    /**
     * @dev Mint a new IP asset NFT
     * @param creator Address of the IP creator
     * @param ipfsHash IPFS hash containing asset metadata
     * @param totalShares Total number of shares for fractionalization
     * @param pricePerShare Price per share in wei
     * @param assetType Type of intellectual property
     * @param royaltyRate Royalty rate in basis points
     */
    function mintIPAsset(
        address creator,
        string memory ipfsHash,
        uint256 totalShares,
        uint256 pricePerShare,
        string memory assetType,
        uint256 royaltyRate
    ) external onlyOwner returns (uint256) {
        require(creator != address(0), "Invalid creator address");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(totalShares > 0, "Total shares must be greater than 0");
        require(pricePerShare > 0, "Price per share must be greater than 0");
        require(royaltyRate <= 5000, "Royalty rate cannot exceed 50%");

        uint256 tokenId = _tokenIdCounter++;
        
        // Mint the NFT to the contract itself
        _safeMint(address(this), tokenId);
        _setTokenURI(tokenId, ipfsHash);

        // Create the IP asset
        assets[tokenId] = IPAsset({
            creator: creator,
            ipfsHash: ipfsHash,
            totalShares: totalShares,
            availableShares: totalShares,
            pricePerShare: pricePerShare,
            totalRaised: 0,
            isListed: true,
            assetType: assetType,
            createdAt: block.timestamp,
            royaltyRate: royaltyRate
        });

        // Track creator's assets
        creatorAssets[creator].push(tokenId);

        emit AssetMinted(tokenId, creator, ipfsHash, totalShares);
        emit AssetListed(tokenId, pricePerShare, totalShares);

        return tokenId;
    }

    /**
     * @dev Purchase shares of an IP asset
     * @param tokenId ID of the asset to invest in
     * @param shareCount Number of shares to purchase
     */
    function purchaseShares(uint256 tokenId, uint256 shareCount) 
        external 
        payable 
        validTokenId(tokenId) 
        whenNotPaused 
        nonReentrant 
    {
        IPAsset storage asset = assets[tokenId];
        require(asset.isListed, "Asset is not listed for investment");
        require(shareCount > 0, "Share count must be greater than 0");
        require(shareCount <= asset.availableShares, "Not enough shares available");
        
        uint256 totalCost = shareCount * asset.pricePerShare;
        require(msg.value >= totalCost, "Insufficient payment");

        // Calculate platform fee
        uint256 fee = (totalCost * platformFee) / 10000;
        uint256 creatorAmount = totalCost - fee;

        // Update asset state
        asset.availableShares -= shareCount;
        asset.totalRaised += totalCost;

        // Update or create investment record
        Investment storage investment = investments[tokenId][msg.sender];
        if (investment.shares == 0) {
            // New investor
            assetInvestors[tokenId].push(msg.sender);
            investorAssets[msg.sender].push(tokenId);
        }
        
        investment.shares += shareCount;
        investment.amountInvested += totalCost;

        // Transfer payments
        payable(asset.creator).transfer(creatorAmount);
        payable(feeRecipient).transfer(fee);

        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        // If all shares are sold, delist the asset
        if (asset.availableShares == 0) {
            asset.isListed = false;
            emit AssetDelisted(tokenId);
        }

        emit SharesPurchased(tokenId, msg.sender, shareCount, totalCost);
    }

    /**
     * @dev Distribute royalties to all shareholders
     * @param tokenId ID of the asset to distribute royalties for
     */
    function distributeRoyalties(uint256 tokenId) 
        external 
        payable 
        validTokenId(tokenId) 
        onlyAssetCreator(tokenId)
        nonReentrant 
    {
        require(msg.value > 0, "Royalty amount must be greater than 0");
        
        IPAsset storage asset = assets[tokenId];
        uint256 soldShares = asset.totalShares - asset.availableShares;
        require(soldShares > 0, "No shares have been sold");

        uint256 totalRoyalty = msg.value;
        address[] storage investors = assetInvestors[tokenId];

        // Distribute royalties proportionally
        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            Investment storage investment = investments[tokenId][investor];
            
            if (investment.shares > 0) {
                uint256 investorRoyalty = (totalRoyalty * investment.shares) / soldShares;
                investment.totalRoyaltiesReceived += investorRoyalty;
                investment.lastRoyaltyPayout = block.timestamp;
                
                payable(investor).transfer(investorRoyalty);
            }
        }

        emit RoyaltyDistributed(tokenId, totalRoyalty, block.timestamp);
    }

    /**
     * @dev Get asset information
     */
    function getAsset(uint256 tokenId) 
        external 
        view 
        validTokenId(tokenId) 
        returns (IPAsset memory) 
    {
        return assets[tokenId];
    }

    /**
     * @dev Get investment information for a specific investor and asset
     */
    function getInvestment(uint256 tokenId, address investor) 
        external 
        view 
        returns (Investment memory) 
    {
        return investments[tokenId][investor];
    }

    /**
     * @dev Get all investors for a specific asset
     */
    function getAssetInvestors(uint256 tokenId) 
        external 
        view 
        validTokenId(tokenId) 
        returns (address[] memory) 
    {
        return assetInvestors[tokenId];
    }

    /**
     * @dev Get all assets created by a specific creator
     */
    function getCreatorAssets(address creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorAssets[creator];
    }

    /**
     * @dev Get all assets invested in by a specific investor
     */
    function getInvestorAssets(address investor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return investorAssets[investor];
    }

    /**
     * @dev Update asset listing status
     */
    function updateListingStatus(uint256 tokenId, bool isListed) 
        external 
        validTokenId(tokenId) 
        onlyAssetCreator(tokenId) 
    {
        assets[tokenId].isListed = isListed;
        
        if (isListed) {
            emit AssetListed(tokenId, assets[tokenId].pricePerShare, assets[tokenId].availableShares);
        } else {
            emit AssetDelisted(tokenId);
        }
    }

    /**
     * @dev Update price per share for an asset
     */
    function updatePricePerShare(uint256 tokenId, uint256 newPrice) 
        external 
        validTokenId(tokenId) 
        onlyAssetCreator(tokenId) 
    {
        require(newPrice > 0, "Price must be greater than 0");
        assets[tokenId].pricePerShare = newPrice;
        
        if (assets[tokenId].isListed) {
            emit AssetListed(tokenId, newPrice, assets[tokenId].availableShares);
        }
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Platform fee cannot exceed 10%");
        platformFee = newFee;
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient address");
        feeRecipient = newRecipient;
    }

    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get current token counter
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // Override functions required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Emergency withdrawal function (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Receive function to accept royalty payments
     */
    receive() external payable {}
}