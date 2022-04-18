const { ethers, upgrades } = require("hardhat");

async function main() {
    let lpDai = "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11";
    let [owner] = await ethers.getSigners();

    const ErcToken = await ethers.getContractFactory("ErcToken");
    const ercToken = await ErcToken.deploy("HouseToken", "HT");

    const LPStakingMain = await ethers.getContractFactory("LPStakingMain");
    const lpStakingMain = await upgrades.deployProxy(LPStakingMain, [lpDai, ercToken.address, 0] ,{ initialize: "initialize"});

    await ercToken.connect(owner).mint(lpStakingMain.address, ethers.utils.parseEther("100000"));

    console.log("Contrac Token Address is:", ercToken.address);
    console.log("Contrac LpStaking Address is:", lpStakingMain.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});