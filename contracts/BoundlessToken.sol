pragma solidity ^0.5.16;

contract BoundlessToken {
    uint256 public totalSupply;

    // Constructor
    constructor() public {
        totalSupply = 1000000;
    }
}