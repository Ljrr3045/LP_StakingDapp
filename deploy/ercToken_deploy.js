const CONTRACT_NAME = "ErcToken";

module.exports = async ({getNamedAccounts, deployments}) => {

    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    const ercToken = await deploy('ErcToken', {
      from: deployer,
      args: ["HouseToken", "HT"],
      log: true,
    });

    console.log("Contrac Token Address is:", ercToken.address);
};

module.exports.tags = [CONTRACT_NAME];