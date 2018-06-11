import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import {CURRENT_APP_STATE_KEY, APP_STATES} from "../../constants";

import './navbar.html';

Template.navbar.helpers({
    checkBalanceState() {
        const instance = Template.instance();
        const baseInstance = getBaseInstance(instance);
        return baseInstance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.CHECK_BALANCE;
    },
    requestTokensState() {
        const instance = Template.instance();
        const baseInstance = getBaseInstance(instance);
        return baseInstance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.REQUEST_TOKENS;
    },
    approveTokensState() {
        const instance = Template.instance();
        const baseInstance = getBaseInstance(instance);
        return baseInstance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.APPROVE_TOKENS;
    },
    startSessionState() {
        const instance = Template.instance();
        const baseInstance = getBaseInstance(instance);
        return baseInstance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.START_SESSION;
    },
    watchContentState() {
        const instance = Template.instance();
        const baseInstance = getBaseInstance(instance);
        return baseInstance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.WATCH_CONTENT;
    },
    finishSessionState() {
        const instance = Template.instance();
        const baseInstance = getBaseInstance(instance);
        return baseInstance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.FINISH_SESSION;
    },
    claimTokensState() {
        const instance = Template.instance();
        const baseInstance = getBaseInstance(instance);
        return baseInstance.state.get(CURRENT_APP_STATE_KEY) === APP_STATES.CLAIM_TOKENS;
    },
});

function getBaseInstance(currentInstance) {
    return currentInstance.view.parentView.templateInstance();
}