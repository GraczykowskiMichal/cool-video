import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Sessions } from '../api/sessions';
import { Receipts } from "../api/receipts";
import { SESSION_STATES } from "../../constants";

import './watchContent.html';

var isReceiptShown = false;

Template.body.onCreated(function bodyOnCreated() {
    Meteor.subscribe('sessions');
    Meteor.subscribe('receipts');
});

Template.body.events({
    'click .do-watch-content'(event, instance) {
        const address = web3.eth.accounts[0];
        requestWatchingContent(address);
    },
});

function requestWatchingContent(address) {
    if (!doesSessionExist(address)) {
        alert('ERROR: Session for your address does not exist.');
        return;
    }
    if (!isSessionStarted(address)) {
        alert('ERROR: Session for your address is not started. Finish current session to start a new one.');
        return;
    }
    const session = getSessionDetails(address);
    const lastReceiptValue = getLastReceiptValue(session._id);
    const tokensLeft = session.tokensAvailable - lastReceiptValue;
    if (tokensLeft === 0) {
        alert('ERROR: You have no more CVC tokens left. Finish current session and start a new one to watch content.');
        return;
    }

    const newReceiptValue = lastReceiptValue + 1;

    if (!isReceiptShown) {
        document.getElementById('signed-receipt').placeholder = "Please paste signed receipt for value: " + newReceiptValue;
        isReceiptShown = true;
        return;
    }

    const h = getHashedUint256Value(newReceiptValue);
    const signed = document.getElementById('signed-receipt').value;

    if (signed.length !== 132) {
        alert("ERROR: Signed receipt is incorrect");
        return;
    }

    const sig = signed.slice(2);
    const r = `0x${sig.slice(0, 64)}`;
    const s = `0x${sig.slice(64, 128)}`;
    const v = hexToNumber(sig);

    watchContent(h, v, r, s, address, session._id, newReceiptValue);
}

function watchContent(h, v, r, s, address, sessionId, newReceiptValue) {
    Meteor.call('receipts.add', sessionId, newReceiptValue, h, v, r, s);
    alert("YOU ARE NOW WATCHING CONTENT! <3");
    document.getElementById('signed-receipt').value = "";
}

function doesSessionExist(address) {
    return Sessions.find({ address: address }).count() > 0;
}

function isSessionStarted(address) {
    const sessionDetails = Sessions.find({ address: address }).fetch()[0];
    return sessionDetails.state === SESSION_STATES.STARTED;
}

function getSessionDetails(address) {
    return Sessions.find({ address: address }).fetch()[0];
}

function getLastReceiptValue(sessionId) {
    const cursor = Receipts.find({ sessionId: sessionId }, { sort: { value: -1 } });
    if (cursor.count() === 0) {
        return 0;
    }
    const lastReceipt = cursor.fetch()[0];
    return parseInt(lastReceipt.value);
}

function getHashedUint256Value(value) {
    const NewWeb3 = require("web3");
    return NewWeb3.utils.soliditySha3({type: "uint256", value: value.toString()});
}

function getSolidityHash(v1, v2) {
    const NewWeb3 = require("web3");
    return NewWeb3.utils.soliditySha3(v1, v2);
}

function hexToNumber(sig) {
    const NewWeb3 = require("web3");
    return NewWeb3.utils.hexToNumber(sig.slice(128, 130));
}
