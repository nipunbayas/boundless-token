const BoundlessToken = artifacts.require("BoundlessToken");

module.exports = function (deployer) {
    deployer.deploy(BoundlessToken);
};
