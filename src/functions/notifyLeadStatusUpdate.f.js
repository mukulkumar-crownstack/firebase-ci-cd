import { en, es } from "../utils/constants";
import { ApplicationStatus, InterviewStatus, LeadStatus } from "../utils/enums";
import { getDriverAvailablity, getDriverType, getPartrunnerBaseURL, getVehicleType, sendSlackNotification, sendSms } from "../utils/helper.functions";

export const notifyLeadStatusUpdate = ((change, context) => {
  // Get an object representing the document
  const newValue = change.after.data();
  const previousValue = change.before.data();
  const translation = newValue.phone_country_code === "us" ? en : es;
  const driverType = translation[getDriverType(newValue.driver_type_code, newValue.phone_country_code)];
  const vehicleType = getVehicleType(newValue.vehicle_type_codes, newValue.phone_country_code);
  const {
    full_name: name, phone, operating_city: city, application_id: applicationID, lead_status: leadStatus, application_status: applicationStatus
  } = newValue;
  const countryCode = newValue.phone_country_code === "us" ?
    '+1' : (newValue.phone_country_code === "mx" ?
      '+52' : '+91');
  const sendSmsTo = `${countryCode}${phone}`;
  const smsFrom = newValue.phone_country_code === "us" ? '+19895753391' : '+528153512795';

  let slackText;
  let smsText;

  if (
    newValue.lead_status !== previousValue.lead_status
    || newValue.application_status !== previousValue.application_status) {
    if (leadStatus === LeadStatus.APPLIED) {
      // if (newValue.phone_country_code === 'mx') {
      //   slackText = `
      //     ${translation["A new driver has applied to drive with Partrunner"]}

      //     ${translation.Name}: ${name}

      //     ${translation["Phone Number"]}: ${sendSmsTo}

      //     ${translation["Driver Type"]}: ${driverType}
      //   `;
      // }
      smsText = `${translation['Thank you for applying with Partrunner. Your application ID is :applicationID .\n\nIf you want to continue or make changes, click here'].replace(':applicationID', applicationID)} ${getPartrunnerBaseURL('driver')}/${translation.language}/login`;
    }

    // if (leadStatus === LeadStatus.INTERVIEW_SCHEDULED) {
    //   // const oldInterviewStatus = previousValue.interview_status_code;
    //   const newInterviewStatus = newValue.interview_status_code;
    //   if (newInterviewStatus === InterviewStatus.SCHEDULED) {
    //     const interviewDataTime = new Date(newValue.interview_date_time);
    //     const tzString = newValue.phone_country_code === "us" ? 'America/New_York' : (newValue.phone_country_code === "mx" ? 'America/Mexico_City': 'Asia/Kolkata');
    //     if (newValue.phone_country_code === 'mx') {
    //       slackText = `
    //       ${translation["A new driver has scheduled interview"]}

    //       ${translation["Interview date & time"]}: ${interviewDataTime.toLocaleString('en-US', {timeZone: tzString})}

    //       ${translation.Name}: ${name}

    //       ${translation["Phone Number"]}: ${sendSmsTo}

    //       ${translation["Driver Type"]}: ${driverType}

    //       ${translation["Vehicle Types"]}: ${vehicleType}

    //       ${translation.Link}: ${getPartrunnerBaseURL('admin')}/${translation.language}/driver-leads/detail/${newValue.driver_type_code}_${newValue.phone_country_code}_${phone}
    //     `;
    //     } else {
    //       slackText = `
    //       ${translation["A new driver has scheduled interview"]}

    //       ${translation["Interview date & time"]}: ${interviewDataTime.toLocaleString('en-US', {timeZone: tzString})}

    //       ${translation.Name}: ${name}

    //       ${translation["Phone Number"]}: ${sendSmsTo}

    //       ${translation["Driver Type"]}: ${driverType}

    //       ${translation["Vehicle Types"]}: ${vehicleType}

    //       ${translation.City}: ${city}

    //       ${translation.Link}: ${getPartrunnerBaseURL('admin')}/${translation.language}/driver-leads/detail/${newValue.driver_type_code}_${newValue.phone_country_code}_${phone}
    //     `;
    //     }
    //     smsText = `${translation["You successfully scheduled a call interview with PartRunner on :interviewDateTime An email will be sent to you with the link and details on how to join."].replace(':interviewDateTime', interviewDataTime.toLocaleString('en-US', {timeZone: tzString}))}`;
    //   }

    // }

    // if (
    //   (leadStatus === LeadStatus.BACKGROUND_CHECK || leadStatus === LeadStatus.COMPANY_BACKGROUND_CHECK)
    //   && applicationStatus !== ApplicationStatus.IN_PROGRESS
    // ) {
    //   smsText = `${translation['Congratulations. We are moving forward with your application to drive with Partrunner. Log into your account and upload documents needed for background verification.']} ${getPartrunnerBaseURL('driver')}/${translation.language}/login .`;
    // }

    // if (leadStatus === LeadStatus.COMPANY_BACKGROUND_CHECKED && applicationStatus === ApplicationStatus.IN_PROGRESS) {
    //   smsText = `${translation["Congratulations. We are moving forward with your application to drive with Partrunner. Log into your account and upload documents needed for driver's background verification."]} ${getPartrunnerBaseURL('driver')}/${translation.language}/login .`;
    // }

    // if ((leadStatus === LeadStatus.DRIVER_BACKGROUND_CHECKED || leadStatus === LeadStatus.BACKGROUND_CHECKED) && applicationStatus === ApplicationStatus.IN_PROGRESS) {
    //   smsText = `${translation['Congratulations. We are moving forward with your application to drive with Partrunner. Log into your account and upload your onboarding documents']} ${getPartrunnerBaseURL('driver')}/${translation.language}/login .`;
    // }

    // if ((leadStatus === LeadStatus.DRIVER_BACKGROUND_CHECKED || leadStatus === LeadStatus.BACKGROUND_CHECKED) && applicationStatus === ApplicationStatus.UNDER_REVIEW) {
    //   if (newValue.phone_country_code === 'mx') {
    //     slackText = `
    //       ${translation["A new driver has uploaded the onboarding documents"]}

    //       ${translation.Name}: ${name}

    //       ${translation["Phone Number"]}: ${sendSmsTo}

    //       ${translation["Driver Type"]}: ${driverType}

    //       ${translation["Vehicle Types"]}: ${vehicleType}
    //     `;
    //   } else {
    //     slackText = `
    //       ${translation["A new driver has uploaded the onboarding documents"]}

    //       ${translation.Name}: ${name}

    //       ${translation["Phone Number"]}: ${sendSmsTo}

    //       ${translation["Driver Type"]}: ${driverType}

    //       ${translation["Vehicle Types"]}: ${vehicleType}

    //       ${translation.City}: ${city}
    //     `;
    //   }
    // }

    if (applicationStatus === ApplicationStatus.UNDER_REVIEW) {
      // if (newValue.phone_country_code === 'mx') {
      //   slackText = `
      //     ${translation["A new driver has completed the PR account"]}

      //     ${translation.Name}: ${name}

      //     ${translation["Phone Number"]}: ${sendSmsTo}

      //     ${translation["Driver Type"]}: ${driverType}

      //     ${translation["Vehicle Types"]}: ${vehicleType}
      //   `;
      // } else {
      //   slackText = `
      //     ${translation["A new driver has completed the PR account"]}

      //     ${translation.Name}: ${name}

      //     ${translation["Phone Number"]}: ${sendSmsTo}

      //     ${translation["Driver Type"]}: ${driverType}

      //     ${translation["Vehicle Types"]}: ${vehicleType}

      //     ${translation.City}: ${city}
      //   `;
      // }
      smsText = `${translation["Your application to drive with PartRunner has been confirmed. We will contact you again to train you and answer any questions soon."]}`;
    }

    if (applicationStatus === ApplicationStatus.REJECTED) {
      const email = newValue.phone_country_code === 'mx' ? 'conductores@partrunner.com' : 'drivers@partrunner.com';
      if (newValue.phone_country_code === 'mx') {
        slackText = `
          ${translation["A new driver has been rejected in the process"]}

          ${translation.Name}: ${name}

          ${translation["Phone Number"]}: ${sendSmsTo}

          ${translation["Driver Type"]}: ${driverType}

          ${translation["Vehicle Types"]}: ${vehicleType}
        `;
      }
      smsText = `${translation["Sorry, after verifying your information we are not able to move forward with your application to work as a driver with PartRunner. You can contact us on :driverEmail for more information."].replace(':driverEmail', email)}`;
    }

    if (applicationStatus === ApplicationStatus.STAND_BY) {
      if (newValue.phone_country_code === 'mx') {
        slackText = `
          ${translation["A new driver has been put on hold in the process"]}

          ${translation.Name}: ${name}

          ${translation["Phone Number"]}: ${sendSmsTo}

          ${translation["Driver Type"]}: ${driverType}

          ${translation["Vehicle Types"]}: ${vehicleType}
        `;
      }
    }

    if (applicationStatus === ApplicationStatus.APPROVED) {
      if (newValue.phone_country_code === 'mx') {
        slackText = `
          ${translation["A new driver has been approved"]}

          ${translation.Name}: ${name}

          ${translation["Phone Number"]}: ${sendSmsTo}

          ${translation["Driver Type"]}: ${driverType}

          ${translation["Vehicle Types"]}: ${vehicleType}
        `;
      } else {
        const available = getDriverAvailablity(newValue.availability_of_driver, newValue.phone_country_code);
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
      sendSms(sendSmsTo, smsText, smsFrom);
    }
    if (slackText) {
      sendSlackNotification(slackText, newValue.phone_country_code);
    }
  }
});
