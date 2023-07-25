// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firebase Features from within Cloud Functions.
const { initializeApp } = require("firebase-admin/app");

// import { notifyNewSignup } from './functions/notifyNewSignup.f';
const notifyLeadStatusUpdate_f_1 = require("./notifyLeadStatusUpdate.f");
const cloudAPI_f_1 = require("./cloudAPI.f");

initializeApp();

// Set up extra settings. Since May 29, 2020, Firebase Firebase Added support for
// calling FirebaseFiresore.settings with { ignoreUndefinedProperties: true }.
// When this parameter is set, Cloud Firestore ignores undefined properties
// inside objects rather than rejecting the API call.
// admin.firestore().settings({
//   ignoreUndefinedProperties: true,
// });

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// exports.notifyNewSignup = functions.firestore.document('driver_lead/{driverCode}').onCreate(notifyNewSignup);
exports.notifyLeadStatusUpdate = functions.firestore.document('driver_lead/{driverCode}').onUpdate(notifyLeadStatusUpdate_f_1.notifyLeadStatusUpdate);
exports.cloudAPI = functions.https.onRequest(cloudAPI_f_1.cloudAPI);

// exports.cloudAPI = functions.https.onRequest(cloudAPI);
