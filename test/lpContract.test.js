const { inputToConfig } = require("@ethereum-waffle/compiler");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const daiAbi = require("./ContractJson/Dai.json");
const wethAbi = require("./ContractJson/Weth.json");

describe("LpContract", async ()=> {
    let LpContract, lpContract, weth, dai, owner, per1;

    before(async ()=> {

        dai = await new ethers.Contract( "0x6B175474E89094C44Da98b954EedeAC495271d0F" , daiAbi);
        weth = await new ethers.Contract( "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" , wethAbi);

        LpContract = await ethers.getContractFactory("LpContract");
        lpContract = await LpContract.deploy();

        [owner, per1] = await ethers.getSigners();

        expect(await dai.connect(owner).balanceOf(owner.address)).to.equal(0);
    });

    it("Error: Only the owner contract can call this function", async ()=> {

        await expect(lpContract.connect(per1).addLiquidity(
            {value: ethers.utils.parseEther("1")})
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should exchange ETH for DAI and add liquidity", async ()=> {
        expect(await ethers.provider.getBalance(lpContract.address)).to.equal(0);

        await lpContract.connect(owner).addLiquidity({value: ethers.utils.parseEther("1")});

        expect(await ethers.provider.getBalance(lpContract.address)).to.equal(0);
        expect(await dai.connect(owner).balanceOf(owner.address)).to.equal(26563);
        expect(await dai.connect(owner).balanceOf(lpContract.address)).to.equal(0);
    });
});