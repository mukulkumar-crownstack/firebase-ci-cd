const axios = require('axios');
const admin = require("firebase-admin");
const constants = require("./constants");
const enums = require("./enums");

exports.getDriverType = ((type, countryCode) => {
    return countryCode === 'mx'
        ? type === enums.Driver_Type_Code.cliente_independiente
            ? enums.MX_Driver_Types.cliente_independiente
            : (type === enums.Driver_Type_Code.flotilleros ? enums.MX_Driver_Types.flotilleros : enums.MX_Driver_Types.persona_moral)
        : type === enums.Driver_Type_Code.independent_driver
            ? enums.US_Driver_Types.independent_driver
            : (type === enums.Driver_Type_Code.owner_operator ? enums.US_Driver_Types.owner_operator : enums.US_Driver_Types.fleet_operator);
});

exports.getVehicleType = ((type, country) => {
    const vehicles = country === 'mx' ? enums.MX_Vehicle_Types : enums.US_Vehicle_Types;
    return type.map(vehicle => vehicles[vehicle]).join(', ');
});

exports.sendSlackNotification = ((text, countryCode) => {
    const env = exports.geENVName();
    const slackHookUrl = constants.Slack_URL[env][countryCode];
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
    return constants.partunnerBaseUrl[panelName][envName];
};
exports.getPartrunnerBaseURL = getPartrunnerBaseURL;

exports.geENVName = (() => {
    const projectId = admin.instanceId().app.options.projectId;
    return constants.firebaseProjectID[projectId];
});

const getDriverAvailablity = (availablity, countryCode) => {
    const label = countryCode === 'mx' ? 'label_es' : 'label_en';
    return availablity && availablity.length ? availablity.map((day, idx) => day ? constants.driverAvailabiltyData[idx][label] : day).filter(v => v).join('; ') : '';
};
exports.getDriverAvailablity = getDriverAvailablity;
const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
const uuidString = () => {
    return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
}
exports.generateUUID = uuidString;

exports.getPhoneFromPhoneNumber = ((phoneNumber) => {
    const idx = phoneNumber.indexOf('+1') === 0 ? 2 : 3;
    const phone = phoneNumber.substring(idx);
    if(phone.length === 11) {
       return phoneNumber.substring(idx+1);
    }
    return phone;
});

exports.getZoneDetailsFromLocationName = ((locationName) => {
    const zoneDetails = constants.zoneData[locationName];
    return zoneDetails ? zoneDetails: {
        operating_city: {
            "Country": "MX",
            "State": "CMX",
            "City": "CDMX",
            "Municipality": "",
            "Neighborhood": "",
            "Street Name": "",
            "Landmark": "",
            "Zipcode": 1000,
            "PR Zone Code": "mx-cmx-zone-0"
        },
        pr_country: "mx",
        pr_market: "cmx",
        pr_zone: "zone-0",
        pr_zone_code: "mx-cmx-zone-0",
        zipcode: 1000,
        location: locationName
    };
})
//# sourceMappingURL=helper.functions.js.map