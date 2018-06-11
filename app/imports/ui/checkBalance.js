import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';

import './checkBalance.html';
import { WEB3_CONFIG } from "../../constants";

Template.body.events({
    'click .do-check-balance'(event, instance) {
        const address = document.getElementById('address').value;
        if (web3.isAddress(address)) {
            checkBalance(address);
        } else {
            alert("ERROR: Provided address is incorrect.");
        }
    },
});

function checkBalance(address) {
    const token = getTokenInstance();
    token.balanceOf.call(address, function(error, result) {
        if (error) {
            alert("ERROR: Something went wrong. Try again later.");
        } else {
            alert("Your balance: " + result + " Cool Video Coins");
            document.getElementById('address').value = "";
        }
    });
}

function getTokenInstance() {
    const tokenContract = web3.eth.contract(WEB3_CONFIG.TOKEN_ABI);
    return tokenContract.at(WEB3_CONFIG.TOKEN_ADDRESS);
}
