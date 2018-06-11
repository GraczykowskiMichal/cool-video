import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Sessions } from '../api/sessions';
import { SESSION_STATES, WEB3_CONFIG } from "../../constants";

import './claimTokens.html';

Template.body.onCreated(function bodyOnCreated() {
    Meteor.subscribe('sessions');
});

Template.body.events({
    'click .do-claim-tokens'(event, instance) {
        const address = document.getElementById('address').value;
        if (web3.isAddress(address)) {
            requestClaimingTokens(address);
        } else {
            alert("ERROR: Provided address is incorrect.");
        }
    },
});

function requestClaimingTokens(address) {
    if (!doesSessionExist(address)) {
        alert('ERROR: Session for provided address does not exist.');
        return;
    }
    if (!isSessionFinished(address)) {
        alert("ERROR: Session for the address must be finished before claiming the tokens.");
        return;
    }
    claimTokens(address);
}

function claimTokens(address) {
    const stateChannel = getStateChannelInstance();
    stateChannel.claimTokens.sendTransaction(address, function(error, result) {
        if (error) {
            alert("ERROR: Something went wrong. Try again later.");
        } else {
            Meteor.call('sessions.remove', address);
            alert("Transaction submitted.");
            document.getElementById('address').value = "";
        }
    });
}

function getStateChannelInstance() {
    const stateChannelContract = web3.eth.contract(WEB3_CONFIG.STATE_CHANNEL_ABI);
    return stateChannelContract.at(WEB3_CONFIG.STATE_CHANNEL_ADDRESS);
}

function doesSessionExist(address) {
    return Sessions.find({ address: address }).count() > 0;
}

function isSessionFinished(address) {
    const sessionDetails = Sessions.find({ address: address }).fetch()[0];
    return sessionDetails.state === SESSION_STATES.FINISHED;
}
