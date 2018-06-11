Web3 = require('web3');

let web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

const value = process.argv[2];
const signer = process.argv[3];

const msgValueStr = value.toString();
const h = web3.utils.soliditySha3({type: "uint256", value: msgValueStr});
const { BN } = web3.utils;
web3.eth.sign(h, signer, function(error, signed) {
	if (error) {
		console.log(error);
		return;
	}
	console.log(signed);
});
