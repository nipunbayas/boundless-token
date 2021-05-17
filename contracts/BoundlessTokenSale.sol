pragma solidity ^0.5.16;

import "./BoundlessToken.sol";

contract BoundlessTokenSale {
    address admin;
    BoundlessToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(
        address _buyer,
        uint256 _amount
    );

    // 'internal' function to this contract. Does not read or write to the Blockchain (hence 'pure')
    function multiply(uint x, uint y) internal pure returns(uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    constructor(BoundlessToken _tokenContract, uint256 _tokenPrice) public {
        // assign an admin
        admin = msg.sender;
        // token contract
        tokenContract = _tokenContract;
        // token price
        tokenPrice = _tokenPrice;
    }

    // function to facilitate token buying. It has 'payable' access modifier so that we can transfer ethers
    function buyTokens(uint256 _numberOfTokens) public payable {
        // require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));

        // require this contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

        // require that the transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        // keep track of the number of tokens sold
        tokensSold += _numberOfTokens;
        // trigger sell event
        emit Sell(msg.sender, _numberOfTokens);
    }
}