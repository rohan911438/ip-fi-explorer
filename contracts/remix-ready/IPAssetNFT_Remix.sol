// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPAssetNFT - Remix Ready Version
 * @dev Complete contract with all dependencies for easy Remix deployment
 */

// OpenZeppelin Contracts (Minimal implementation for Remix)
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract IPAssetNFT is ERC721, Ownable, ReentrancyGuard {
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
    bool private _paused;
    
    // Mappings
    mapping(uint256 => IPAsset) public assets;
    mapping(uint256 => mapping(address => Investment)) public investments;
    mapping(uint256 => address[]) public assetInvestors;
    mapping(address => uint256[]) public creatorAssets;
    mapping(address => uint256[]) public investorAssets;
    mapping(uint256 => string) private _tokenURIs;

    // Modifiers
    modifier validTokenId(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");
        _;
    }

    modifier onlyAssetCreator(uint256 tokenId) {
        require(assets[tokenId].creator == msg.sender, "Only asset creator can perform this action");
        _;
    }

    modifier whenNotPaused() {
        require(!_paused, "Contract is paused");
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

    // View functions
    function getAsset(uint256 tokenId) external view validTokenId(tokenId) returns (IPAsset memory) {
        return assets[tokenId];
    }

    function getInvestment(uint256 tokenId, address investor) external view returns (Investment memory) {
        return investments[tokenId][investor];
    }

    function getAssetInvestors(uint256 tokenId) external view validTokenId(tokenId) returns (address[] memory) {
        return assetInvestors[tokenId];
    }

    function getCreatorAssets(address creator) external view returns (uint256[] memory) {
        return creatorAssets[creator];
    }

    function getInvestorAssets(address investor) external view returns (uint256[] memory) {
        return investorAssets[investor];
    }

    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // Management functions
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Platform fee cannot exceed 10%");
        platformFee = newFee;
    }

    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient address");
        feeRecipient = newRecipient;
    }

    function pause() external onlyOwner {
        _paused = true;
    }

    function unpause() external onlyOwner {
        _paused = false;
    }

    function paused() external view returns (bool) {
        return _paused;
    }

    // Token URI functions
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    receive() external payable {}
}