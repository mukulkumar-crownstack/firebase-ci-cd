"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudAPI = void 0;
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const helper_functions_1 = require("./utils/helper.functions");
const app = express();
app.use(cors({ origin: true }));
// app.post(
//   "/truora",
//   express.json({ type: "*/*" }),
//   (req, res) => {
//     const {}
//     console.log("")
//   }
// );
app.post(
  "/notifications/sms/send",
  express.json({ type: "*/*" }),
  (req, res) => {
    const { to, sms_body } = req.body;
    const smsFrom = "+19895753391";
    // const dateObj = new Date(date);
    // const localDate = new Date(
    //   dateObj.getTime() + dateObj.getTimezoneOffset() * 60 * 1000
    // );
    // // console.log(dateObj);
    // const formatedDate = localDate.toLocaleDateString("es", {
    //   weekday: "long",
    //   year: "numeric",
    //   month: "short",
    //   day: "numeric",
    // });
    // const text = `Hola ${name}!! Hemos confirmado tu registro para nuestra sesión de ${formatedDate}, ${time}. Por favor recuerda dar click en el link ${link} para conectarnos.`;
    helper_functions_1.sendSms(to, sms_body, smsFrom, (twilioRes) => {
      if (twilioRes.status === "success") {
        console.log("success");
        res.status(200).json({ msg: twilioRes });
      } else {
        console.log("error", twilioRes);
        res.status(500).json({ err: twilioRes });
      }
    });
  }
);


app.get("/truora/prospects/:phone",
  express.json({ type: "*/*" }),
(req, res) => {
  const phoneNumber  = req.params.phone;
  console.log(phoneNumber)
  admin.firestore().collection("driver_lead/leads/prospects").where("phone", "==", phoneNumber)
  .limit(1)
  .get()
  .then(snapshot => {
    if (snapshot.size > 0) {
      res.status(200).json({isAvailable: false}); 
    } else {
      res.status(200).json({isAvailable: true}); 
    }
  });
});


app.post("/truora/prospects/add",
  express.json({ type: "*/*" }),
(req, res) => {
  const { phone } = req.body;
  const data = {
    // "full_name": full_name,
    // "company_name": "",
    "phone": phone,
    // "vehicles": vehicles,
    // "email": email || '',
    // "location_name": location,
    // "session_time": session_time,
    "prospect_uuid": helper_functions_1.generateUUID(),
    "phone_country_code": "mx",
    "status": "prospect",
    "created_datetime": new Date(),
    "update_datetime": new Date(),
    "user_language": "es",
    "is_truora": true
  }
  admin.firestore().collection("driver_lead/leads/prospects").where("phone", "==", phone)
    .limit(1)
    .get()
    .then(snapshot => {
      if (snapshot.size === 0) {
        admin.firestore().doc(`driver_lead/leads/prospects/${data.prospect_uuid}`).set(data)
          .then((firebaseRes) => {
            console.log("success")
            res.status(200).json({message: "added the truora data"});
          })
          .catch((err) => {
            console.log("error", err)
            res.status(500).json(err);
          });
      }
    });
})

