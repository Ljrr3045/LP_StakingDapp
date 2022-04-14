//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0<0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IPeripheryPayments.sol";
import "./Interfaces/IUniswapV2Router.sol";
import "./Interfaces/IUniswapV2Pair.sol";
import "./Interfaces/IUniswapV2Factory.sol";

contract LpContract {
    using SafeMath for uint;

    address internal dai;
    address internal weth;
    ISwapRouter internal swapRouter;
    IPeripheryPayments internal peripheryPayments;
    IUniswapV2Router internal routerV2;
    IUniswapV2Factory internal factoryV2;

    constructor(){

        dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
        weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

        swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
        peripheryPayments = IPeripheryPayments(0xE592427A0AEce92De3Edee1F18E0157C05861564);

        routerV2 = IUniswapV2Router(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        factoryV2 = IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);
    }

    function addLiquidity() public payable{
        uint amountInWeth;

        _swapEthForWeth(msg.value);
        amountInWeth = IERC20(weth).balanceOf(address(this));

        zap(amountInWeth);
    }

    function zap(uint _amount) internal {

        address pair = factoryV2.getPair(weth, dai);
        (uint reserve0, uint reserve1, ) = IUniswapV2Pair(pair).getReserves();
        uint swapAmount;

        if (IUniswapV2Pair(pair).token0() == weth) {
            swapAmount = _getSwapAmount(reserve0, _amount);
        } else {
            swapAmount = _getSwapAmount(reserve1, _amount);
        }

        _swapWethForDai(swapAmount);
        _addLiquidity();
    }

    function _sqrt(uint y) internal pure returns (uint z) {
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

    function _getSwapAmount(uint r, uint a) internal pure returns (uint) {
        return (_sqrt(r.mul(r.mul(3988009) + a.mul(3988000))).sub(r.mul(1997))) / 1994;
    }

    function _swapEthForWeth(uint amountIn) internal {

        uint24 poolFee = 3000;

        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: weth,
                tokenOut: weth,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp + 10,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            }
        );

        swapRouter.exactInputSingle{ value: amountIn }(params);
        peripheryPayments.refundETH();
    }

    function _swapWethForDai(uint _amountIn) internal {

        uint24 poolFee = 3000;

        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: weth,
                tokenOut: dai,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp + 10,
                amountIn: _amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            }
        );

        swapRouter.exactInputSingle(params);
    }

    function _getPair(address _tokenA, address _tokenB) internal view returns (address) {
        return factoryV2.getPair(_tokenA, _tokenB);
    }

    function _addLiquidity() internal {

        uint balA = IERC20(weth).balanceOf(address(this));
        uint balB = IERC20(dai).balanceOf(address(this));
        IERC20(weth).approve(address(routerV2), balA);
        IERC20(dai).approve(address(routerV2), balB);

        routerV2.addLiquidity(
            weth,
            dai,
            balA,
            balB,
            0,
            0,
            tx.origin,
            block.timestamp
        );
    }
}