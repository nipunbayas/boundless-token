const BoundlessToken = artifacts.require("../contracts/BoundlessToken.sol");

contract('BoundlessToken', function() {
   it('sets the total supply upon deployment', function() {
       return BoundlessToken.deployed().then(function(instance) {
          return instance.totalSupply();
       }).then(function(totalSupply) {
           assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
       });
   });
});