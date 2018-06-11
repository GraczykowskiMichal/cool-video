import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Sessions } from '../api/sessions';
import { Receipts } from "../api/receipts";
import { SESSION_STATES, WEB3_CONFIG } from "../../constants";

import './finishSession.html';

const BigNumber = require('bignumber.js');

Template.body.onCreated(function bodyOnCreated() {
    Meteor.subscribe('sessions');
    Meteor.subscribe('receipts');
});

Template.body.events({
    'click .do-finish-session'(event, instance) {
        const address = document.getElementById('address').value;
        if (web3.isAddress(address)) {
            requestFinishingSession(address);
        } else {
            alert("ERROR: Provided address is incorrect.");
        }
    },
});

function requestFinishingSession(address) {
    if (!doesSessionExist(address)) {
        alert('ERROR: Session for provided address does not exist.');
        return;
    }
    if (!isSessionStarted(address)) {
        alert('ERROR: Session for provided address is already finished. Claim the tokens to before starting a new one.');
        return;
    }
    if (!doesReceiptExist(address)) {
        alert('ERROR: You must spend at least one CVC token before finishing the session.');
    }
    const lastReceipt = getLastReceipt(address);
    finishSession(address, lastReceipt);
}

function finishSession(address, lastReceipt) {
    const stateChannel = getStateChannelInstance();
    const h = lastReceipt.h;
    const v = parseInt(lastReceipt.v);
    const r = lastReceipt.r;
    const s = lastReceipt.s;
    const value = parseInt(lastReceipt.value);
    stateChannel.closeChannel.sendTransaction(h, v, r, s, value, address, function(error, result) {
        if (error) {
            alert("ERROR: Something went wrong. Try again later.");
        } else {
            Meteor.call('sessions.finish', address);
            alert("Transaction submitted.");
            document.getElementById('address').value = "";
        }
    });
}

function getLastReceipt(address) {
    const session = Sessions.find({ address: address}).fetch()[0];
    return Receipts.find({ sessionId: session._id }, { sort: { value: -1 } }).fetch()[0];
}

function doesReceiptExist(address) {
    const session = Sessions.find({ address: address}).fetch()[0];
    return Receipts.find({ sessionId: session._id }).count() > 0;
}

function doesSessionExist(address) {
    return Sessions.find({ address: address }).count() > 0;
}

function isSessionStarted(address) {
    const sessionDetails = Sessions.find({ address: address }).fetch()[0];
    return sessionDetails.state === SESSION_STATES.STARTED;
}

function getStateChannelInstance() {
    const stateChannelContract = web3.eth.contract(WEB3_CONFIG.STATE_CHANNEL_ABI);
    return stateChannelContract.at(WEB3_CONFIG.STATE_CHANNEL_ADDRESS);
}
