import { task } from "hardhat/config";

task("redeem", "Redeem tokens on the bridge")
  .addParam('address', "The bridge address")
  .addParam('validator', "The validator address")
  .addParam('to', "The address that will get tokens")
  .addParam('amount', "Tokens amount")
  .addParam('signaturev', "Signature v")
  .addParam('signaturer', "Signature r")
  .addParam('signatures', "Signature s")
  .addParam('nonce', "Operation nonce")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractFactory('Bridge');
    const bridge = contract.attach(taskArgs.address!);
    await bridge.redeem(taskArgs.validator, taskArgs.to, taskArgs.amount, taskArgs.signaturev, taskArgs.signaturer, taskArgs.signatures, taskArgs.nonce);
    console.log("Done");
  });