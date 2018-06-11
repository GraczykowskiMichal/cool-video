import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { SESSION_STATES } from "../../constants";

export const Sessions = new Mongo.Collection('sessions');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('sessions', function sessionsPublication() {
        return Sessions.find();
    });
}

Meteor.methods({
    'sessions.start'(address, amount) {
        check(address, String);

        Sessions.insert({
            address: address,
            tokensAvailable: amount,
            state: SESSION_STATES.STARTED,
            createdAt: new Date(),
        });
    },
    'sessions.finish'(address) {
        check(address, String);

        Sessions.update({ address: address}, { $set: { state: SESSION_STATES.FINISHED } });
    },
    'sessions.remove'(address) {
        check(address, String);

        Sessions.remove({ address: address });
    },
});