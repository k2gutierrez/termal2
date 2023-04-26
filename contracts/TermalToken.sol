//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TermalToken is ERC20, Ownable {

    constructor(uint256 initialSupply) ERC20("Termal Token", "TML") {
        _mint(msg.sender, initialSupply);
    }

}