import { task } from "hardhat/config";

task("swap", "Swap tokens between chains")
  .addParam('address', "The bridge address")
  .addParam('to', "The address that will get tokens")
  .addParam('amount', "Tokens amount")
  .addParam('chainid', "Chain id on which acoount will get tokens")
  .addParam('nonce', "Operation nonce")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractFactory('Bridge');
    const bridge = contract.attach(taskArgs.address!);
    await bridge.swap(taskArgs.to, taskArgs.amount, taskArgs.chainid, taskArgs.nonce);
    console.log("Done");
  });