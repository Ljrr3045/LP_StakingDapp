const { expect, assert } = require("chai");
const { ethers, upgrades } = require("hardhat");
const daiAbi = require("./ContractJson/Dai.json");
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
    time, // Time helper 
} = require('@openzeppelin/test-helpers');

let lpStakingMain, ercToken, dai;

before(async function () {
    [account1, account2, account3, account4] = await ethers.getSigners();
    dai = new ethers.Contract("0x6B175474E89094C44Da98b954EedeAC495271d0F", daiAbi);
    let ErcToken = await ethers.getContractFactory("ErcToken");
    ercToken = await ErcToken.deploy("HouseToken", "HT");

})

describe("LPStakingMain", function () {
    it("Should deploy lpStakingMain and initialize ", async function () {
        const LPStakingMain = await ethers.getContractFactory("LPStakingMain");
        lpStakingMain = await upgrades.deployProxy(LPStakingMain, { initializer: false });
        console.log(`LPStakingMain has been deployed in : ${lpStakingMain.address}`);
        await lpStakingMain.initialize(dai.address, ercToken.address);
        expect(await lpStakingMain.rewardRate()).to.equal(100);
    });
    it("Should add liquidity and stake", async function () {
        let deadline = (await time.latest() + time.duration.days(1));
        let nonce = await ethers.provider.getTransactionCount(account1.address);
        const EIP712Domain = [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
        ];
        const domain = {
            name: "Uniswap V2",
            version: "1",
            chainId: 1,
            verifyingContract: "0xa1484C3aa22a66C62b77E0AE78E15258bd0cB711"
        };
        const Permit = [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" }
        ]
        const message = {
            owner: account1.address,
            spender: lpStakingMain.address,
            value: (ethers.utils.parseEther("1")).toString(),
            nonce: nonce,
            deadline: deadline
        };
        const data = JSON.stringify({
            types: {
                EIP712Domain,
                Permit,
            },
            domain,
            primaryType: "Permit",
            message
        });
        const signature = await ethers.provider.send("eth_signTypedData_v4", [account1.address, data]);
        const signData = ethers.utils.splitSignature(signature);
        const { v, r, s } = signData;
        console.log(v, r, s);
        await lpStakingMain.addPoolLiquidity(v, r, s, deadline, { value: ethers.utils.parseEther("1") });
    });
});
