import { task } from "hardhat/config";

task("mint", "Mint tokens on the bridge")
  .addParam('address', "The bridge address")
  .addParam('to', "The address that will get tokens")
  .addParam('amount', "Tokens amount")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractFactory('Bridge');
    const bridge = contract.attach(taskArgs.address!);
    await bridge.mint(taskArgs.to, taskArgs.amount);
    console.log("Done");
  });