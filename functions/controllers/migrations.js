
const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");

// const { algoliaProspectIndex } = require("../models/algolia.model");

exports.getMigrationsFirestoreData = async (req, res, next) => {
    const countryCode = req.params.countryCode;
    admin.firestore().doc('driver_lead_metadata/' + countryCode).get().then((documentSnapshot) => {
        res.status(200).json(documentSnapshot.data());
    });
}

exports.postMigrationsFirestoreData = async (req, res, next) => {
    const { data, country_code } = req.body;
    admin.firestore().doc('driver_lead_metadata/' + country_code).update(data).then((documentSnapshot) => {
        res.status(200).json({ message: "updated" });
    });
}

exports.postMigrationsData = async (req, res, next) => {
    console.log("start");
    // const sDate = new Date('2023-08-01');
    // const eDate = new Date('2023-09-26');
    // const startfulldate = Timestamp.fromDate(eDate);
    // const endfulldate = admin.firestore.Timestamp.fromDate(eDate);
    // const driverLeads = admin.firestore().collection("driver_lead/leads/prospects")
    const documentSnapshotArray = await admin.firestore().collection('driver_lead/leads/prospects').get();
    const vehicles = [
        {
            vehicle_code: [' 1.5 ton',
                '1.5 ton',
                '1.5-ton-closed-truck',
                '3.5-ton-closed-truck',
                '5-ton-closed-truck',
                '8-ton-closed-truck',
                '10-ton-closed-truck',
                '15-ton-closed-truck',
                '48-pies-closed-truck',
                '53-pies-closed-truck',
                '10 ton',
                '125cc a 249cc',
                '15 ton',
                '250cc a 500cc',
                '3.5 ton',
                '48 pies',
                '48-pies-closed-truck',
                '5 ton ',
                '53 pies',
                '8 ton',
                'Caja',
                'Caja seca',
                'Caja seca 1.5 ton',
                'Caja seca 3.5 ton',
                'Caja Seca de 8 ton',
                'vehículo de 1.5 Ton',
                'vehículo de 10 Ton',
                'vehículo de 48 Pies'
            ],
            code: 'closed-trucks'
        },
        {
            vehicle_code: [
                'Auto',
                'car',
                'Sedán',
                'Sedán ',
                'SUV',
                'car-hatchback',
                'car',
                'suv'
            ],
            code: 'car-or-suv'
        },
        {
            vehicle_code: [
                'bike-backpack',
                'bike-box',
                'Hatchback',
                'Moto con caja',
                'Moto con mochila',
                'Moto sin mochila',
                'Motocicleta',
            ],
            code: 'bike'
        },
        {
            vehicle_code: [
                'Camioneta/Pick up',
                'large-van',
                'van',
                'Van ',
                'Van (Tipo Kangoo)',
                'Van 1.5ton a 3.5 ton',
                'Van 750kg a 1 ton',
                'Van extralarga',
                'Van larga',
                'Van mediana ',
                'Van pequeña',
                'truck-pickup',
                'small-van',
                '2-ton-extra-large-van',
                'large-van',
                '2-ton-extra-large-van',
                '3.5-ton-extra-large-van',
                '3.5-ton-panel-van'
            ],
            code: 'pickup-or-van'
        },
        {
            vehicle_code: [
                'Estacas/Redilas',
                '1.5-ton-stakes-truck',
                '3.5-ton-stakes-truck'
            ],
            code: 'redilas-truck'
        },
        {
            vehicle_code: [
                'Panel',
                'Plataforma',
                '1.5-ton-iron-truck',
                '3.5-ton-iron-truck',
                '5-ton-iron-truck',
                '8-ton-iron-truck',
                '10-ton-iron-truck',
                '48-pies-iron-truck',
                '53-pies-iron-truck',
            ],
            code: 'iron-trucks'
        },
        {
            vehicle_code: [
                '1.5-ton-stakes-truck',
                '3.5-ton-stakes-truck',
            ],
            code: 'stakes-truck'
        }
    ]
    const flows = [
        {
            value: 'IPF285052cb3a1e6cf2c14170842dc374be',
            name: 'Referidos*',
            vehicle_type: '',
        },
        {
            value: 'IPF30ba1559a832322d2df21f586080a97f',
            name: 'Caja seca ONLINE*',
            vehicle_type: 'closed-trucks'
        },
        {
            value: 'IPFefa34628417843f5125388a87c95d288',
            name: 'Motocicleta* ONLINE*',
            vehicle_type: 'bike'
        },
        {
            value: 'IPF406f82eb18b7c8cc16a5fd5753be5372',
            name: 'Defecto *',
            vehicle_type: ''
        },
        {
            value: 'IPFc8a1e475ef1a613ebbe768da82204b54',
            name: 'Facebook *',
            vehicle_type: '',
        },
        {
            value: 'IPFb3b82beccbb10d5a5301ab926248a418',
            name: 'Sedán, Hatchback,SUV* ONLINE',
            vehicle_type: 'car-or-suv'
        },
        {
            value: 'IPFb22d015fce646eb2aab075505e2024d0',
            name: 'Van (500kg a 3.5 ton) Online*',
            vehicle_type: 'pickup-or-van'
        },
        {
            value: 'IPFe834afdb808354fccd707bb879f1d5da',
            name: 'Orgánico *',
            vehicle_type: '',
        },
        {
            value: 'IPFf5c8dd9cf827a1ff49bd9ae833ac8e29',
            name: 'QA - Testing',
            vehicle_type: '',
        }
    ]
    const batchArray = [];
    batchArray.push(admin.firestore().batch());
    let operationCounter = 0;
    let batchIndex = 0;
    let counter = 0;
    documentSnapshotArray.forEach((documentSnapshot) => {
        const documentData = documentSnapshot.data();
        counter++;
        // update document data here...
        // documentData['vehicle_type_codes'] = documentData.vehicle_type_codes;
        // documentData['vehicle_subcategory_codes'] = documentData.vehicle_type_codes;
        if (documentData.truora_flow_id) {
            const flow = flows.find(flow => flow.value === documentData.truora_flow_id);
            if(flow) {
                if(flow.vehicle_type) {
                    if(documentData.vehicle_type_codes) {
                        documentData['vehicle_subcategory_codes'] = documentData.vehicle_type_codes;
                    }
                    documentData['vehicle_type_codes'] = [flow.vehicle_type];
                } else {
                    if(documentData.vehicle_type_codes && documentData.vehicle_type_codes) {
                        const code = documentData.vehicle_type_codes[0];
                        const v = vehicles.find(v => v.vehicle_code.includes(code));
                        if(v) {
                            documentData['vehicle_subcategory_codes'] = documentData.vehicle_type_codes;
                            documentData.vehicle_type_codes = [v.code];
                        }
                    }
                }
            }
        } else {
            console.log(documentData.vehicle_type_codes);
            if(documentData.vehicle_type_codes && documentData.vehicle_type_codes.length) {
                const code = documentData.vehicle_type_codes[0];
                const v = vehicles.find(v => v.vehicle_code.includes(code));
                if(v) {
                    documentData['vehicle_subcategory_codes'] = documentData.vehicle_type_codes;
                    documentData.vehicle_type_codes = [v.code];
                }
            }
        }
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
    batchArray.push(admin.firestore().batch());
    let operationCounter = 0;
    let batchIndex = 0;
    let counter = 0;
    querySnapshot.docs.forEach(async (doc) => {
        const document = doc.data();
        counter++;
        const record = {
            objectID: doc.id,
            ...document
        };
        if (record.created_datetime) {
            record.created_datetime = new Date(
                record.created_datetime.toDate()
            ).valueOf();
        }
        if (record.update_datetime) {
            record.update_datetime = new Date(
                record.update_datetime.toDate()
            ).valueOf();
        }
        if (record.session_date) {
            record.session_date = new Date(record.session_date.toDate()).valueOf();
        }
        // algoliaRecords.push(record);
        batchArray[batchIndex].records.push(record);
        batchArray[batchIndex].length++;

        // batchArray[batchIndex].update(documentSnapshot.ref, documentData);
        operationCounter++;

        if (operationCounter === 999 || counter === querySnapshot.size) {
            // batchArray.push(admin.firestore().batch());
            await algoliaProspectIndex.saveObjects(batchArray[batchIndex].records);
            console.log(`Batch ${batchIndex} was indexed to Algolia successfully.`);
            batchIndex++;
            operationCounter = 0;
            batchArray.push({ batchIndex: batchIndex, records: [], length: 0 });
            console.log("batch operations..... succeed", counter, " of ", querySnapshot.size);
        }
    });
    res.status(201).json({ message: "Successfully migrated", recordsLength: counter, batchArray: batchArray });
};