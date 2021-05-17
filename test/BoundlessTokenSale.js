const BoundlessToken = artifacts.require("../contracts/BoundlessToken.sol");
const BoundlessTokenSale = artifacts.require("../contracts/BoundlessTokenSale.sol");

contract('BoundlessTokenSale', function (accounts) {
    let tokenInstance;
    let tokenSaleInstance;
    let tokenPrice = 1000000000000000; // this is 10^15 wei or 0.001 ether
    let tokensAvailable = 750000;

    let admin = accounts[0];
    let buyer = accounts[1];

    it('initializes the contract with the correct values', function() {
       return BoundlessTokenSale.deployed().then(function(instance) {
          tokenSaleInstance = instance;
          return tokenSaleInstance.address;
       }).then(function(address) {
           assert.notEqual(address, 0x0, 'has contract address');
           return tokenSaleInstance.tokenContract();
       }).then(function(address) {
           assert.notEqual(address, 0x0, 'has token contract address');
           return tokenSaleInstance.tokenPrice();
       }).then(function(price) {
           assert.equal(price, tokenPrice, 'token price is correct');
       });
    });

    it('facilitates token buying', function() {
        let numberOfTokens = 10;
        let value = numberOfTokens * tokenPrice;

        return BoundlessToken.deployed().then(function(instance) {
            // grab token instance first
            tokenInstance = instance;
            return BoundlessTokenSale.deployed();
        }).then(function(instance) {
            // then grab token sale instance
            tokenSaleInstance = instance;
            // provision 75% of all tokens to the BoundlessTokenSale contract
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: value });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
            // check that the buyer now owns 'numberOfTokens'
            assert.equal(balance.toNumber(), numberOfTokens);

            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            // check that the number of tokens available to the smart contract decreased
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);

            // Try to buy tokens different from the ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');

            return tokenSaleInstance.buyTokens(800000, { from: buyer, value: value })
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert' >= 0, 'cannot purchase more tokens than available in the contract'));
        });
    })
});