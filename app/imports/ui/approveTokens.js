import { Template } from 'meteor/templating';
import { WEB3_CONFIG } from "../../constants";

import './approveTokens.html';

Template.body.events({
    'click .do-approve-tokens'(event, instance) {
        const tokensToApproveAmount = document.getElementById('approve-tokens-amount').value;
        if (!validateTokensAmount(tokensToApproveAmount)) {
            alert('ERROR: Incorrect amount of CVC tokens to approve declared.');
            return;
        }
        requestTokensApproval(tokensToApproveAmount);
    },
});

function requestTokensApproval(amount) {
    const token = getTokenInstance();
    const caller = web3.eth.accounts[0];
    const previousButtonContent = lockButton();
    token.balanceOf.call(caller, function(error, result) {
        if (error) {
            alert("ERROR: Something went wrong. Try again later.");
        } else {
            if (parseInt(result) >= parseInt(amount)) {
                approveTokens(amount);
            } else {
                alert("ERROR: You don't have enough CVC tokens to approve.");
            }
        }
        unlockButton(previousButtonContent);
    });
}

function approveTokens(amount) {
    const token = getTokenInstance();
    console.log("Spender: " + WEB3_CONFIG.STATE_CHANNEL_ADDRESS);
    console.log("msg.sender: " + web3.eth.accounts[0]);
    console.log("Amount: " + parseInt(amount));
    token.approve.sendTransaction(WEB3_CONFIG.STATE_CHANNEL_ADDRESS, parseInt(amount), function(error, result) {
        if (error) {
            alert("ERROR: Something went wrong. Try again later.");
        } else {
            alert("Transaction submitted.");
            document.getElementById('approve-tokens-amount').value = '';
        }
    });
}

function getTokenInstance() {
    const tokenContract = web3.eth.contract(WEB3_CONFIG.TOKEN_ABI);
    return tokenContract.at(WEB3_CONFIG.TOKEN_ADDRESS);
}

function lockButton() {
    const requestButton = document.getElementById('approve-tokens-button');
    const previousButtonContent = requestButton.innerHTML;
    requestButton.innerText = "Wait for submitting transaction...";
    requestButton.disabled = true;
    return previousButtonContent;
}

function unlockButton(previousButtonContent) {
    const requestButton = document.getElementById('approve-tokens-button');
    requestButton.innerHTML = previousButtonContent;
    requestButton.disabled = false;
}

function validateTokensAmount(tokensAmount) {
    const tokensAmountInt = parseInt(tokensAmount);
    return tokensAmountInt > 0 && tokensAmountInt <= WEB3_CONFIG.TOKEN_TOTAL_SUPPLY;
}
