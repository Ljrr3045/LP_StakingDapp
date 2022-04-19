//SPDX-License-Identifier: MIT
/**
@author ljrr3045
@author Jhonaiker2309
@author Barbara-Marcano
 */
pragma solidity >=0.8.0<0.9.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakeContract {
    // VARIABLES
    IERC20 public rewardsToken;
    IERC20 public stakingToken;

    uint public rewardRate;
    uint public lastUpdateTime;
    uint public rewardPerTokenStored;

    mapping(address => uint) public userRewardPerTokenPaid;
    mapping(address => uint) public rewards;

    uint private _totalSupply;
    mapping(address => uint) public balances;

    // MODIFIER
    /**
    @dev Update the reward of a user
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = _rewardPerToken();
        lastUpdateTime = block.timestamp;

        rewards[account] = _earned(account);
        userRewardPerTokenPaid[account] = rewardPerTokenStored;
        _;
    }
    // FUNCTIONS
    /**
    @dev Initialize the contract 
    @param _stakingToken address of the staking token
    @param _rewardsToken address of the rewards token
     */
    function _StakeContract_init(address _stakingToken, address _rewardsToken) internal {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        rewardRate = 100;
    }
    /**
    @param _amount Amount to stake
     */
    function _stake(uint _amount) internal updateReward(msg.sender){
        _totalSupply += _amount;
        balances[msg.sender] += _amount;
        stakingToken.transferFrom(msg.sender, address(this), _amount);
    }
    /**
    @param _amount Amount to withdraw
     */
    function _withdraw(uint _amount) internal updateReward(msg.sender){
        require(balances[msg.sender] >=_amount);
        _totalSupply -= _amount;
        balances[msg.sender] -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }
    /**
    @dev Get stake rewards
     */
    function _getReward() internal updateReward(msg.sender){
        uint reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        require(reward != 0);
        rewardsToken.transfer(msg.sender, reward);
    }
    /**
    @dev Amount of rewards per tokens
     */
    function _rewardPerToken() internal view returns (uint) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / _totalSupply);
    }
    /**
    @param account User address 
    @dev Calculate the rewards earned by account 
    */
    function _earned(address account) internal view returns (uint) {
        return
            ((balances[account] *
                (_rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }
}
