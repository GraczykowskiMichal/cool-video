import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { WEB3_CONFIG } from '../../constants';

Web3 = require('web3');
let web3, tokenContract, stateChannelContract;

if (Meteor.isServer) {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        const networkAddress = "http://" + WEB3_CONFIG.NETWORK_HOST + ":" + WEB3_CONFIG.NETWORK_PORT;
        web3 = new Web3(new Web3.providers.HttpProvider(networkAddress));
    }
    tokenContract = new web3.eth.Contract(WEB3_CONFIG.TOKEN_ABI, WEB3_CONFIG.TOKEN_ADDRESS, {
        from: WEB3_CONFIG.MAIN_ACCOUNT_ADDRESS,
        gasPrice: WEB3_CONFIG.DEFAULT_GAS_PRICE
    });
    stateChannelContract = new web3.eth.Contract(WEB3_CONFIG.STATE_CHANNEL_ABI, WEB3_CONFIG.STATE_CHANNEL_ADDRESS, {
        from: WEB3_CONFIG.MAIN_ACCOUNT_ADDRESS,
        gasPrice: WEB3_CONFIG.DEFAULT_GAS_PRICE
    });
}

Meteor.methods({
    'blockchainUtils.isCorrectAddress'(address) {
        check(address, String);

        return web3.utils.isAddress(address);
    },
    'blockchainUtils.checkTokenBalance'(address) {
        check(address, String);

        return tokenContract.methods.balanceOf(address).call().then(function(result) {
            return result;
        });
    },
    'blockchainUtils.requestTokens'(recipientAddress) {
        check(recipientAddress, String);

        const { BN } = web3.utils;
        const mainAddress = WEB3_CONFIG.MAIN_ACCOUNT_ADDRESS;
        const amount = new BN('10');
        return tokenContract.methods.transfer(recipientAddress, amount).send().then(function(result) {
            return result;
        });
    },
});
