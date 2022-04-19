require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require('hardhat-deploy');
require("dotenv").config();
require("@ethersproject/providers");
require("@nomiclabs/hardhat-web3");
require('eth-permit');
require('@openzeppelin/test-environment');


task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: {
    compilers: [{
      version: "0.5.16"
    },
    {
      version: "0.7.6"
    },
    {
      version: "0.8.8"
    }]
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_URL, //For Ropsten: process.env.ROPSTEN_URL
        blockNumber: 14578717, //For Ropsten: 12203985
      }
    },
    // ropsten: {
    //   url: process.env.ROPSTEN_URL,
    //   accounts:{
    //     mnemonic: process.env.MNEMONIC
    //   },
    // },
  },
  etherscan: {
    apiKey: {
      ropsten: process.env.ETHERSCAN_API_KEY
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: 0,
    user1: 1,
    user2: 2,
  },
};
