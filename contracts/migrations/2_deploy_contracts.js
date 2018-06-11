const CVCToken = artifacts.require("./CVCToken.sol");
const CVStateChannel = artifacts.require("./CVStateChannel.sol");

const CVCTokenTotalSupply = 1000000000;

module.exports = function(deployer) {
  deployer.deploy(CVCToken, CVCTokenTotalSupply).then(function() {
    return deployer.deploy(CVStateChannel, CVCToken.address);
  });
};
