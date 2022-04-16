//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0<0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract StakeContract is Initializable {
    
    IERC20 public rewardsToken;
    IERC20 public stakingToken;

    uint public rewardRate = 100;
    uint public lastUpdateTime;
    uint public rewardPerTokenStored;

    mapping(address => uint) public userRewardPerTokenPaid;
    mapping(address => uint) public rewards;

    uint private _totalSupply;
    mapping(address => uint) private _balances;

    modifier updateReward(address account) {
        rewardPerTokenStored = _rewardPerToken();
        lastUpdateTime = block.timestamp;

        rewards[account] = _earned(account);
        userRewardPerTokenPaid[account] = rewardPerTokenStored;
        _;
    }

    function _StakeContract_init(address _stakingToken, address _rewardsToken) public onlyInitializing {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
    }

    function _stake(uint _amount) internal updateReward(msg.sender){
        _totalSupply += _amount;
        _balances[msg.sender] += _amount;
        stakingToken.transferFrom(msg.sender, address(this), _amount);
    }

    function _withdraw(uint _amount) internal updateReward(msg.sender){
        require(_balances[msg.sender] >=_amount);
        _totalSupply -= _amount;
        _balances[msg.sender] -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    function _getReward() internal updateReward(msg.sender){
        uint reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        require(reward != 0);
        rewardsToken.transfer(msg.sender, reward);
    }

    function _rewardPerToken() internal view returns (uint) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / _totalSupply);
    }

    function _earned(address account) internal view returns (uint) {
        return
            ((_balances[account] *
                (_rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }
}
