pragma solidity ^0.5.16;

contract BoundlessToken {
    string public name = "Boundless Token";
    string public symbol = "BNLS";
    string public standard = "Boundless Token v1.0"; // not part of ERC20 specification
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // constructor
    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // transfer tokens from one user to another
    function transfer(address _to, uint256 _value) public returns(bool success) {
        require(balanceOf[msg.sender] >= _value);

        // transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // trigger a transfer event
        emit Transfer(msg.sender, _to, _value);

        // return a boolean
        return true;
    }

    // approve sending tokens on behalf of a user
    function approve(address _spender, uint256 _value) public returns(bool success) {
        // update the allowance mapping
        allowance[msg.sender][_spender] = _value;

        // trigger an approval event
        emit Approval(msg.sender, _spender, _value);

        // return a boolean
        return true;
    }

    // transfers _value amount of tokens from address _from to address _to
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success) {
        // check that _from has enough tokens
        require(balanceOf[_from] >= _value);

        // check that the allowance is big enough - not transferring more tokens than we are allowed to
        require(allowance[_from][msg.sender] >= _value);

        // change the balance of the sending and receiving account
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // update the allowance of the spending account
        allowance[_from][msg.sender] -= _value;

        // trigger a transfer event
        emit Transfer(_from, _to, _value);

        // return a boolean
        return true;
    }
}