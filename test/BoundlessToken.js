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
   });

   it('approves tokens for delegated transfer', function() {
       return BoundlessToken.deployed().then(function(instance) {
           tokenInstance = instance;
           return tokenInstance.approve.call(accounts[1], 100);     // does not create a transaction
       }).then(function(success) {
          assert.equal(success, true, 'approve returns true');
          return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
       }).then(function(receipt) {
           assert.equal(receipt.logs.length, 1, 'triggers one event');
           assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
           assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
           assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
           assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
           return tokenInstance.allowance(accounts[0], accounts[1]);
       }).then(function(allowance) {
           assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
       });
   });

   it('handles delegated token transfers', function() {
       let fromAccount = accounts[2];
       let toAccount = accounts[3];
       let spendingAccount = accounts[4];    // spending account

       return BoundlessToken.deployed().then(function(instance) {
          tokenInstance = instance;

          // transfer some tokens to fromAccount
          return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
      }).then(function(receipt) {
           assert.equal(receipt.logs.length, 1, 'triggers one event');
           assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');

          // approve spendingAccount to spend 10 tokens from fromAccount
          return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
      }).then(function(receipt) {
           assert.equal(receipt.logs.length, 1, 'triggers one event');
           assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');

          // try transferring an amount larger than the sender's balance
           return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
       }).then(assert.fail).catch(function(error) {
           assert(error.message.indexOf('revert') >= 0, 'cannot transfer a value greater than the balance');

           // try transferring an amount larger than the approved amount
           return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
       }).then(assert.fail).catch(function(error) {
           assert(error.message.indexOf('revert') >= 0, 'cannot transfer a value greater than the approved amount');

           return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
       }).then(function(success) {
           assert.equal(success, true);

           return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
       }).then(function(receipt) {
           assert.equal(receipt.logs.length, 1, 'triggers one event');
           assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
           assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
           assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
           assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');

           return tokenInstance.balanceOf(fromAccount);
       }).then(function(balance) {
           assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');

           return tokenInstance.balanceOf(toAccount);
       }).then(function(balance) {
           assert.equal(balance.toNumber(), 10, 'adds the amount to the receiving account');

           return tokenInstance.allowance(fromAccount, spendingAccount);
       }).then(function(allowance) {
           assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
       });
   });
});