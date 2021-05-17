const BoundlessToken = artifacts.require("BoundlessToken");
const BoundlessTokenSale = artifacts.require("BoundlessTokenSale");

module.exports = function (deployer) {
    deployer.deploy(BoundlessToken, 1000000).then(function() {
        let tokenPrice = 1000000000000000; // this is 10^15 wei or 0.001 ether
       return deployer.deploy(BoundlessTokenSale, BoundlessToken.address, tokenPrice);
    });
};