app.put("/truora/prospects/add",
  express.json({ type: "*/*" }),
  (req, res) => {
  // const phoneNumber = req.body.id;
  const { full_name, vehicles, email, session_time, location, phone } = req.body;
  const data = {
    "full_name": full_name,
    "company_name": "",
    // "phone": phone,
    "vehicle_type_codes": [vehicles],
    "email": email || '',
    "location_name": location,
    // "operating_city": {
    //     "Country": "MX",
    //     "State": "MEX",
    //     "City": "Estado de Mexico",
    //     "Municipality": "",
    //     "Neighborhood": "",
    //     "Street Name": "",
    //     "Landmark": "",
    //     "Zipcode": 56530,
    //     "PR Zone Code": "mx-mex-zone-0"
    // },
    // "vehicle_type_codes": [
    //     "bike-backpack"
    // ],
    "session_time": session_time,
    // "session_date": "2023-08-29T18:30:00.000Z",
    // "phone_country_code": "mx",
    // "zipcode": 56530,
    // "pr_zone_code": "mx-mex-zone-0",
    // "pr_zone": "zone-0",
    // "pr_market": "mex",
    // "pr_country": "mx",
    // "status": "prospect",
    // "session_timestamp": "2023-08-30T06:30:00Z",
    // "created_datetime": new Date(),
    "update_datetime": new Date(),
    // "user_language": "es",
    // "prospect_uuid": "07bc094b-17ff-5379-4f40-daf12511f941",
    // "is_truora": true
  }
  admin.firestore().collection("driver_lead/leads/prospects").where("phone", "==", phone)
  .limit(1)
  .get()
  .then(snapshot => {
    if (snapshot.size > 0) {
      const prospectID = snapshot.docs[0].id;
      admin.firestore().doc(`driver_lead/leads/prospects/${prospectID}`).update(data)
        .then((firebaseRes) => {
          console.log("success")
          res.status(200).json({message: "updated the truora data"});
        })
        .catch((err) => {
          console.log("error", err)
          res.status(500).json(err);
        });
    }  
  });
});

app.put("/truora/prospects/update",
  express.json({ type: "*/*" }),
  (req, res) => {
  // const phoneNumber = req.body.id;
  const { status, phone } = req.body;
  const data = {
    status: status,
    phone: phone,
    update_datetime: new Date()
  }
  admin.firestore().collection("driver_lead/leads/prospects").where("phone", "==", phone)
  .limit(1)
  .get()
  .then(snapshot => {
    if (snapshot.size > 0) {
      const prospectID = snapshot.docs[0].id;
      admin.firestore().doc(`driver_lead/leads/prospects/${prospectID}`).update(data)
        .then((firebaseRes) => {
          console.log("success")
          res.status(200).json({message: "updated the truora data"});
        })
        .catch((err) => {
          console.log("error", err)
          res.status(500).json(err);
        });
    }
  });
});

