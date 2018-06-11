import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Receipts = new Mongo.Collection('receipts');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('receipts', function receiptsPublication() {
        return Receipts.find();
    });
}

Meteor.methods({
    'receipts.add'(sessionId, value, h, v, r, s) {
        check(sessionId, String);
        check(h, String);
        check(r, String);
        check(s, String);

        Receipts.insert({
            sessionId: sessionId,
            value: value,
            h: h,
            v: v,
            r: r,
            s: s,
            createdAt: new Date(),
        });
    },
    'receipts.clearSession'(sessionId) {
        check(sessionId, String);

        Receipts.remove({ sessionId: sessionId });
    },
});