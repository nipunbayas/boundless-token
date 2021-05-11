pragma solidity ^0.5.16;

contract BoundlessToken {
    string public name = "Boundless Token";
    string public symbol = "BNLS";
    string public standard = "Boundless Token v1.0"; // not part of ERC20 specification
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    // Constructor
    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns(bool success) {
        require(balanceOf[msg.sender] >= _value);

        // Transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // Trigger a transfer event
        emit Transfer(msg.sender, _to, _value);

        //return a boolean
        return true;
    }
}