import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage";
import "dotenv/config";
import "./tasks/mint";
import "./tasks/swap";
import "./tasks/redeem";

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.RINKEBY_PRIVATE_KEY}`, `${process.env.RINKEBY_PRIVATE_KEY_SECOND_ACC}`],
      gas: 5000_000,
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gas: 5000_000,
      accounts: [`${process.env.RINKEBY_PRIVATE_KEY}`, `${process.env.RINKEBY_PRIVATE_KEY_SECOND_ACC}`]
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
