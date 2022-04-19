const { ethers, upgrades } = require("hardhat");

async function main() {

  const ErcToken = await ethers.getContractFactory("ErcToken");
  const ercToken = await ErcToken.deploy("HouseToken", "HT");

  console.log("Contrac Token Address is:", ercToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
