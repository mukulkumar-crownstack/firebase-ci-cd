const admin = require("firebase-admin");
const { getFirestoreRecord, addFirestoreRecord, updateFirestoreRecord } = require("../models/firestore.model");
const { ApplicationStatus } = require("../utils/enums");
const { generateUUID } = require("../utils/helper.functions");
const { interviewers } = require("../utils/constants");
const qulifiedleadCollectionPath = "driver_lead";
const qulifiedleadDocPath = `driver_lead/:doc_uuid`;
const getDataFromSnapshot = (snapshot) => ({
    docID: snapshot.docs[0].id,
    docData: snapshot.docs[0].data(),
});

exports.postQualifiedDriver = async (req, res, next) => {
    const {
        phone,
        phone_country_code,
        full_name,
        created_by,
        pr_user_id,
        dispatch_company_uuid,
        company_name
    } = req.body;
    const qualifiedLeadSnapshot = await checkIfLeadAlreadyPresentAsQualified(phone, 'mx');
    if (qualifiedLeadSnapshot.size === 0) {
        const dispatchDriverUUID = generateUUID();
        const prospectData = {
            full_name: full_name,
            company_name: company_name,
            phone: phone,
            phone_country_code: phone_country_code,
            application_status: ApplicationStatus.IN_PROGRESS,
            created_datetime: new Date(),
            update_datetime: new Date(),
            created_by: created_by,
            dispatch_company_uuid: dispatch_company_uuid,
            dispatch_driver_uuid: dispatchDriverUUID,
            application_type: 'driver'
        };
        prospectData['interviewer_details'] = interviewers.find(i => i.pr_user_id === +pr_user_id);
        const dispatchDriverDOCID = `driver_${prospectData.phone_country_code}_${dispatchDriverUUID}_${dispatch_company_uuid}`;
        const docPath = qulifiedleadDocPath.replace(
            ":doc_uuid",
            dispatchDriverDOCID
        );
        const addRecord = await addFirestoreRecord(docPath, prospectData);
        if (addRecord && addRecord.status === 200) {
            const logPath = `${docPath}/change_logs/${new Date().toISOString()}`;
            addLog(logPath, prospectData);
            res.status(200).json({
                message: "added dispatch driver",
                status: prospectData.status,
                is_avalabile: true
            });
        } else {
            res.status(500).json(addRecord.error);
        }
    } else {
        res.status(200).json({
            message: "phone number already present",
            status: qualifiedLeadSnapshot.docs[0].data().application_status,
            is_avalabile: false
        });
    }
};

exports.putQualifiedDriver = async (req, res, next) => {
    const dispatchDriverUUID = req.params.uuid;
    const snapshot = await getFirestoreRecord(qulifiedleadCollectionPath, {
        key: "dispatch_driver_uuid",
        operator: "==",
        value: dispatchDriverUUID,
    });
    if (snapshot.size > 0) {
        const data = { ...req.body, update_datetime: new Date() };
        const { docID, docData } = getDataFromSnapshot(snapshot);
        if (data.phone !== docData.phone) {
            const qualifiedLeadSnapshot = await checkIfLeadAlreadyPresentAsQualified(docData.phone, 'mx');
            if (qualifiedLeadSnapshot.size === 0) {
                const isUpdated = await updateRecord(docID, data);
                if (isUpdated.status === 200) {
                    res.status(200).json({ message: "Updated dispatch driver details" });
                } else {
                    res.status(500).json(isUpdated.error);
                }
            } else {
                res.status(200).json({
                    message: "phone number already present",
                    status: qualifiedLeadSnapshot.docs[0].data().application_status,
                    is_avalabile: false
                });
            }
        } else {
            const isUpdated = await updateRecord(docID, data);
            if (isUpdated.status === 200) {
                res.status(200).json({ message: "Updated dispatch driver details" });
            } else {
                res.status(500).json(isUpdated.error);
            }
        }
    }
}

exports.putQualifiedDriverStatus = async (req, res, next) => {
    const dispatchDriverUUID = req.params.uuid;
    const snapshot = await getFirestoreRecord(qulifiedleadCollectionPath, {
        key: "dispatch_driver_uuid",
        operator: "==",
        value: dispatchDriverUUID,
    });
    if (snapshot.size > 0) {
        const data = { ...req.body, update_datetime: new Date() };
        const { docID, docData } = getDataFromSnapshot(snapshot);
        if (data.application_status !== docData.application_status) {
            const isUpdated = await updateRecord(docID, data);
            if (isUpdated.status === 200) {
                const logPath = `${qulifiedleadDocPath.replace(":doc_uuid", docID)}/change_logs/${new Date().toISOString()}`;
                addLog(logPath, prospectData);
                res.status(200).json({ message: "Updated dispatch driver status" });
            } else {
                res.status(500).json(isUpdated.error);
            }
        }
    }
}

const checkIfLeadAlreadyPresentAsQualified = (phoneNumber, phone_country_code) => {
    const query = {
        key: "phone",
        operator: "==",
        value: phoneNumber,
        isMultiple: true,
        key2: "phone_country_code",
        operator2: "==",
        value2: phone_country_code
    };
    return getFirestoreRecord(qulifiedleadCollectionPath, query);
}

const updateRecord = async (docID, data) => {
    const docPath = qulifiedleadDocPath.replace(":doc_uuid", docID);
    const updateRecord = await updateFirestoreRecord(docPath, data);
    if (updateRecord && updateRecord.status === 200) {
        return { status: 200, error: null };
    } else {
        return { status: 500, error: updateRecord.error };
    }
}

const addLog = (logDocPath, data) => {
    const logVal = {
        previousStatus: data.previousStatus || '',
        currentStatus: data.application_status,
        updatedDateTime: new Date(),
        action: data.created_by
    };
    addFirestoreRecord(logDocPath, logVal);
}