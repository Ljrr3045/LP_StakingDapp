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
    function initialize(address _stakingToken, address _rewardsToken, NetWork _netWork) public{
        require(init == false, "Contract are initialized");

        _LpContract_init(_netWork);
        _StakeContract_init(_stakingToken, _rewardsToken);

        if(_netWork == NetWork.Maint){
            ETHDAIpool = IUniswapV2ERC20(0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11);
        }else{
            ETHDAIpool = IUniswapV2ERC20(0x1c5DEe94a34D795f9EEeF830B68B80e44868d316);
        }

        init = true;
    }

    function addPoolLiquidity(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 deadline, 
        uint valueForPermit
    ) external payable {
        require(msg.value > 0, "Need enough money to add liquidity");
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
        require(balances[msg.sender] > 0, "Don't have money to withdraw");
        uint256 _amount = balances[msg.sender];
        _withdraw(_amount);
        _getReward();
    }
}