// app.post("/schedule-whatsapp", express.json({ type: "*/*" }), (req, res) => {
//   const text = req.body.text;
//   // const time = new Date(req.body.);
//   const to = `${req.body.to}`;
//   // const from = `+19895753391`;
//   const sendWhen = new Date(new Date().getTime() + 16 * 60000).toISOString()
//   const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_ID_US;
//   client.messages
//     .create({
//       body: text,
//       from: messagingServiceSid,
//       sendAt: sendWhen,
//       scheduleType: "fixed",
//       statusCallback: 'https://eo8e26lek9b38ke.m.pipedream.net',
//       to: to
//     })
//     .then((twilioRes) => {
//       console.log("syccess", messagingServiceSid, twilioRes)
//       res.status(200).json(twilioRes);
//     })
//     .catch((err) => {
//       console.log("error", err)
//       res.status(500).json(err);
//     });
// });
app.post(
  "/fix/migrated_data",
  express.json({ type: "*/*" }),
  async (req, res) => {
    const data = req.body;
    // let batch = admin.firestore().batch();
    const driverLeads = admin.firestore().collection("driver_lead");
    const driverLeadsRef = admin.firestore().collection("driver_lead");
    try {
      // let batch = db.batch();
      let batch = admin.firestore().batch();
      const documentSnapshotArray = await driverLeads.get();
      const records = documentSnapshotArray.docs;
      const index = documentSnapshotArray.size;
      console.log(`TOTAL SIZE=====${index}`);
      for (let i = 0; i < index; i++) {
        const docRef = records[i].ref;
        const docData = records[i].data();
        let obj = {};
        if (docData.first_name) {
          obj["first_name"] = docData.first_name.toLowerCase();
        }
        if (docData.last_name) {
          obj["last_name"] = docData.last_name.toLowerCase();
        }
        if (docData.middle_name) {
          obj["middle_name"] = docData.middle_name.toLowerCase();
        }
        if (docData.company_name) {
          obj["company_name"] = docData.company_name.toLowerCase();
        }
        if (docData.full_name) {
          obj["full_name"] = docData.full_name.toLowerCase();
        }
        // YOUR UPDATES
        if (Object.keys(obj).length > 0) {
          batch.update(docRef, obj);
        }
        if ((i + 1) % 499 === 0) {
          await batch.commit();
          batch = admin.firestore().batch();
        }
      }
      // For committing final batch
      if (!(index % 499 == 0)) {
        await batch.commit();
      }
      res.status(200).json({ message: "Done fixing data" });
      console.log("write completed");
    } catch (error) {
      console.error(`updateWorkers() errored out : ${error.stack}`);
      res.status(500).json({ message: "error" });
      // reject(error);
    }
    // if (data.key_to_update === 'name') {
    //   // const usDriverCodes = ['independent_driver', 'owner_operator', 'fleet_operator'];
    //   // const mxDriverCodes = ['cliente_independiente', 'flotilleros', 'persona_moral'];
    //   driverLeadsRef.limit(250).get().then(function (querySnapshot) {
    //     querySnapshot.forEach(function (doc) {
    //       // const driverDocument = doc.data();
    //       // if (usDriverCodes.includes(driverDocument.driver_type_code) && driverDocument.phone_country_code !== 'us') {
    //         batch.update(doc.ref, 'first_name', doc.data().first_name.toLowerCase());
    //         batch.update(doc.ref, 'last_name', doc.data().last_name.toLowerCase());
    //         batch.update(doc.ref, 'middle_name', doc.data().middle_name.toLowerCase());
    //         batch.update(doc.ref, 'company_name', doc.data().company_name.toLowerCase());
    //       // }
    //       // if (mxDriverCodes.includes(driverDocument.driver_type_code) && driverDocument.phone_country_code !== 'mx') {
    //       //   batch.update(doc.ref, 'phone_country_code', 'mx');
    //       // }
    //       // if(driverDocument.is_migrated_driver && driverDocument.how_many_vehicles) {
    //       //   if(!driverDocument['how_many_vehicles_follow_select']) {
    //       //     batch.update(doc.ref, 'how_many_vehicles', null);
    //       //   }
    //       // }
    //     });
    //     return batch.commit();
    //   }).then(function () {
    //     console.log("SUCCESS")
    //     res.status(200).json({ message: 'Done fixing data' });
    //   })
    //   .catch(function (error) {
    //     //...
    //     res.status(500).json({ message: error });
    //   });
    // } else {
    //   res.status(500).json({ message: 'key_to_update should be phone_country_code' });
    // }
  }
);
// app.post("/token/:source", express.json({ type: "*/*" }), (req, res) => {
//   const options = {
//     headers: {
//       Accept: "application/json",
//       Authorization: `Account ${
//         constants_1.YARDSTIK[
//           helper_functions_1.getYardStikKey(req.params.source)
//         ].API_KEY
//       }`,
//       "Content-Type": "application/json",
//     },
//   };
//   axios
//     .post(
//       constants_1.YARDSTIK[helper_functions_1.getYardStikKey(req.params.source)]
//         .TOKEN_URL,
//       JSON.stringify(req.body),
//       options
//     )
//     .then((response) => {
//       res = helper_functions_1.responseHeader(res);
//       res.status(200).json(response.data);
//     })
//     .catch((error) => {
//       res.status(error.response.status).json(error.response.data);
//     });
// });
// app.post("/candidates/:source", express.json({ type: "*/*" }), (req, res) => {
//   const options = {
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Account ${
//         constants_1.YARDSTIK[
//           helper_functions_1.getYardStikKey(req.params.source)
//         ].API_KEY
//       }`,
//       Accept: "application/json",
//     },
//   };
//   axios
//     .post(
//       constants_1.YARDSTIK[helper_functions_1.getYardStikKey(req.params.source)]
//         .CANDIDATES_URL,
//       JSON.stringify(req.body),
//       options
//     )
//     .then((response) => {
//       res = helper_functions_1.responseHeader(res);
//       res.status(200).json(response.data);
//     })
//     .catch((error) => {
//       res.status(error.response.status).json(error.response.data);
//     });
// });
// app.post("/invitations/:source", express.json({ type: "*/*" }), (req, res) => {
//   const options = {
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Account ${
//         constants_1.YARDSTIK[
//           helper_functions_1.getYardStikKey(req.params.source)
//         ].API_KEY
//       }`,
//     },
//   };
//   const body = {
//     account_package_id:
//       constants_1.YARDSTIK[
//         helper_functions_1.getYardStikKey(req.params.source)
//       ][req.body.account_package_code],
//     candidate_id: req.body.candidate_id,
//   };
//   axios
//     .post(
//       constants_1.YARDSTIK[helper_functions_1.getYardStikKey(req.params.source)]
//         .INVITATIONS_URL,
//       JSON.stringify(body),
//       options
//     )
//     .then((response) => {
//       res = helper_functions_1.responseHeader(res);
//       res.status(200).json(response.data);
//     })
//     .catch((error) => {
//       res.status(error.response.status).json(error.response.data);
//     });
// });
// app.get("/reports/:id/:source", express.json({ type: "*/*" }), (req, res) => {
//   const options = {
//     headers: {
//       Authorization: `Account ${
//         constants_1.YARDSTIK[
//           helper_functions_1.getYardStikKey(req.params.source)
//         ].API_KEY
//       }`,
//     },
//   };
//   axios
//     .get(
//       `${
//         constants_1.YARDSTIK[
//           helper_functions_1.getYardStikKey(req.params.source)
//         ].REPORTS_URL
//       }/${req.params.id}`,
//       options
//     )
//     .then((response) => {
//       res = helper_functions_1.responseHeader(res);
//       res.status(200).json(response.data);
//     })
//     .catch((error) => {
//       console.log(error);
//       res.status(error.response.status).json(error.response.data);
//     });
// });
// app.get(
//   "/invitations/:id/:source",
//   express.json({ type: "*/*" }),
//   (req, res) => {
//     const options = {
//       headers: {
//         Authorization: `Account ${
//           constants_1.YARDSTIK[
//             helper_functions_1.getYardStikKey(req.params.source)
//           ].API_KEY
//         }`,
//       },
//     };
//     axios
//       .get(
//         `${
//           constants_1.YARDSTIK[
//             helper_functions_1.getYardStikKey(req.params.source)
//           ].INVITATIONS_URL
//         }/${req.params.id}`,
//         options
//       )
//       .then((response) => {
//         res = helper_functions_1.responseHeader(res);
//         res.status(200).json(response.data);
//       })
//       .catch((error) => {
//         console.log(error);
//         res.status(error.response.status).json(error.response.data);
//       });
//   }
// );
// app.get(
//   "/accounts/packages/:source",
//   express.json({ type: "*/*" }),
//   (req, res) => {
//     const options = {
//       headers: {
//         Authorization: `Account ${
//           constants_1.YARDSTIK[
//             helper_functions_1.getYardStikKey(req.params.source)
//           ].API_KEY
//         }`,
//       },
//     };
//     axios
//       .get(
//         `${
//           constants_1.YARDSTIK[
//             helper_functions_1.getYardStikKey(req.params.source)
//           ].ACCOUNTS_URL
//         }/${
//           constants_1.YARDSTIK[
//             helper_functions_1.getYardStikKey(req.params.source)
//           ].ACCOUNT_ID
//         }/packages`,
//         options
//       )
//       .then((response) => {
//         res = helper_functions_1.responseHeader(res);
//         res.status(200).json(response.data);
//       })
//       .catch((error) => {
//         console.log(error);
//         res.status(error.response.status).json(error.response.data);
//       });
//   }
// );
exports.cloudAPI = app;
//# sourceMappingURL=cloudAPI.f.js.map
