import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Sessions } from '../api/sessions';
import { WEB3_CONFIG } from "../../constants";

import './startSession.html';

Template.body.onCreated(function bodyOnCreated() {
    Meteor.subscribe('sessions');
});

Template.body.events({
    'click .do-start-session'(event, instance) {
        const address = document.getElementById('address').value;
        const tokensToLockAmount = document.getElementById('lock-tokens-amount').value;
        if (!validateTokensAmount(tokensToLockAmount)) {
            alert('ERROR: Incorrect amount of CVC tokens to lock declared.');
            return;
        }
        if (web3.isAddress(address)) {
            startSession(address, tokensToLockAmount);
        } else {
            alert("ERROR: Provided address is incorrect.");
        }
    },
});

function startSession(address, amount) {
    if (sessionExists(address)) {
        alert('ERROR: Session for provided address already exists.');
        return;
    }
    const stateChannel = getStateChannelInstance();
    stateChannel.openChannel.sendTransaction(address, parseInt(amount), function(error, result) {
        if (error) {
            alert("ERROR: Something went wrong. Try again later.");
        } else {
            Meteor.call('sessions.start', address, parseInt(amount));
            alert("Transaction submitted.");
            document.getElementById('address').value = '';
            document.getElementById('lock-tokens-amount').value = '';
        }
    });
}

function validateTokensAmount(tokensAmount) {
    const tokensAmountInt = parseInt(tokensAmount);
    return tokensAmountInt > 0 && tokensAmountInt <= WEB3_CONFIG.TOKEN_TOTAL_SUPPLY;
}

function sessionExists(address) {
    return Sessions.find({ address: address }).count() > 0;
}

function getStateChannelInstance() {
    const stateChannelContract = web3.eth.contract(WEB3_CONFIG.STATE_CHANNEL_ABI);
    return stateChannelContract.at(WEB3_CONFIG.STATE_CHANNEL_ADDRESS);
}
