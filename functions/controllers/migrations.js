
const admin = require("firebase-admin");
const functions = require('firebase-functions');
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

// exports.postMigrationsData = async (req, res, next) => {
//     console.log("start >>>>>>>>>>>>>>>>>>>>>>>>>>>");

//     const prospectsCollectionRef = admin.firestore().collection('driver_lead/leads/prospects');
//     const driverLeadCollectionRef = admin.firestore().collection('driver_lead');

//     const documentSnapshotArray = await prospectsCollectionRef
//         .where('status', '==', 'rejected')
//         .get();
    
//     const existingLeadsSnapshot = await driverLeadCollectionRef.get();
//     const existingLeadsSet = new Set(existingLeadsSnapshot.docs.map(doc => doc.data().phone));

//     let batch = admin.firestore().batch();
//     let operationCounter = 0;
//     let counter = 0;

//     for (const documentSnapshot of documentSnapshotArray.docs) {
//         let documentData = documentSnapshot.data();

//         counter++;

//         if (!existingLeadsSet.has(documentData?.phone)) {
//             documentData['status'] = 'rejected';
//             documentData['application_status'] = 'without_unit';
//             documentData['update_datetime'] = documentData?.update_datetime || new Date();
//             documentData['pr_user_id'] = documentData?.pr_user_id || 'unknown';

//             if (!documentData?.driver_type_code) {
//                 documentData['driver_type_code'] = 'cliente_independiente';
//                 documentData['application_type'] = 'cliente_independiente';
//             }
            
//             if (!documentData?.application_type) {
//                 documentData['application_type'] = documentData?.driver_type_code;
//             }

//             if (documentData?.assigned_datetime && typeof documentData.assigned_datetime === 'number') {
//                 documentData.assigned_datetime = new Date(documentData.assigned_datetime);
//             }

//             if (documentData.driver_type_code === 'cliente_independiente') {
//                 documentData['lead_status'] = "vehicle_info_check";
//                 documentData['driver_user_uuid'] = documentData.prospect_uuid;
//             } else {
//                 documentData.lead_status = "company_background_check";
//                 documentData['dispatch_driver_uuid'] = documentData.prospect_uuid;
//             }

//             if (documentData?.driver_type_code === 'cliente_independiente' || documentData?.driver_type_code === 'independent_driver') {
//                 documentData['how_many_drivers'] = 1;
//             }

//             const newDocId = `${documentData.driver_type_code}_${documentData.phone_country_code}_${documentData.phone}`;
//             const newDocRef = driverLeadCollectionRef.doc(newDocId);

//             batch.set(newDocRef, documentData);
//             operationCounter++;

//             const prospectDocRef = prospectsCollectionRef.doc(documentSnapshot.id);
//             batch.update(prospectDocRef, {
//                 is_migration_done: true,
//                 migration_datetime: new Date()
//             });

//             if (operationCounter === 499) {
//                 console.log(`operationCounter __________________________________________________ ${operationCounter}`);
//                 await batch.commit();
                
//                 batch = admin.firestore().batch();
//                 operationCounter = 0;
//             }
//         }
//     }

//     if (operationCounter > 0) {
//         await batch.commit();
//         console.log("Final batch committed.", operationCounter);
//     }

//     console.log("End >>>>>>>>>>>>>>>>>>>>>>>>>>>");
//     res.status(200).json({ message: "Done migrating data" });
// };

exports.postMigrationsData = async (req, res, next) => {
    console.log("start >>>>>>>>>>>>>>>>>>>>>>>>>>>");

    const driverLeadCollectionRef = admin.firestore().collection('driver_lead');

    try {
        const snapshot = await driverLeadCollectionRef.get();
        let batch = admin.firestore().batch();
        let operationCounter = 0;

        if (snapshot.empty) {
            console.log("No documents found in the driver_lead collection.");
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();

                if (!data.hasOwnProperty('contact_counter')) {
                    const docRef = driverLeadCollectionRef.doc(doc.id);

                    batch.update(docRef, { contact_counter: 0 });
                    operationCounter++;

                    if (operationCounter === 499) {
                        console.log(`Committing batch with 499 updates...`);
                        batch.commit().then(() => {
                            console.log("Batch committed successfully.");
                        }).catch(err => {
                            console.error("Error committing batch:", err);
                        });

                        batch = admin.firestore().batch(); 
                        operationCounter = 0;
                    }
                }
            });

            if (operationCounter > 0) {
                console.log(`Committing final batch with ${operationCounter} updates...`);
                await batch.commit();
            }

            console.log("All updates committed successfully.");
        }

        console.log("End >>>>>>>>>>>>>>>>>>>>>>>>>>>");
        res.status(200).json({
            message: "Done migrating data",
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to migrate data" });
    }
};

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