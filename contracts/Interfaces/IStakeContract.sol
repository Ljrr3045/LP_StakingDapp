//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0<0.9.0;

interface IStakeContract {
    function getReward() external;
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;  
}