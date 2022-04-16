//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

//CONTRACTS
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./ErcToken.sol";
import "./LpContract.sol";
import "./StakeContract.sol";
import "hardhat/console.sol";
//INTERFACES
import "./Interfaces/IUniswapV2ERC20.sol";

contract LPStakingMain is AccessControlUpgradeable, LpContract, StakeContract {
    // VARIABLEs
    IUniswapV2ERC20 ETHDAIpool; // UNISWAP ETHDAIpool
    bytes32 private DOMAIN_SEPARATOR; //ERC712 UNISWAP separator

    // FUNCTIONS
    /**
     @param _stakingToken address of the staking token
     @param _rewardsToken address of the rewards token
     */
    function initialize(address _stakingToken, address _rewardsToken)
        external
        initializer
    {
        ETHDAIpool = IUniswapV2ERC20(
            0xa1484C3aa22a66C62b77E0AE78E15258bd0cB711
        );
        uint chainId;
        assembly {
            chainId := chainId
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("Uniswap V2")),
                keccak256(bytes("1")),
                chainId,
                address(ETHDAIpool)
            )
        );
        _LpContract_init();
        _StakeContract_init(_stakingToken, _rewardsToken);
    }

    function addPoolLiquidity(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 deadline
    ) external payable {
        require(block.timestamp < deadline);
        isApproved[msg.sender] = true;
        addLiquidity();
        /*
        bytes32 permitTypeHash = keccak256(
            abi.encode(
                keccak256(
                    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                ),
                msg.sender,
                address(this),
                msg.value,
                nonce,
                deadline
            )
        );
        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, permitTypeHash)
        );
        address signer = ecrecover(hash, v, r, s);
        require(signer == msg.sender, "Invalid signature");
        require(signer != address(0), "Ivalid signature");
        */
        ETHDAIpool.permit(
            msg.sender,
            address(this),
            msg.value,
            deadline,
            v,
            r,
            s
        );
        _stake(msg.value);
    }

    /**
    @param _amount Amount of tokens to withdraw 
    */
    function withdrawPoolLiquidity(uint256 _amount) external {
        _withdraw(_amount);
        _getReward();
    }
}
