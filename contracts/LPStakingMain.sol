//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

//CONTRACTS
import "./ErcToken.sol";
import "./LpContract.sol";
import "./StakeContract.sol";
//INTERFACES
import "./Interfaces/IUniswapV2ERC20.sol";

contract LPStakingMain is LpContract, StakeContract {
    // VARIABLEs
    bool init;
    IUniswapV2ERC20 ETHDAIpool; // UNISWAP ETHDAIpool

    // FUNCTIONS
    /**
     @param _stakingToken address of the staking token
     @param _rewardsToken address of the rewards token
     */
    function initialize(address _stakingToken, address _rewardsToken) public{
        require(init == false, "Contract are initialized");
        ETHDAIpool = IUniswapV2ERC20(0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11);
        _LpContract_init();
        _StakeContract_init(_stakingToken, _rewardsToken);
        init = true;
    }

    function addPoolLiquidity(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 deadline, 
        uint valueForPermit
    ) external payable {

        uint lpTokenAmount;

        addLiquidity();

        ETHDAIpool.permit(
            msg.sender,
            address(this),
            valueForPermit,
            deadline,
            v,
            r,
            s
        );

        lpTokenAmount = ETHDAIpool.balanceOf(msg.sender);

        _stake(lpTokenAmount);
    }

    function withdrawPoolLiquidity() external {
        uint256 _amount = balances[msg.sender];
        _withdraw(_amount);
        _getReward();
    }
}
