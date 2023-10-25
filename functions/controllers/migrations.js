
const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");

const { algoliaProspectIndex } = require("../models/algolia.model");

exports.postMigrationsData = async (req, res, next) => {
    console.log("start");
    // const sDate = new Date('2023-08-01');
    // const eDate = new Date('2023-09-26');
    // const startfulldate = Timestamp.fromDate(eDate);
    // const endfulldate = admin.firestore.Timestamp.fromDate(eDate);
    // const driverLeads = admin.firestore().collection("driver_lead/leads/prospects")
    const documentSnapshotArray = await admin.firestore().collection('driver_lead/leads/prospects').get();

    const batchArray = [];
    batchArray.push(admin.firestore().batch());
    let operationCounter = 0;
    let batchIndex = 0;
    let counter = 0;
    documentSnapshotArray.forEach((documentSnapshot) => {
        const documentData = documentSnapshot.data();
        counter++;
        // update document data here...
        documentData['last_status_update'] = documentData.update_datetime;

        batchArray[batchIndex].update(documentSnapshot.ref, documentData);
        operationCounter++;

        if (operationCounter === 499) {
            batchArray.push(admin.firestore().batch());
            batchIndex++;
            operationCounter = 0;
            console.log("operations.....", counter);
        }
    });

    batchArray.forEach(async batch => { await batch.commit(); console.log("batch commiting.....", counter); });
    res.status(200).json({ message: "Done fixing data" });
    // .where("created_datetime", "<=", startfulldate)
    // const flows = [
    //   {
    //     value: 'IPF285052cb3a1e6cf2c14170842dc374be',
    //     name: 'Referidos*'
    //   },
    //   {
    //     value: 'IPF30ba1559a832322d2df21f586080a97f',
    //     name: 'Caja seca ONLINE*'
    //   },
    //   {
    //     value: 'IPFefa34628417843f5125388a87c95d288',
    //     name: 'Motocicleta* ONLINE*'
    //   },
    //   {
    //     value: 'IPF406f82eb18b7c8cc16a5fd5753be5372',
    //     name: 'Defecto *'
    //   },
    //   {
    //     value: 'IPFc8a1e475ef1a613ebbe768da82204b54',
    //     name: 'Facebook *'
    //   },
    //   {
    //     value: 'IPFb3b82beccbb10d5a5301ab926248a418',
    //     name: 'Sedán, Hatchback,SUV* ONLINE'
    //   },
    //   {
    //     value: 'IPFb22d015fce646eb2aab075505e2024d0',
    //     name: 'Van (500kg a 3.5 ton) Online*'
    //   },
    //   {
    //     value: 'IPFe834afdb808354fccd707bb879f1d5da',
    //     name: 'Orgánico *'
    //   },
    //   {
    //     value: 'IPFf5c8dd9cf827a1ff49bd9ae833ac8e29',
    //     name: 'QA - Testing'
    //   }
    // ]
    // const driverLeadsRef = admin.firestore().collection("driver_lead");
    // try {
    //   // let batch = db.batch();
    //   let batch = admin.firestore().batch();
    //   const documentSnapshotArray = await driverLeads.get();
    //   const records = documentSnapshotArray.docs;
    //   const index = documentSnapshotArray.size;
    //   console.log(`TOTAL SIZE=====${index}`);
    //   for (let i = 0; i < index; i++) {
    //     const docRef = records[i].ref;
    //     const docData = records[i].data();
    //     // let flow = 'QA - Testing';
    //     // if(docData.truora_flow_id) {
    //     //   flow = flows.find(f => f.value === docData.truora_flow_id).name;
    //     // }
    //     let obj = {
    //       last_status_update: null
    //     };
    //     // YOUR UPDATES
    //     if (Object.keys(obj).length > 0) {
    //       batch.update(docRef, obj);
    //     }
    //     if ((i + 1) % 499 === 0) { 
    //       await batch.commit();
    //       batch = admin.firestore().batch();
    //     }
    //   }
    //   // For committing final batch
    //   if (!(index % 499 == 0)) {
    //     await batch.commit();
    //   }
    //   res.status(200).json({ message: "Done fixing data" });
    //   console.log("write completed");
    // } catch (error) {
    //   console.error(`updateWorkers() errored out : ${error.stack}`);
    //   res.status(500).json({ message: "error" });
    //   // reject(error);
    // }
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

exports.sendCollectionToAlgolia = async (req, res) => {
    // const algoliaRecords = [];
    const querySnapshot = await admin.firestore().collection('driver_lead').get();
    const batchArray = [{ batchIndex: 0, records: [], length: 0 }];
    // batchArray.push(admin.firestore().batch());
    let operationCounter = 0;
    let batchIndex = 0;
    let counter = 0;
    // querySnapshot.docs.forEach(async (doc) => {
    //     const document = doc.data();
    //     counter++;
    //     const record = {
    //         objectID: doc.id,
    //         ...document
    //     };
    //     if (record.created_datetime) {
    //         record.created_datetime = new Date(
    //             record.created_datetime.toDate()
    //         ).valueOf();
    //     }
    //     if (record.update_datetime) {
    //         record.update_datetime = new Date(
    //             record.update_datetime.toDate()
    //         ).valueOf();
    //     }
    //     if (record.session_date) {
    //         record.session_date = new Date(record.session_date.toDate()).valueOf();
    //     }
    //     // algoliaRecords.push(record);
    //     batchArray[batchIndex].records.push(record);
    //     batchArray[batchIndex].length++;

    //     // batchArray[batchIndex].update(documentSnapshot.ref, documentData);
    //     operationCounter++;

    //     if (operationCounter === 999 || counter === querySnapshot.size) {
    //         // batchArray.push(admin.firestore().batch());
    //         await algoliaProspectIndex.saveObjects(batchArray[batchIndex].records);
    //         console.log(`Batch ${batchIndex} was indexed to Algolia successfully.`);
    //         batchIndex++;
    //         operationCounter = 0;
    //         batchArray.push({ batchIndex: batchIndex, records: [], length: 0 });
    //         console.log("batch operations..... succeed", counter, " of ", querySnapshot.size);
    //     }
    // });
    res.status(201).json({ message: "Successfully migrated", recordsLength:  counter, batchArray: batchArray});
};