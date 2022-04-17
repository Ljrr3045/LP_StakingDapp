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
    });



    it("prueba", async ()=> {

        let allowanceParameters = await signERC2612Permit(signerWallet, lpDai.address, signerAddress, lpStakingMain.address, "100000000000000000000000000");

        await lpDai.connect(owner).permit(signerAddress, lpStakingMain.address, "100000000000000000000000000", allowanceParameters.deadline, allowanceParameters.v, allowanceParameters.r, allowanceParameters.s);

        expect(await lpDai.connect(owner).allowance(signerAddress, lpStakingMain.address)).to.equal("100000000000000000000000000");
    });

});