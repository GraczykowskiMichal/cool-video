import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import {WEB3_CONFIG} from "../../constants";
import './requestTokens.html';

Template.body.events({
    'click .do-request-tokens'(event, instance) {
        const address = document.getElementById('address').value;
        if (web3.isAddress(address)) {
            requestTokens(address);
        } else {
            alert("ERROR: Provided address is incorrect.");
        }
    },
});

function requestTokens(address) {
    const token = getTokenInstance();
    const currentAccount = web3.eth.accounts[0];
    const previousButtonContent = lockButton();
    token.balanceOf.call(currentAccount, function(error, result) {
        if (error) {
            alert("ERROR: Something went wrong. Try again later.");
        } else {
            if (parseInt(result) >= 10) {
                transferTokens(address);
            } else {
                alert("ERROR: You don't have enough CVC tokens to transfer.");
            }
        }
        unlockButton(previousButtonContent);
    });
}

function transferTokens(address) {
    const token = getTokenInstance();
    token.transfer.sendTransaction(address, 10, function(error, result) {
        if (error) {
            alert("ERROR: Something went wrong. Try again later.");
        } else {
            alert("Transaction submitted.");
            document.getElementById('address').value = "";
        }
    });
}

function getTokenInstance() {
    const tokenContract = web3.eth.contract(WEB3_CONFIG.TOKEN_ABI);
    return tokenContract.at(WEB3_CONFIG.TOKEN_ADDRESS);
}

function lockButton() {
    const requestButton = document.getElementById('request-tokens-button');
    const previousButtonContent = requestButton.innerHTML;
    requestButton.innerText = "Wait for submitting transaction...";
    requestButton.disabled = true;
    return previousButtonContent;
}

function unlockButton(previousButtonContent) {
    const requestButton = document.getElementById('request-tokens-button');
    requestButton.innerHTML = previousButtonContent;
    requestButton.disabled = false;
}
