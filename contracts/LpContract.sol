//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0<0.9.0;

// CONTRACTS
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// INTERFACES
import "./Interfaces/IUniswapV2Router.sol";
import "./Interfaces/IUniswapV2Pair.sol";
import "./Interfaces/IUniswapV2Factory.sol";

contract LpContract{
    using SafeMath for uint;

// VARIABLES 
    address internal dai;
    address internal weth;
    IUniswapV2Router internal routerV2;
    IUniswapV2Factory internal factoryV2;

    enum NetWork {Maint, Ropsten} // Blockchain number

// FUNCTIONS

/**
@param _netWork Blockchain number
@dev Initialize the contract 
 */
    function _LpContract_init(NetWork _netWork) internal {

        if(_netWork == NetWork.Maint){

            dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
            weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        }else{

            dai = 0xaD6D458402F60fD3Bd25163575031ACDce07538D;
            weth = 0xc778417E063141139Fce010982780140Aa0cD5Ab;
        }

        routerV2 = IUniswapV2Router(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        factoryV2 = IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);
    }

/**
@dev Add liquidity to UNISWAP pool
 */
    function addLiquidity() internal{

        _swapEthForDai(_swapAmount(msg.value));
        uint _amountTokenDesired = IERC20(dai).balanceOf(address(this));
        uint _amountEthAdd = address(this).balance - 10;
        IERC20(dai).approve(address(routerV2), _amountTokenDesired);

        routerV2.addLiquidityETH{value: _amountEthAdd}(
            dai,
            _amountTokenDesired,
            0,
            0,
            msg.sender,
            block.timestamp
        );

        uint refoundDai = IERC20(dai).balanceOf(address(this));

        if(address(this).balance > 0){

            (bool success,) = msg.sender.call{ value: address(this).balance }("");
            require(success, "refund failed");
        }

        if(refoundDai > 0){
            IERC20(dai).transfer(msg.sender, refoundDai);
        }

    }
/**
@param y Number to obtain square root 
 */
    function _sqrt(uint y) private pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        }else if (y != 0) {
            z = 1;
        }
    }
/**
@dev Calculate the SWAP amount to obtain
 */
    function _getSwapAmount(uint r, uint a) private pure returns (uint) {
        return (_sqrt(r.mul(r.mul(3988009) + a.mul(3988000))).sub(r.mul(1997))) / 1994;
    }
 /**
 @param _amount Amount to SWAP
  */
    function _swapAmount(uint _amount) private view returns(uint){
        uint _swap;

        address pair = factoryV2.getPair(weth, dai);
        (uint reserve0, uint reserve1, ) = IUniswapV2Pair(pair).getReserves();

        if (IUniswapV2Pair(pair).token0() == weth) {
            _swap = _getSwapAmount(reserve0, _amount);
        } else {
            _swap = _getSwapAmount(reserve1, _amount);
        }

        return _swap;
    }
/**
@dev SWAP ETHER to DAI 
@param _amount Amount to SWAP
 */
    function _swapEthForDai(uint _amount) private {

        address[] memory path = new address[](2);
        path = new address[](2);
        path[0] = weth;
        path[1] = dai;

        routerV2.swapExactETHForTokens {value : _amount}(
            1,
            path,
            address(this),
            block.timestamp
        );
    }
}