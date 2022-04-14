const { inputToConfig } = require("@ethereum-waffle/compiler");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const daiAbi = require("./ContractJson/Dai.json");

describe("StakeContract", async ()=> {
  let StakeContract, stakeContract, ErcToken, ercToken, dai, owner, per1, perDai;

  before(async ()=> {

    await hre.network.provider.request({ method: "hardhat_impersonateAccount",params: ["0x820c79d0b0c90400cdd24d8916f5bd4d6fba4cc3"],});

    dai = await new ethers.Contract( "0x6B175474E89094C44Da98b954EedeAC495271d0F" , daiAbi);

    ErcToken = await ethers.getContractFactory("ErcToken");
    ercToken = await ErcToken.deploy("HouseToken", "HT");

    StakeContract = await ethers.getContractFactory("StakeContract");
    stakeContract = await StakeContract.deploy(dai.address, ercToken.address);

    [owner, per1] = await ethers.getSigners();
    perDai = await ethers.getSigner("0x820c79d0b0c90400cdd24d8916f5bd4d6fba4cc3");

    await network.provider.send("hardhat_setBalance", [
      perDai.address,
      ethers.utils.formatBytes32String("5000000000000000000"),
    ]);

    await dai.connect(perDai).transfer(per1.address, ethers.utils.parseEther("1000"));

    expect(await dai.connect(per1).balanceOf(per1.address)).to.equal(ethers.utils.parseEther("1000"));
  });

  it("Stake Contract should receive reward token", async ()=> {

    expect(await ercToken.connect(owner).balanceOf(stakeContract.address)).to.equal(0);

    await ercToken.connect(owner).mint(stakeContract.address, ethers.utils.parseEther("100000"));

    expect(await ercToken.connect(owner).balanceOf(stakeContract.address)).to.equal(ethers.utils.parseEther("100000"));
  });

  it("It should be possible to place money in the stake", async ()=> {

    await dai.connect(per1).approve(stakeContract.address, ethers.utils.parseEther("1000"));

    await stakeContract.connect(per1).stake(ethers.utils.parseEther("1000"));

    expect(await dai.connect(per1).balanceOf(stakeContract.address)).to.equal(ethers.utils.parseEther("1000"));
  });

  it("It should be possible to withdraw the money in the stake", async ()=> {

    await network.provider.send("evm_increaseTime", [604800]);
    await network.provider.send("evm_mine");

    await stakeContract.connect(per1).withdraw(ethers.utils.parseEther("1000"));

    expect(await dai.connect(per1).balanceOf(stakeContract.address)).to.equal(0);
    expect(await dai.connect(per1).balanceOf(per1.address)).to.equal(ethers.utils.parseEther("1000"));
  });

  it("It should be possible to withdraw the reward generated in the stake", async ()=> {

    expect(await ercToken.connect(owner).balanceOf(per1.address)).to.equal(0);

    await stakeContract.connect(per1).getReward();

    let rewardUser = await ercToken.connect(owner).balanceOf(per1.address);
    let balanceStaker = await ercToken.connect(owner).balanceOf(stakeContract.address);

    expect(rewardUser).to.be.above(0);
    expect(balanceStaker).to.be.below(ethers.utils.parseEther("100000"));
  });
});
