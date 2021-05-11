const BoundlessToken = artifacts.require("../contracts/BoundlessToken.sol");

contract('BoundlessToken', function(accounts) {
    let tokenInstance;

    it ('initializes the contract with the correct values', function() {
       return BoundlessToken.deployed().then(function(instance) {
           tokenInstance = instance;
           return tokenInstance.name();
       }).then(function(name) {
           assert.equal(name, 'Boundless Token', 'has the correct name');
           return tokenInstance.symbol();
       }).then(function(symbol) {
           assert.equal(symbol, 'BNLS', 'has the correct symbol');
           return tokenInstance.standard();
       }).then(function(standard) {
           assert.equal(standard, 'Boundless Token v1.0', 'has the correct standard');
       });
    });

   it('sets the total supply upon deployment', function() {
       return BoundlessToken.deployed().then(function(instance) {
           tokenInstance = instance;
           return tokenInstance.totalSupply();
       }).then(function(totalSupply) {
           assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
           return tokenInstance.balanceOf(accounts[0]);
       }).then(function(adminBalance) {
           assert.equal(adminBalance.toNumber(), 1000000, 'allocate the initial supply to admin account');
       });
   });

   it('transfers token ownership with event', function() {
       return BoundlessToken.deployed().then(function(instance) {
           tokenInstance = instance;
           // Test to check if the sender has sufficient balance
           return tokenInstance.transfer.call(accounts[1], 99999999999);    // .call does not trigger a transaction
       }).then(assert.fail).catch(function(error) {
           assert(error.message.indexOf('revert') >= 0, 'error message must contain the word revert');
           return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
       }).then(function(success) {
           assert.equal(success, true, 'it returns true');
           return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });   // triggers a transaction
       }).then(function(receipt) {
           assert.equal(receipt.logs.length, 1, 'triggers one event');
           assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
           assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
           assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
           assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
           return tokenInstance.balanceOf(accounts[1]);
       }).then(function(balance) {
           assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');
           return tokenInstance.balanceOf(accounts[0]);
       }).then(function(balance) {
          assert.equal(balance.toNumber(), 750000, 'deducts the amount from the sending account');
       });
   })
});