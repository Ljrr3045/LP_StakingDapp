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

        dai = await new ethers.Contract( "0x6B175474E89094C44Da98b954EedeAC495271d0F" , daiAbi);
        lpDai = await new ethers.Contract( "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11" , lpDaiAbi);

        let ErcToken = await ethers.getContractFactory("ErcToken");
        ercToken = await ErcToken.deploy("HouseToken", "HT");

        [owner, per1] = await ethers.getSigners();

        const LPStakingMain = await ethers.getContractFactory("LPStakingMain");
        lpStakingMain = await upgrades.deployProxy(LPStakingMain, { initializer: false });
        await lpStakingMain.connect(owner).initialize(dai.address, ercToken.address);

        rpcUrl = process.env.MAINNET_URL;
        privateKey = process.env.ADDRESS_PRIVATE_KEY;
        rpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
        signerWallet = new ethers.Wallet(privateKey, rpcProvider);
        signerAddress = await signerWallet.getAddress();

        await network.provider.send("hardhat_setBalance", [
            signerWallet.address,
            ethers.utils.formatBytes32String("10000000000000000000000000"),
        ]);
    });

    it("Error: The contract only needs to be started once", async ()=> {

        await expect(lpStakingMain.connect(owner).initialize(dai.address, ercToken.address)).to.be.revertedWith("Contract are initialized");
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

        // await lpDai.connect(per1).permit(owner.address, lpStakingMain.address, ethers.utils.parseEther("1000"), data.deadline, data.v, data.r, data.s);

        expect(await lpDai.connect(owner).allowance(owner.address, lpStakingMain.address)).to.equal(ethers.utils.parseEther("1000"));
    });

});