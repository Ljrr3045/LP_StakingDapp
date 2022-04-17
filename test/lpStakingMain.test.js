const { inputToConfig } = require("@ethereum-waffle/compiler");
const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");
const { expect, assert } = require("chai");
const { ethers, upgrades } = require("hardhat");
const daiAbi = require("./ContractJson/Dai.json");
const lpDaiAbi = require("./ContractJson/LpDai.json");
const { signERC2612Permit } = require('eth-permit');

describe("LpStakingMain", async ()=> {
    let lpStakingMain, ercToken, lpDai, dai, owner, per1, signerWallet, signerAddress, rpcUrl, privateKey, rpcProvider;

    before(async ()=> {

        [owner, per1] = await ethers.getSigners();

        dai = await new ethers.Contract( "0x6B175474E89094C44Da98b954EedeAC495271d0F" , daiAbi);
        lpDai = await new ethers.Contract( "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11" , lpDaiAbi);

        let ErcToken = await ethers.getContractFactory("ErcToken");
        ercToken = await ErcToken.deploy("HouseToken", "HT");

        const LPStakingMain = await ethers.getContractFactory("LPStakingMain");
        lpStakingMain = await upgrades.deployProxy(LPStakingMain, { initializer: false });
        await lpStakingMain.connect(owner).initialize(lpDai.address, ercToken.address, 0);

        rpcUrl = process.env.MAINNET_URL;
        privateKey = process.env.ADDRESS_PRIVATE_KEY;
        rpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
        signerWallet = new ethers.Wallet(privateKey, rpcProvider);
        signerAddress = await signerWallet.getAddress();

        await ercToken.connect(owner).mint(lpStakingMain.address, ethers.utils.parseEther("100000"));
    });

    describe("Contract initialization", async ()=> {

        it("Error: The contract only needs to be started once", async ()=> {

            await expect(lpStakingMain.connect(owner).initialize(dai.address, ercToken.address, 0)).to.be.revertedWith("Contract are initialized");
        });
    });

    describe("Adding liquidity", async ()=> {

        it("Error: Must add enough money", async ()=> {

            let data = await signERC2612Permit(
                signerWallet, 
                lpDai.address, 
                owner.address, 
                lpStakingMain.address, 
                ethers.utils.parseEther("1000")
            );

            await expect(lpStakingMain.connect(per1).addPoolLiquidity(
                data.v,
                data.r,
                data.s,
                data.deadline,
                ethers.utils.parseEther("1000"),
                {value: 0}
            )).to.be.revertedWith("Need enough money to add liquidity");
        });

        it("The user should be able to Add liquidity", async ()=> {

            let data = await signERC2612Permit(
                signerWallet, 
                lpDai.address, 
                owner.address, 
                lpStakingMain.address, 
                ethers.utils.parseEther("1000")
            );
    
            expect(owner.address).to.equal(signerAddress);
    
            await lpStakingMain.connect(owner).addPoolLiquidity(
                data.v,
                data.r,
                data.s,
                data.deadline,
                ethers.utils.parseEther("1000"),
                {value: ethers.utils.parseEther("1")}
            );
    
            let balanceInStaking = await lpStakingMain.connect(owner).balances(owner.address);
    
            expect(balanceInStaking).to.equal("33675512165700446094");
            expect(await ethers.provider.getBalance(lpStakingMain.address)).to.equal(0);
            expect(await dai.connect(owner).balanceOf(lpStakingMain.address)).to.equal(0);
            expect(await dai.connect(owner).balanceOf(owner.address)).to.equal(51683);
        });
    });

    describe("Withdrawal of money", async ()=> {

        it("Error: If you don't invest you can't withdraw", async ()=> {

            await expect(lpStakingMain.connect(per1).withdrawPoolLiquidity()).to.be.revertedWith("Don't have money to withdraw");
        });

        it("The user should be able to withdraw from the stake", async ()=> {

            await network.provider.send("evm_increaseTime", [604800]);
            await network.provider.send("evm_mine");
    
            expect(await lpDai.connect(owner).balanceOf(owner.address)).to.equal(0);
            expect(await ercToken.connect(owner).balanceOf(owner.address)).to.equal(0);
    
            await lpStakingMain.connect(owner).withdrawPoolLiquidity();
    
            expect(await lpDai.connect(owner).balanceOf(owner.address)).to.equal("33675512165700446094");
        });
    
        it("The user must have generated profit on the stake", async ()=> {
    
            expect(await ercToken.connect(owner).balanceOf(owner.address)).to.be.above(0);
        });
    })
});