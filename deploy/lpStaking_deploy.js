const CONTRACT_NAME = "LPStakingMain";

module.exports = async ({ getNamedAccounts, deployments }) => {

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  
  let lpDai = "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11";

  const ercToken = await deploy('ErcToken', {
    from: deployer,
    args: ["HouseToken", "HT"],
    log: true,
  });

  const lpStakingMain = await deploy("LPStakingMain", {
    from: deployer,
    proxy: {
      owner: deployer,
      execute: {
        init: {
          methodName: "initialize",
          args: [lpDai, ercToken.address, 0],
        },
      },
    },
  });

  console.log("Contrac Token Address is:", ercToken.address);
  console.log("Contrac LpStaking Address is:", lpStakingMain.address);
};

module.exports.tags = [CONTRACT_NAME];