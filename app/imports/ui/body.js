import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { CURRENT_APP_STATE_KEY, APP_STATES } from "../../constants";

import './body.html';
import './navbar.html';
import './welcome.html';
import './checkBalance.html';
import './requestTokens.html';
import './approveTokens.html';
import './startSession.html';
import './watchContent.html';
import './finishSession.html';
import './claimTokens.html';

Template.body.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    this.state.set(CURRENT_APP_STATE_KEY, APP_STATES.START);
    Meteor.subscribe('tasks');
});

Template.body.helpers({
    startState() {
        const instance = Template.instance();
        return instance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.START;
    },
    checkBalanceState() {
        const instance = Template.instance();
        return instance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.CHECK_BALANCE;
    },
    requestTokensState() {
        const instance = Template.instance();
        return instance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.REQUEST_TOKENS;
    },
    approveTokensState() {
        const instance = Template.instance();
        return instance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.APPROVE_TOKENS;
    },
    startSessionState() {
        const instance = Template.instance();
        return instance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.START_SESSION;
    },
    watchContentState() {
        const instance = Template.instance();
        return instance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.WATCH_CONTENT;
    },
    finishSessionState() {
        const instance = Template.instance();
        return instance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.FINISH_SESSION;
    },
    claimTokensState() {
        const instance = Template.instance();
        return instance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.CLAIM_TOKENS;
    },
    // tasks() {
    //     const instance = Template.instance();
    //     if (instance.state.get('hideCompleted')) {
    //         return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
    //     }
    //     return Tasks.find({}, { sort: { createdAt: -1 } });
    // },
});

Template.body.events({
    'click .check-balance'(event, instance) {
        instance.state.set(CURRENT_APP_STATE_KEY, APP_STATES.CHECK_BALANCE);
    },
    'click .request-tokens'(event, instance) {
        instance.state.set(CURRENT_APP_STATE_KEY, APP_STATES.REQUEST_TOKENS);
    },
    'click .approve-tokens'(event, instance) {
        instance.state.set(CURRENT_APP_STATE_KEY, APP_STATES.APPROVE_TOKENS);
    },
    'click .start-session'(event, instance) {
        instance.state.set(CURRENT_APP_STATE_KEY, APP_STATES.START_SESSION);
    },
    'click .watch-content'(event, instance) {
        instance.state.set(CURRENT_APP_STATE_KEY, APP_STATES.WATCH_CONTENT);
    },
    'click .finish-session'(event, instance) {
        instance.state.set(CURRENT_APP_STATE_KEY, APP_STATES.FINISH_SESSION);
    },
    'click .claim-tokens'(event, instance) {
        instance.state.set(CURRENT_APP_STATE_KEY, APP_STATES.CLAIM_TOKENS);
    },
});
