const axios = require('axios');
const admin = require("firebase-admin");

import { driverAvailabiltyData, firebaseProjectID, partunnerBaseUrl, Slack_URL } from "./constants";
import { Driver_Type_Code, MX_Driver_Types, MX_Vehicle_Types, US_Driver_Types, US_Vehicle_Types, VehicleTypes } from "./enums";

export const getDriverType = ((type: string, countryCode: string) => {
  return countryCode === 'mx'
    ? type === Driver_Type_Code.cliente_independiente
      ? MX_Driver_Types.cliente_independiente
      : (type === Driver_Type_Code.flotilleros ? MX_Driver_Types.flotilleros : MX_Driver_Types.persona_moral)
    : type === Driver_Type_Code.independent_driver
      ? US_Driver_Types.independent_driver
      : (type === Driver_Type_Code.owner_operator ? US_Driver_Types.owner_operator : US_Driver_Types.fleet_operator)
});

export const getVehicleType = ((type: string[], country: string) => {
  const vehicles = country === 'mx' ? MX_Vehicle_Types : US_Vehicle_Types;
  return type.map(vehicle => vehicles[vehicle]).join(', ')
});

export const sendSlackNotification = ((text: string, countryCode: string) => {
  const env = geENVName();
  const slackHookUrl = Slack_URL[env][countryCode];
  const options = {
    headers: {
      "Content-Type": "application/json"
    },
  }
  return axios.post(slackHookUrl, JSON.stringify({ text: text }), options).then(response => {
    console.log("Successful");
  })
  .catch(error => {
    console.log("Error", error);
  });
});

export const sendSms = ((to, text, from) => {
  admin.firestore().collection("messages").add({
    to: to,
    body: text,
    from: from,
  }).then(() => console.log("Queued message for delivery!"));
});

export const getYardStikKey = (source: string) => source === 'staging' ? 'STAGING' : 'PRODUCTION';

export const responseHeader = (res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Headers', 'Accept');
  return res;
}

export const getPartrunnerBaseURL = (panelName: string) => {
  const envName = geENVName();
  return partunnerBaseUrl[panelName][envName];
}

export const geENVName = () => {
  const projectId = admin.instanceId().app.options.projectId;
  return firebaseProjectID[projectId];
};

export const getDriverAvailablity = (availablity: Boolean[], countryCode: string) => {
  const label = countryCode === 'mx'? 'label_es': 'label_en';
  return availablity && availablity.length ? availablity.map((day, idx) => day? driverAvailabiltyData[idx][label]: day).filter(v => v).join('; '): '';
};
