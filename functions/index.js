// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firebase Features from within Cloud Functions.
const { initializeApp } = require("firebase-admin/app");

const { addLead_f } = require('./cloud-functions/addLead.f');
const { notifyLeadStatusUpdate_f } = require("./cloud-functions/notifyLeadStatusUpdate.f");
const { cloudAPI_f } = require("./cloud-functions/cloudAPI.f");
const { deleteLead_f } = require("./cloud-functions/deleteLead.f");

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

exports.addLead = functions.firestore.document('driver_lead/{driverCode}').onCreate(addLead_f);
exports.notifyLeadStatusUpdate = functions.firestore.document('driver_lead/{driverCode}').onUpdate(notifyLeadStatusUpdate_f);
exports.deleteLead = functions.firestore.document('driver_lead/{driverCode}').onDelete(deleteLead_f);
exports.cloudAPI = functions.https.onRequest(cloudAPI_f);
