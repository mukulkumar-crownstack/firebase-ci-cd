
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

    const prospectsCollectionRef = admin.firestore().collection('driver_lead/leads/prospects');
    const driverLeadCollectionRef = admin.firestore().collection('driver_lead');
    
    const documentSnapshotArray = await prospectsCollectionRef.where('status', '==', 'rejected').get();
    
    const batchArray = [];
    batchArray.push(admin.firestore().batch());
    let operationCounter = 0;
    let batchIndex = 0;
    let counter = 0;

    for (const documentSnapshot of documentSnapshotArray.docs) {
        let documentData = documentSnapshot.data();
        counter++;

        const existingLeadQuerySnapshot = await driverLeadCollectionRef
            .where('phone', '==', documentData?.phone)
            .get();

        if (existingLeadQuerySnapshot.empty) {
            documentData['status'] = 'rejected';
            documentData['application_status'] = 'without_unit';
            documentData['update_datetime'] = new Date();
            documentData['pr_user_id'] = 'unknown';
            if(!documentData?.driver_type_code) {
                documentData['driver_type_code'] = 'cliente_independiente';
            }
            if(!documentData?.application_type) {
                documentData['application_type'] = documentData?.driver_type_code;
            }

            const newDocId = `${documentData.driver_type_code}_${documentData.phone_country_code}_${documentData.phone}`;
            const newDocRef = driverLeadCollectionRef.doc(newDocId);
            batchArray[batchIndex].set(newDocRef, documentData);
            operationCounter++;

            console.log('Migrating document:', documentData?.phone);

            if (operationCounter === 499) {
                batchArray.push(admin.firestore().batch());
                batchIndex++;
                operationCounter = 0;
                console.log("operations.....", counter);
            }
        }
    }

    // for (const batch of batchArray) {
    //     await batch.commit();
    //     console.log("Batch committed.");
    // }

    res.status(200).json({ message: "Done migrating data" });
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