"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverAvailablity = exports.geENVName = exports.getPartrunnerBaseURL = exports.responseHeader = exports.getYardStikKey = exports.sendSms = exports.sendSlackNotification = exports.getVehicleType = exports.getDriverType = void 0;
const axios = require('axios');
const admin = require("firebase-admin");
const constants_1 = require("./constants");
const enums_1 = require("./enums");
exports.getDriverType = ((type, countryCode) => {
    return countryCode === 'mx'
        ? type === enums_1.Driver_Type_Code.cliente_independiente
            ? enums_1.MX_Driver_Types.cliente_independiente
            : (type === enums_1.Driver_Type_Code.flotilleros ? enums_1.MX_Driver_Types.flotilleros : enums_1.MX_Driver_Types.persona_moral)
        : type === enums_1.Driver_Type_Code.independent_driver
            ? enums_1.US_Driver_Types.independent_driver
            : (type === enums_1.Driver_Type_Code.owner_operator ? enums_1.US_Driver_Types.owner_operator : enums_1.US_Driver_Types.fleet_operator);
});
exports.getVehicleType = ((type, country) => {
    const vehicles = country === 'mx' ? enums_1.MX_Vehicle_Types : enums_1.US_Vehicle_Types;
    return type.map(vehicle => vehicles[vehicle]).join(', ');
});
exports.sendSlackNotification = ((text, countryCode) => {
    const env = exports.geENVName();
    const slackHookUrl = constants_1.Slack_URL[env][countryCode];
    const options = {
        headers: {
            "Content-Type": "application/json"
        },
    };
    return axios.post(slackHookUrl, JSON.stringify({ text: text }), options).then(response => {
        console.log("Successful");
    })
        .catch(error => {
        console.log("Error", error);
    });
});
exports.sendSms = ((to, text, from, cb) => {
    admin.firestore().collection("messages").add({
        to: to,
        body: text,
        from: from,
    }).then(() => {
        console.log("Queued message for delivery!");
        cb({msg: "Queued message for delivery!", status: "success"});
    }).catch(err => cb(err));
});
// exports.sendScheduledWhatsapp = (to, text, from, secheduledTime) => {
//   admin.firestore().collection("messages").add({
//     to: to,
//     body: text,
//     from: from,
//     messagingServiceSid: 'MGa8410549085891e789a1f9f38326344b',
//     sendAt: secheduledTime,
//     scheduleType: 'fixed',
//   }).then(() => console.log("Queued message for delivery!"));
// }
const getYardStikKey = (source) => source === 'staging' ? 'STAGING' : 'PRODUCTION';
exports.getYardStikKey = getYardStikKey;
const responseHeader = (res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Headers', 'content-type');
    res.header('Access-Control-Allow-Headers', 'Accept');
    return res;
};
exports.responseHeader = responseHeader;
const getPartrunnerBaseURL = (panelName) => {
    const envName = exports.geENVName();
    return constants_1.partunnerBaseUrl[panelName][envName];
};
exports.getPartrunnerBaseURL = getPartrunnerBaseURL;
const geENVName = () => {
    const projectId = admin.instanceId().app.options.projectId;
    return constants_1.firebaseProjectID[projectId];
};
exports.geENVName = geENVName;
const getDriverAvailablity = (availablity, countryCode) => {
    const label = countryCode === 'mx' ? 'label_es' : 'label_en';
    return availablity && availablity.length ? availablity.map((day, idx) => day ? constants_1.driverAvailabiltyData[idx][label] : day).filter(v => v).join('; ') : '';
};
exports.getDriverAvailablity = getDriverAvailablity;
const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
const uuidString = () => {
    return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
}
exports.generateUUID = uuidString;
//# sourceMappingURL=helper.functions.js.map