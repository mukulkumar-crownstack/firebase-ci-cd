"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyLeadStatusUpdate = void 0;
const constants_1 = require("./utils/constants");
const enums_1 = require("./utils/enums");
const helper_functions_1 = require("./utils/helper.functions");
exports.notifyLeadStatusUpdate = (change, context) => {
  // Get an object representing the document
  const newValue = change.after.data();
  const previousValue = change.before.data();
  const translation =
    newValue.phone_country_code === "us" ? constants_1.en : constants_1.es;
  const driverType =
    translation[
      helper_functions_1.getDriverType(
        newValue.driver_type_code,
        newValue.phone_country_code
      )
    ];
  const vehicleType = helper_functions_1.getVehicleType(
    newValue.vehicle_type_codes,
    newValue.phone_country_code
  );
  const {
    full_name: name,
    phone,
    operating_city: { city } = "",
    application_id: applicationID,
    lead_status: leadStatus,
    application_status: applicationStatus,
  } = newValue;
  const countryCode =
    newValue.phone_country_code === "us"
      ? "+1"
      : newValue.phone_country_code === "mx"
      ? "+52"
      : "+91";
  const sendSmsTo = `${countryCode}${phone}`;
  const smsFrom =
    newValue.phone_country_code === "us" ? "+19895753391" : "+528153512795";
  let slackText;
  let smsText;
  if (
    newValue.lead_status !== previousValue.lead_status ||
    newValue.application_status !== previousValue.application_status
  ) {
    if (leadStatus === enums_1.LeadStatus.APPLIED) {
      smsText = `${translation[
        "Thank you for applying with Partrunner. Your application ID is :applicationID .\n\nIf you want to continue or make changes, click here"
      ].replace(
        ":applicationID",
        applicationID
      )} ${helper_functions_1.getPartrunnerBaseURL("driver")}/${
        translation.language
      }/login`;
    }
    if (applicationStatus === enums_1.ApplicationStatus.UNDER_REVIEW) {
      // smsText = `${translation["Your application to drive with PartRunner is under review. We will contact you again to train you and answer any questions soon."]}`;
      slackText = `
          ${translation["A new driver has been put under review"]}

          ${translation.Name}: ${name}

          ${translation["Phone Number"]}: ${sendSmsTo}

          ${translation["Driver Type"]}: ${driverType}

          ${translation["Link"]}: ${helper_functions_1.getPartrunnerBaseURL('admin')}/${translation.language}/driver-leads/detail/${newValue.driver_type_code}_${newValue.phone_country_code}_${newValue.phone}
      `;
    }
    if (applicationStatus === enums_1.ApplicationStatus.REJECTED) {
      const email =
        newValue.phone_country_code === "mx"
          ? "conductores@partrunner.com"
          : "drivers@partrunner.com";
      if (newValue.phone_country_code === "mx") {
        slackText = `
          ${translation["A new driver has been rejected in the process"]}

          ${translation.Name}: ${name}

          ${translation["Phone Number"]}: ${sendSmsTo}

          ${translation["Driver Type"]}: ${driverType}

          ${translation["Vehicle Types"]}: ${vehicleType}
        `;
      }
      smsText = `${translation[
        "Sorry, after verifying your information we are not able to move forward with your application to work as a driver with PartRunner. You can contact us on :driverEmail for more information."
      ].replace(":driverEmail", email)}`;
    }
    if (applicationStatus === enums_1.ApplicationStatus.STAND_BY) {
      if (newValue.phone_country_code === "mx") {
        slackText = `
          ${translation["A new driver has been put on hold in the process"]}

          ${translation.Name}: ${name}

          ${translation["Phone Number"]}: ${sendSmsTo}

          ${translation["Driver Type"]}: ${driverType}

          ${translation["Vehicle Types"]}: ${vehicleType}
        `;
      }
    }
    if (applicationStatus === enums_1.ApplicationStatus.APPROVED) {
      if (newValue.phone_country_code === "mx") {
        slackText = `
          ${translation["A new driver has been approved"]}

          ${translation.Name}: ${name}

          ${translation["Phone Number"]}: ${sendSmsTo}

          ${translation["Driver Type"]}: ${driverType}

          ${translation["Vehicle Types"]}: ${vehicleType}
        `;
      } else {
        const available = helper_functions_1.getDriverAvailablity(
          newValue.availability_of_driver,
          newValue.phone_country_code
        );
        slackText = `
          ${translation["A new driver has been approved"]}

          ${translation.Name}: ${name}

          ${translation["Phone Number"]}: ${sendSmsTo}

          ${translation["Driver Type"]}: ${driverType}

          ${translation["Vehicle Types"]}: ${vehicleType}

          ${translation.City}: ${city}

          ${translation.Availability}: ${available}
        `;
      }
      smsText = `${translation["Welcome to the PartRunner Team! You have been approved to drive with us. An email will be sent shortly with instructions on how to start using the Driver App and start earning extra money. Stay tuned!"]}`;
    }
    if (smsText) {
      helper_functions_1.sendSms(sendSmsTo, smsText, smsFrom, (twilioRes) => {
        if (twilioRes.status === "success") {
          console.log("success");
          res.status(200).json({ msg: twilioRes });
        } else {
          console.log("error", err);
          res.status(500).json({ err: err });
        }
      });
    }
    if (slackText) {
      helper_functions_1.sendSlackNotification(
        slackText,
        newValue.phone_country_code
      );
    }
  }
};