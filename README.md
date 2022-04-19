# Lp Staking Dapp <br>

The purpose of this project is to develop a Dapp where users, from the investment of ETH, can exchange their tokens for uniswap LPDai and 
in turn stake these in this project in order to receive profits in HouseToken.

---------------------------------------------------------------------------------------------------
# Contracs Address: <br>

- Ropsten <br>

TokenRewars: 0xD80c0e3AEb7CDe17E07Db57531aF9582B3409613<br>
LpStakinContract: 0x1493B00F5a096970c65705262ca7d193E554C10f<br>

---------------------------------------------------------------------------------------------------
# Notes: <br>

- N1 <br>

To get the value you should use in "ADDRESS_PRIVATE_KEY", you first need to run the "hardhat node" command on your console and extract the private key from the first address in the list.

Hardhat Accounts

Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80  -----> this private key

Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
<br>

- N2 <br>

The test of these contracts is designed to be done on the Mainnet, but in order to see how this project works on the Ropsten network, you should do the following:

    - Change the network where the fork is made

url: process.env.MAINNET_URL ---> For ---> url: process.env.ROPSTEN_URL<br>
blockNumber: 14578717 ---> For ---> blockNumber: 12203985<br>

    - Activate the Ropsten network test

xdescribe("LpStakingMain Ropsten" ---> For ---> describe("LpStakingMain Ropsten"

    - Disable Mainnet network tests

describe("LpContract" ---> For ---> xdescribe("LpContract"<br>
describe("LpStakingMain" ---> For ---> xdescribe("LpStakingMain"<br>
describe("StakeContract" ---> For ---> xdescribe("StakeContract"<br>
<br>


