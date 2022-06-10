//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./ERC20Token.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Bridge {
    using ECDSA for bytes32;
    ERC20Token private _erc20Token;
    mapping(bytes32 => bool) private _executedOperations;
    address private _owner;

    event SwapInitialized(
        address from,
        address to,
        uint256 amount,
        uint256 fromChainId,
        uint256 toChainId,
        uint256 nonce
    );

    modifier restricted() {
        require(
            msg.sender == _owner,
            "Only the owner of the contract can perform this operation"
        );
        _;
    }

    constructor() {
        _owner = msg.sender;
        _erc20Token = new ERC20Token("New Coin", "NewCoin", 2, 100);
    }

    function getErc20Address() public view returns (address) {
        return address(_erc20Token);
    }

    function burn(address from, uint256 amount) external restricted {
        _erc20Token.burn(from, amount);
    }

    function mint(address to, uint256 amount) external restricted {
        _erc20Token.mint(to, amount);
    }

    function swap(
        address to,
        uint256 amount,
        uint256 chainId,
        uint256 nonce
    ) external {
        _erc20Token.burn(msg.sender, amount);

        emit SwapInitialized(
            msg.sender,
            to,
            amount,
            block.chainid,
            chainId,
            nonce
        );
    }

    function redeem(
        address validator,
        address to,
        uint256 amount,
        uint8 signatureV,
        bytes32 signatureR,
        bytes32 signatureS,
        uint256 nonce
    ) external {
        bytes32 message = keccak256(abi.encodePacked(to, amount));

        require(
            !_executedOperations[message],
            "Tokens have been already redeemed"
        );
        require(
            checkSignature(
                validator,
                message,
                signatureV,
                signatureR,
                signatureS
            ),
            "Signature is invalid"
        );
        _executedOperations[message] = true;
        _erc20Token.mint(to, amount);
    }

    function checkSignature(
        address validator,
        bytes32 messageHash,
        uint8 signatureV,
        bytes32 signatureR,
        bytes32 signatureS
    ) internal view returns (bool) {
        return
            validator ==
            messageHash.toEthSignedMessageHash().recover(
                signatureV,
                signatureR,
                signatureS
            );
    }
}
