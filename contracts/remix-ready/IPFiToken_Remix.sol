// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPFiToken - Remix Ready Version
 * @dev Platform utility token for IP-Fi ecosystem
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract IPFiToken is ERC20, Ownable, ReentrancyGuard {
    // Staking information
    struct StakingInfo {
        uint256 stakedAmount;
        uint256 stakingStartTime;
        uint256 lastRewardClaim;
        uint256 totalRewardsEarned;
    }

    // Events
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    // Constants
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant STAKING_REWARD_RATE = 12; // 12% APY
    uint256 public constant MINIMUM_STAKE_DURATION = 7 days;
    uint256 public constant SECONDS_IN_YEAR = 365 days;

    // State variables
    mapping(address => StakingInfo) public stakingInfo;
    mapping(address => bool) public authorizedMinters;
    
    uint256 public totalStaked;
    uint256 public rewardPool;
    bool public stakingEnabled = true;

    constructor() ERC20("IPFi Token", "IPFI") Ownable(msg.sender) {
        // Mint initial supply to contract owner
        _mint(owner(), TOTAL_SUPPLY / 2); // 500M tokens initially
        
        // Set reward pool (remaining 500M tokens for rewards and ecosystem)
        rewardPool = TOTAL_SUPPLY / 2;
    }

    /**
     * @dev Stake tokens to earn rewards
     */
    function stakeTokens(uint256 amount) external nonReentrant {
        require(stakingEnabled, "Staking is disabled");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient token balance");

        // Claim existing rewards before updating stake
        if (stakingInfo[msg.sender].stakedAmount > 0) {
            _claimRewards(msg.sender);
        }

        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);

        // Update staking info
        stakingInfo[msg.sender].stakedAmount += amount;
        stakingInfo[msg.sender].stakingStartTime = block.timestamp;
        stakingInfo[msg.sender].lastRewardClaim = block.timestamp;

        totalStaked += amount;

        emit TokensStaked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens
     */
    function unstakeTokens(uint256 amount) external nonReentrant {
        StakingInfo storage info = stakingInfo[msg.sender];
        require(info.stakedAmount >= amount, "Insufficient staked amount");
        require(
            block.timestamp >= info.stakingStartTime + MINIMUM_STAKE_DURATION,
            "Minimum staking duration not met"
        );

        // Claim rewards before unstaking
        _claimRewards(msg.sender);

        // Update staking info
        info.stakedAmount -= amount;
        totalStaked -= amount;

        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);

        emit TokensUnstaked(msg.sender, amount);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        require(stakingInfo[msg.sender].stakedAmount > 0, "No tokens staked");
        _claimRewards(msg.sender);
    }

    /**
     * @dev Internal function to calculate and distribute rewards
     */
    function _claimRewards(address user) internal {
        StakingInfo storage info = stakingInfo[user];
        
        if (info.stakedAmount == 0) return;

        uint256 stakingDuration = block.timestamp - info.lastRewardClaim;
        uint256 reward = (info.stakedAmount * STAKING_REWARD_RATE * stakingDuration) / 
                        (100 * SECONDS_IN_YEAR);

        if (reward > 0 && reward <= rewardPool) {
            rewardPool -= reward;
            info.totalRewardsEarned += reward;
            info.lastRewardClaim = block.timestamp;

            _mint(user, reward);

            emit RewardsClaimed(user, reward);
        }
    }

    /**
     * @dev Calculate pending rewards for a user
     */
    function pendingRewards(address user) external view returns (uint256) {
        StakingInfo storage info = stakingInfo[user];
        
        if (info.stakedAmount == 0) return 0;

        uint256 stakingDuration = block.timestamp - info.lastRewardClaim;
        uint256 reward = (info.stakedAmount * STAKING_REWARD_RATE * stakingDuration) / 
                        (100 * SECONDS_IN_YEAR);

        return reward > rewardPool ? rewardPool : reward;
    }

    /**
     * @dev Authorize address to mint tokens (for platform operations)
     */
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    /**
     * @dev Revoke minting authorization
     */
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }

    /**
     * @dev Mint tokens for community rewards (authorized addresses only)
     */
    function mintCommunityRewards(address recipient, uint256 amount) external {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        require(amount <= rewardPool, "Exceeds available reward pool");
        
        rewardPool -= amount;
        _mint(recipient, amount);
    }

    /**
     * @dev Add more tokens to reward pool
     */
    function addToRewardPool(uint256 amount) external onlyOwner {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _transfer(msg.sender, address(this), amount);
        rewardPool += amount;
    }

    /**
     * @dev Enable/disable staking
     */
    function setStakingEnabled(bool enabled) external onlyOwner {
        stakingEnabled = enabled;
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Get staking information for a user
     */
    function getStakingInfo(address user) external view returns (StakingInfo memory) {
        return stakingInfo[user];
    }

    /**
     * @dev Emergency withdrawal for owner
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(owner()).transfer(balance);
        }
        
        uint256 tokenBalance = balanceOf(address(this));
        if (tokenBalance > 0) {
            _transfer(address(this), owner(), tokenBalance);
        }
    }

    /**
     * @dev Distribute tokens (owner only)
     */
    function distributeTokens(address[] memory recipients, uint256[] memory amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }

    receive() external payable {}
}