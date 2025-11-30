// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IPFiToken
 * @dev Platform utility token for IP-Fi ecosystem
 * Used for governance, staking, and platform incentives
 */
contract IPFiToken is ERC20, Ownable, ReentrancyGuard {
    // Token allocation structure
    struct TokenAllocation {
        uint256 platformReserve;     // 30% - Platform operations and development
        uint256 communityRewards;    // 25% - User rewards and incentives
        uint256 stakingRewards;      // 20% - Staking rewards pool
        uint256 teamAndAdvisors;     // 15% - Team and advisor allocation
        uint256 publicSale;          // 10% - Public sale allocation
    }

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
    event RewardsDeposited(uint256 amount);

    // Constants
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant STAKING_REWARD_RATE = 12; // 12% APY
    uint256 public constant MINIMUM_STAKE_DURATION = 7 days;
    uint256 public constant SECONDS_IN_YEAR = 365 days;

    // State variables
    TokenAllocation public allocation;
    mapping(address => StakingInfo) public stakingInfo;
    mapping(address => bool) public authorizedMinters;
    
    uint256 public totalStaked;
    uint256 public rewardPool;
    bool public stakingEnabled = true;
    bool public transfersEnabled = true;

    // Vesting for team and advisors
    mapping(address => uint256) public vestingStart;
    mapping(address => uint256) public vestingAmount;
    mapping(address => uint256) public vestedClaimed;
    uint256 public constant VESTING_DURATION = 2 * 365 days; // 2 years
    uint256 public constant VESTING_CLIFF = 180 days; // 6 months

    constructor() ERC20("IPFi Token", "IPFI") Ownable(msg.sender) {
        // Initialize token allocation
        allocation = TokenAllocation({
            platformReserve: (TOTAL_SUPPLY * 30) / 100,      // 300M tokens
            communityRewards: (TOTAL_SUPPLY * 25) / 100,     // 250M tokens
            stakingRewards: (TOTAL_SUPPLY * 20) / 100,       // 200M tokens
            teamAndAdvisors: (TOTAL_SUPPLY * 15) / 100,      // 150M tokens
            publicSale: (TOTAL_SUPPLY * 10) / 100            // 100M tokens
        });

        // Mint platform reserve to contract owner
        _mint(owner(), allocation.platformReserve);
        
        // Set initial reward pool
        rewardPool = allocation.stakingRewards + allocation.communityRewards;
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
     * @dev Distribute tokens for public sale
     */
    function distributePublicSale(address recipient, uint256 amount) external onlyOwner {
        require(amount <= allocation.publicSale, "Exceeds public sale allocation");
        allocation.publicSale -= amount;
        _mint(recipient, amount);
    }

    /**
     * @dev Setup vesting for team and advisors
     */
    function setupVesting(address beneficiary, uint256 amount) external onlyOwner {
        require(amount <= allocation.teamAndAdvisors, "Exceeds team allocation");
        require(vestingStart[beneficiary] == 0, "Vesting already setup for this address");

        allocation.teamAndAdvisors -= amount;
        vestingStart[beneficiary] = block.timestamp;
        vestingAmount[beneficiary] = amount;
    }

    /**
     * @dev Claim vested tokens
     */
    function claimVestedTokens() external nonReentrant {
        require(vestingStart[msg.sender] != 0, "No vesting setup");
        
        uint256 vestedAmount = getVestedAmount(msg.sender);
        uint256 claimable = vestedAmount - vestedClaimed[msg.sender];
        
        require(claimable > 0, "No tokens available to claim");

        vestedClaimed[msg.sender] += claimable;
        _mint(msg.sender, claimable);
    }

    /**
     * @dev Calculate vested amount for an address
     */
    function getVestedAmount(address beneficiary) public view returns (uint256) {
        if (vestingStart[beneficiary] == 0) return 0;
        
        uint256 elapsed = block.timestamp - vestingStart[beneficiary];
        
        // Check cliff period
        if (elapsed < VESTING_CLIFF) return 0;
        
        // Full vesting after duration
        if (elapsed >= VESTING_DURATION) {
            return vestingAmount[beneficiary];
        }
        
        // Linear vesting
        return (vestingAmount[beneficiary] * elapsed) / VESTING_DURATION;
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
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(amount <= rewardPool, "Exceeds available reward pool");
        
        rewardPool -= amount;
        _mint(recipient, amount);
    }

    /**
     * @dev Deposit additional rewards to the pool
     */
    function depositRewards(uint256 amount) external onlyOwner {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _transfer(msg.sender, address(this), amount);
        rewardPool += amount;
        
        emit RewardsDeposited(amount);
    }

    /**
     * @dev Enable/disable staking
     */
    function setStakingEnabled(bool enabled) external onlyOwner {
        stakingEnabled = enabled;
    }

    /**
     * @dev Enable/disable transfers (emergency function)
     */
    function setTransfersEnabled(bool enabled) external onlyOwner {
        transfersEnabled = enabled;
    }

    /**
     * @dev Override transfer to check if transfers are enabled
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal view override {
        if (from != address(0) && to != address(0)) {
            require(transfersEnabled, "Transfers are disabled");
        }
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
     * @dev Get token allocation information
     */
    function getTokenAllocation() external view returns (TokenAllocation memory) {
        return allocation;
    }

    /**
     * @dev Emergency withdrawal for owner
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
}