"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudAPI = void 0;
require('dotenv').config()
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const admin = require("firebase-admin");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const constants_1 = require("./utils/constants");
const helper_functions_1 = require("./utils/helper.functions");
const app = express();
app.use(cors({ origin: true }));
app.post("/schedule-whatsapp", express.json({ type: "*/*" }), (req, res) => {
  const text = req.body.text;
  const to = `whatsapp:${req.body.to}`;
  const nowDate = new Date();
  const twentyLater = new Date(nowDate.setMinutes(nowDate.getMinutes() + 20));
  client.messages
    .create({
      body: text,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_ID,
      sendAt: twentyLater,
      scheduleType: "fixed",
      to: to,
    })
    .then((twilioRes) => {
      console.log("syccess", twilioRes)
      res.status(200).json(twilioRes);
    })
    .catch((err) => {
      console.log("error", err)
      res.status(500).json(err);
    });
});
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
app.post("/token/:source", express.json({ type: "*/*" }), (req, res) => {
  const options = {
    headers: {
      Accept: "application/json",
      Authorization: `Account ${
        constants_1.YARDSTIK[
          helper_functions_1.getYardStikKey(req.params.source)
        ].API_KEY
      }`,
      "Content-Type": "application/json",
    },
  };
  axios
    .post(
      constants_1.YARDSTIK[helper_functions_1.getYardStikKey(req.params.source)]
        .TOKEN_URL,
      JSON.stringify(req.body),
      options
    )
    .then((response) => {
      res = helper_functions_1.responseHeader(res);
      res.status(200).json(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).json(error.response.data);
    });
});
app.post("/candidates/:source", express.json({ type: "*/*" }), (req, res) => {
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Account ${
        constants_1.YARDSTIK[
          helper_functions_1.getYardStikKey(req.params.source)
        ].API_KEY
      }`,
      Accept: "application/json",
    },
  };
  axios
    .post(
      constants_1.YARDSTIK[helper_functions_1.getYardStikKey(req.params.source)]
        .CANDIDATES_URL,
      JSON.stringify(req.body),
      options
    )
    .then((response) => {
      res = helper_functions_1.responseHeader(res);
      res.status(200).json(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).json(error.response.data);
    });
});
app.post("/invitations/:source", express.json({ type: "*/*" }), (req, res) => {
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Account ${
        constants_1.YARDSTIK[
          helper_functions_1.getYardStikKey(req.params.source)
        ].API_KEY
      }`,
    },
  };
  const body = {
    account_package_id:
      constants_1.YARDSTIK[
        helper_functions_1.getYardStikKey(req.params.source)
      ][req.body.account_package_code],
    candidate_id: req.body.candidate_id,
  };
  axios
    .post(
      constants_1.YARDSTIK[helper_functions_1.getYardStikKey(req.params.source)]
        .INVITATIONS_URL,
      JSON.stringify(body),
      options
    )
    .then((response) => {
      res = helper_functions_1.responseHeader(res);
      res.status(200).json(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).json(error.response.data);
    });
});
app.get("/reports/:id/:source", express.json({ type: "*/*" }), (req, res) => {
  const options = {
    headers: {
      Authorization: `Account ${
        constants_1.YARDSTIK[
          helper_functions_1.getYardStikKey(req.params.source)
        ].API_KEY
      }`,
    },
  };
  axios
    .get(
      `${
        constants_1.YARDSTIK[
          helper_functions_1.getYardStikKey(req.params.source)
        ].REPORTS_URL
      }/${req.params.id}`,
      options
    )
    .then((response) => {
      res = helper_functions_1.responseHeader(res);
      res.status(200).json(response.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(error.response.status).json(error.response.data);
    });
});
app.get(
  "/invitations/:id/:source",
  express.json({ type: "*/*" }),
  (req, res) => {
    const options = {
      headers: {
        Authorization: `Account ${
          constants_1.YARDSTIK[
            helper_functions_1.getYardStikKey(req.params.source)
          ].API_KEY
        }`,
      },
    };
    axios
      .get(
        `${
          constants_1.YARDSTIK[
            helper_functions_1.getYardStikKey(req.params.source)
          ].INVITATIONS_URL
        }/${req.params.id}`,
        options
      )
      .then((response) => {
        res = helper_functions_1.responseHeader(res);
        res.status(200).json(response.data);
      })
      .catch((error) => {
        console.log(error);
        res.status(error.response.status).json(error.response.data);
      });
  }
);
app.get(
  "/accounts/packages/:source",
  express.json({ type: "*/*" }),
  (req, res) => {
    const options = {
      headers: {
        Authorization: `Account ${
          constants_1.YARDSTIK[
            helper_functions_1.getYardStikKey(req.params.source)
          ].API_KEY
        }`,
      },
    };
    axios
      .get(
        `${
          constants_1.YARDSTIK[
            helper_functions_1.getYardStikKey(req.params.source)
          ].ACCOUNTS_URL
        }/${
          constants_1.YARDSTIK[
            helper_functions_1.getYardStikKey(req.params.source)
          ].ACCOUNT_ID
        }/packages`,
        options
      )
      .then((response) => {
        res = helper_functions_1.responseHeader(res);
        res.status(200).json(response.data);
      })
      .catch((error) => {
        console.log(error);
        res.status(error.response.status).json(error.response.data);
      });
  }
);
exports.cloudAPI = app;
//# sourceMappingURL=cloudAPI.f.js.map
