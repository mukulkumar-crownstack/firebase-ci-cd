import { en, es } from "../utils/constants";
import { getDriverType, sendSlackNotification } from "../utils/helper.functions";

export const notifyNewSignup = ((snap) => {
  // Get an object representing the document
  const newValue = snap.data();

  // access a particular field as you would any JS property
  const phone = newValue.phone;
  const name = newValue.full_name;
  const countryCode = newValue.phone_country_code === "us" ?
    '+1' : (newValue.phone_country_code === "mx" ?
      '+52' : '+91');
  const formattedPhone = `${countryCode}${phone}`;
  const translation = newValue.phone_country_code === "us" ? en : es;
  const driverType = translation[getDriverType(newValue.driver_type_code, newValue.phone_country_code)];
  const slackText = `
    ${translation["A new driver has shown interest applying with Partrunner."]}

    ${translation.Name} : ${name}

    ${translation["Phone Number"]}: ${formattedPhone}

    ${translation["Driver Type"]}: ${driverType}
  `;
  sendSlackNotification(slackText, newValue.phone_country_code);
});

