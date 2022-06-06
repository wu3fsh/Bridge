import { ethers, network } from "hardhat";
import { Contract, ContractFactory, Signature, Signer } from "ethers";
import { expect } from "chai";

describe("Bridge", function () {
  const name: string = "Test Coin";
  const symbol: string = "Test Coin";
  const decimals: number = 2;
  const totalSupply: number = 100;
  const emptyAddress = "0x0000000000000000000000000000000000000000";
  let owner: Signer;
  let addresses: Signer[];
  let erc20tokensFactory: ContractFactory;
  let bridgeFactory: ContractFactory;
  let bridge: Contract;
  let erc20token: Contract;

  beforeEach(async function () {
    [owner, ...addresses] = await ethers.getSigners();

    erc20tokensFactory = await ethers.getContractFactory('ERC20Token');

    bridgeFactory = await ethers.getContractFactory('Bridge');
    bridge = await bridgeFactory.connect(addresses[1]).deploy();
  });

  it("should mint tokens", async function () {
    const amount: number = 10;
    const erc20TokenAddress: string = await bridge.getErc20Address();
    erc20token = erc20tokensFactory.attach(erc20TokenAddress);

    expect(await erc20token.balanceOf(addresses[2].getAddress())).to.equal(0);
    await bridge.connect(addresses[1]).mint(addresses[2].getAddress(), amount);
    expect(await erc20token.balanceOf(addresses[2].getAddress())).to.equal(amount);
  })

  it("Should throw an exception on minting if it was not made by owner ", async function () {
    const amount: number = 10;
    const erc20TokenAddress: string = await bridge.getErc20Address();
    erc20token = erc20tokensFactory.attach(erc20TokenAddress);

    try {
      expect(await bridge.connect(addresses[2]).mint(addresses[2].getAddress(), amount)).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Only the owner of the contract can perform this operation");
    }
  })

  it("should burn tokens", async function () {
    const amount: number = 10;
    const erc20TokenAddress: string = await bridge.getErc20Address();
    erc20token = erc20tokensFactory.attach(erc20TokenAddress);

    expect(await erc20token.balanceOf(addresses[2].getAddress())).to.equal(0);
    await bridge.connect(addresses[1]).mint(addresses[2].getAddress(), amount);
    expect(await erc20token.balanceOf(addresses[2].getAddress())).to.equal(amount);
    await bridge.connect(addresses[1]).burn(addresses[2].getAddress(), amount);
    expect(await erc20token.balanceOf(addresses[2].getAddress())).to.equal(0);
  })

  it("Should throw an exception on burning if it was not made by owner ", async function () {
    const amount: number = 10;
    const erc20TokenAddress: string = await bridge.getErc20Address();
    erc20token = erc20tokensFactory.attach(erc20TokenAddress);

    try {
      expect(await bridge.connect(addresses[2]).burn(addresses[2].getAddress(), amount)).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Only the owner of the contract can perform this operation");
    }
  })

  it("should swap tokens", async function () {
    const amount: number = 10;
    const address: string = await addresses[2].getAddress();
    const validator: Signer = await addresses[5];
    const chainId: number = 97;
    const nonce: number = 1;

    const erc20TokenAddress: string = await bridge.getErc20Address();
    erc20token = erc20tokensFactory.attach(erc20TokenAddress);
    await bridge.connect(addresses[1]).mint(addresses[1].getAddress(), 30);
    let balance: number = await erc20token.balanceOf(addresses[1].getAddress());

    await bridge.connect(addresses[1]).swap(address, amount, chainId, nonce);
    expect(await erc20token.balanceOf(addresses[1].getAddress())).to.equal(balance - amount)

    let msg: string = ethers.utils.solidityKeccak256(["address", "uint256"], [address, amount]);
    let signature: string = await validator.signMessage(ethers.utils.arrayify(msg));
    let sig: Signature = ethers.utils.splitSignature(signature);
    await bridge.redeem(validator.getAddress(), address, amount, sig.v, sig.r, sig.s, nonce);
    expect(await erc20token.balanceOf(addresses[2].getAddress())).to.equal(amount);
  })

  it("Should throw an exception if the tokens have been already redeemed", async function () {
    const amount: number = 10;
    const address: string = await addresses[2].getAddress();
    const validator: Signer = await addresses[5];
    const chainId: number = 97;
    const nonce: number = 1;

    const erc20TokenAddress: string = await bridge.getErc20Address();
    erc20token = erc20tokensFactory.attach(erc20TokenAddress);
    await bridge.connect(addresses[1]).mint(addresses[1].getAddress(), 30);
    let balance = await erc20token.balanceOf(addresses[1].getAddress());

    await bridge.connect(addresses[1]).swap(address, amount, chainId, nonce);
    expect(await erc20token.balanceOf(addresses[1].getAddress())).to.equal(balance - amount)

    let msg = ethers.utils.solidityKeccak256(["address", "uint256"], [address, amount]);
    let signature = await validator.signMessage(ethers.utils.arrayify(msg));
    let sig = ethers.utils.splitSignature(signature);
    await bridge.redeem(validator.getAddress(), address, amount, sig.v, sig.r, sig.s, nonce);
    expect(await erc20token.balanceOf(addresses[2].getAddress())).to.equal(amount);

    try {
      expect(await bridge.redeem(validator.getAddress(), address, amount, sig.v, sig.r, sig.s, nonce)).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Tokens have been already redeemed");
    }
  })

  it("Should throw an exception if the signature is invalid", async function () {
    const amount: number = 10;
    const address: string = await addresses[2].getAddress();
    const validator: Signer = await addresses[5];
    const chainId: number = 97;
    const nonce: number = 1;

    const erc20TokenAddress: string = await bridge.getErc20Address();
    erc20token = erc20tokensFactory.attach(erc20TokenAddress);
    await bridge.connect(addresses[1]).mint(addresses[1].getAddress(), 30);
    let balance = await erc20token.balanceOf(addresses[1].getAddress());

    await bridge.connect(addresses[1]).swap(address, amount, chainId, nonce);
    expect(await erc20token.balanceOf(addresses[1].getAddress())).to.equal(balance - amount)

    let msg = ethers.utils.solidityKeccak256(["address", "uint256"], [address, amount]);
    let signature = await validator.signMessage(ethers.utils.arrayify(msg));
    let sig = ethers.utils.splitSignature(signature);

    try {
      expect(await bridge.redeem(addresses[1].getAddress(), address, amount, sig.v, sig.r, sig.s, nonce)).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Signature is invalid");
    }
  })
});