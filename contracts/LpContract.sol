//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0<0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Interfaces/IUniswapV2Router.sol";
import "./Interfaces/IUniswapV2Pair.sol";
import "./Interfaces/IUniswapV2Factory.sol";

contract LpContract is Ownable{
    using SafeMath for uint;

    address internal dai;
    address internal weth;
    IUniswapV2Router internal routerV2;
    IUniswapV2Factory internal factoryV2;

    constructor(){

        dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
        weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

        routerV2 = IUniswapV2Router(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        factoryV2 = IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);
    }

    function addLiquidity() public payable onlyOwner(){

        _swapEthForDai(_swapAmount(msg.value));
        uint _amountTokenDesired = IERC20(dai).balanceOf(address(this));
        uint _amountEthAdd = address(this).balance - 10;
        IERC20(dai).approve(address(routerV2), _amountTokenDesired);

        routerV2.addLiquidityETH{value: _amountEthAdd}(
            dai,
            _amountTokenDesired,
            0,
            0,
            tx.origin,
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

    function _getSwapAmount(uint r, uint a) private pure returns (uint) {
        return (_sqrt(r.mul(r.mul(3988009) + a.mul(3988000))).sub(r.mul(1997))) / 1994;
    }

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