const admin = require("firebase-admin");
const moment = require("moment");

const helper_functions = require("../utils/helper.functions");
const { getFirestoreRecord, addFirestoreRecord, updateFirestoreRecord } = require("../models/firestore.model");

const leadCollectionPath = "driver_lead/leads/prospects";
const leadDocPath = "driver_lead/leads/prospects/:prospect_uuid";
const qulifiedleadCollectionPath = "driver_lead";
const qulifiedleadDocPath = `driver_lead/:lead_uuid`;
const getLeadFromSnapshot = (snapshot) => ({
    prospectID: snapshot.docs[0].id,
    prospectData: snapshot.docs[0].data(),
});

exports.getProspectByPhone = async (req, res, next) => {
    const phoneNumber = req.params.phone;
    const snapshot = await getFirestoreRecord(leadCollectionPath, {
        key: "phone",
        operator: "==",
        value: phoneNumber,
    });
    if (snapshot.size > 0) {
        res.status(200).json({ isAvailable: false });
    } else {
        res.status(200).json({ isAvailable: true });
    }
};

exports.postProspect = async (req, res, next) => {
    const { phone, full_name, truora_flow_id, truora_flow_name } = req.body;
    let phoneNumber = helper_functions.getPhoneFromPhoneNumber(phone);
    const snapshot = await getFirestoreRecord(leadCollectionPath, {
        key: "phone",
        operator: "==",
        value: phoneNumber,
    });
    if (snapshot.size === 0) {
        const prospectData = {
            full_name: full_name,
            phone: phoneNumber,
            prospect_uuid: helper_functions.generateUUID(),
            phone_country_code: "mx",
            status: "prospect",
            created_datetime: new Date(),
            update_datetime: new Date(),
            user_language: "es",
            is_truora: true,
            created_by: "truora",
            truora_flow_id: truora_flow_id,
            truora_flow_name: truora_flow_name,
            last_status_update: new Date(),
            application_id: `PRD${Math.random().toString().substring(2, 9)}`,
        };
        const docPath = leadDocPath.replace(
            ":prospect_uuid",
            prospectData.prospect_uuid
        );
        const addRecord = await addFirestoreRecord(docPath, prospectData);
        if (addRecord && addRecord.status === 200) {
            res.status(200).json({
                message: "added the truora data",
                status: prospectData.status,
            });
        } else {
            res.status(500).json(addRecord.error);
        }
    } else {
        // const prospectID = snapshot.docs[0].id;
        const { prospectID, prospectData } = getLeadFromSnapshot(snapshot);
        const docPath = leadDocPath.replace(":prospect_uuid", prospectID);
        const data = {
            created_datetime: new Date(),
            update_datetime: new Date(),
            truora_flow_name: truora_flow_name,
            truora_flow_id: truora_flow_id,
            created_by: "truora",
            last_status_update: new Date(),
        };
        if (prospectData.status === "rejected") {
            data.status = "prospect";
            const updateRecord = await updateFirestoreRecord(docPath, data);
            if (updateRecord && updateRecord.status === 200) {
                res.status(200).json({
                    message:
                        "prospect already present with update from rejected to prospect status in firestore",
                    status: prospectData.status,
                });
            } else {
                res.status(500).json(updateRecord.error);
            }
        } else if (prospectData.status === "qualified") {
            res.status(201).json({
                message: "prospect already present with qualified status",
                status: prospectData.status,
            });
        } else {
            const updateRecord = await updateFirestoreRecord(docPath, data);
            if (updateRecord && updateRecord.status === 200) {
                res.status(200).json({
                    message:
                        "prospect already present with update from rejected to prospect status in firestore",
                    status: prospectData.status,
                });
            } else {
                res.status(500).json(updateRecord.error);
            }
        }
    }
};

exports.putProspect = async (req, res, next) => {
    const {
        full_name,
        vehicles,
        email,
        session_time,
        location,
        phone,
        status,
        vehicle_year,
        meeting_type,
        referred_by_name,
        referred_by_phone,
    } = req.body;
    let phoneNumber = helper_functions.getPhoneFromPhoneNumber(phone);

    const snapshot = await getFirestoreRecord(leadCollectionPath, {
        key: "phone",
        operator: "==",
        value: phoneNumber,
    });
    if (snapshot.size > 0) {
        const { prospectID, prospectData } = getLeadFromSnapshot(snapshot);
        const docPath = leadDocPath.replace(":prospect_uuid", prospectID);
        let zoneDetails = null;
        if (location) {
            zoneDetails = helper_functions.getZoneDetailsFromLocationName(location);
        }
        let data = {
            full_name: full_name || prospectData.full_name,
            vehicle_type_codes:
                (vehicles && [vehicles]) || prospectData.vehicle_type_codes || null,
            email: email || "",
            session_time: null,
            session_timestamp: null,
            update_datetime: new Date(),
            application_status: "in_progress",
            lead_status: "vehicle_info_check",
            interview_status_code: "scheduled",
            status: status || prospectData.status,
            meeting_type: meeting_type || prospectData.meeting_type || null,
            vehicle_year: vehicle_year || prospectData.vehicle_year || null,
            referred_by_name:
                referred_by_name || prospectData.referred_by_name || null,
            referred_by_phone:
                referred_by_phone || prospectData.referred_by_phone || null,
        };
        if (zoneDetails) {
            data = { ...data, ...zoneDetails };
        }
        if (session_time) {
            const t = moment()
                .add(1, "days")
                .hours(+session_time.split(":")[0])
                .minutes(0)
                .seconds(0)
                .format();
            data["session_time"] = session_time.split(":")[0];
            data["session_date"] = new Date(t);
            data["session_timestamp"] = moment.utc(t).format();
        }
        if (prospectData.driver_type_code !== "cliente_independiente") {
            data["company_name"] = data.full_name;
            data.lead_status = "company_background_check";
        }
        if (status && status !== prospectData.status) {
            data["last_status_update"] = new Date();
        }
        const updateRecord = await updateFirestoreRecord(docPath, data);
        if (updateRecord && updateRecord.status === 200) {
            res.status(200).json({ message: "updated the truora data" });
        } else {
            res.status(500).json(updateRecord.error);
        }
    }
};

exports.putProspectStatus = async (req, res, next) => {
    const { status, phone, is_fleet, rejection_reason } = req.body;
    let phoneNumber = helper_functions.getPhoneFromPhoneNumber(phone);
    const data = {
        status: status,
        phone: phoneNumber,
        update_datetime: new Date(),
        last_status_update: new Date(),
    };
    if (is_fleet == "true") {
        data.driver_type_code = "flotilleros";
    } else {
        data.driver_type_code = "cliente_independiente";
    }
    if (status === "rejected") {
        if (rejection_reason) {
            data["rejection_reason"] = +rejection_reason;
        } else {
            data["rejection_reason"] = 7;
        }
    }
    if (status === "pre_lead") {
        data["has_vehicle"] = true;
    }
    const snapshot = await getFirestoreRecord(leadCollectionPath, {
        key: "phone",
        operator: "==",
        value: phoneNumber,
    });
    if (snapshot.size > 0) {
        const { prospectID } = getLeadFromSnapshot(snapshot);
        const docPath = leadDocPath.replace(":prospect_uuid", prospectID);
        const updateRecord = await updateFirestoreRecord(docPath, data);
        if (updateRecord && updateRecord.status === 200) {
            res.status(200).json({ message: "updated the truora data" });
        } else {
            res.status(500).json(updateRecord.error);
        }
    }
};

exports.postProspectQualify = async (req, res, next) => {
    const { status, phone } = req.body;
    let phoneNumber = helper_functions.getPhoneFromPhoneNumber(phone);
    const data = {
        status: status,
        phone: phoneNumber,
        update_datetime: new Date(),
        last_status_update: new Date()
    };
    const snapshot = await getFirestoreRecord(leadCollectionPath, {
        key: "phone",
        operator: "==",
        value: phoneNumber,
    });
    if (snapshot.size > 0) {
        const { prospectID, prospectData } = getLeadFromSnapshot(snapshot);
        const leadDocumentPath = leadDocPath.replace(":prospect_uuid", prospectID);
        if (prospectData) {
            const query ={
                key: "phone",
                operator: "==",
                value: phoneNumber,
                isMultiple: true,
                key2: "phone_country_code",
                operator2: "==",
                value2: prospectData.phone_country_code
            };
            const snapshot = await getFirestoreRecord(qulifiedleadCollectionPath, query);
            if (snapshot.size === 0) {
                const leadID = `${prospectData.driver_type_code}_${prospectData.phone_country_code}_${phoneNumber}`;
                const qualifiedLeadDocPath = qulifiedleadDocPath.replace(':lead_uuid', leadID);
                const addRecord = await addFirestoreRecord(qualifiedLeadDocPath, prospectData);
                if (addRecord && addRecord.status === 200) {
                    // res.status(200).json({
                    //     message: "added the truora data",
                    //     status: prospectData.status,
                    // });
                } else {
                    res.status(500).json(addRecord.error);
                }
                const log1Path = `driver_lead/${leadID}/change_logs/${new Date().toISOString()}`;
                addLog(log1Path, "Show Interest");
                const log2Path = `driver_lead/${leadID}/change_logs/${new Date().toISOString()}`;
                const log2currentStatus = prospectData.lead_status.split("_").map((t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase()).join(" ");
                addLog(log2Path, log2currentStatus)
                const updateLeadRecord = await updateFirestoreRecord(leadDocumentPath, data);
                if (updateLeadRecord && updateLeadRecord.status === 200) {
                    res.status(200).json({ message: `added driver lead ${leadID} and updated the truora profile ${prospectID}`, });
                } else {
                    res.status(500).json(updateLeadRecord.error);
                }
            } else {
                const updateRecord = await updateFirestoreRecord(leadDocumentPath, data);
                if (updateRecord && updateRecord.status === 200) {
                    res.status(400).json({
                        message: `lead already present with phone: ${prospectData.phone_country_code}${phoneNumber}`,
                    });
                } else {
                    res.status(500).json(updateRecord.error);
                }
            }
        }
    }
};

const addLog = (logDocPath, currentStatus) => {
    const logVal = {
        previousStatus: "",
        currentStatus: currentStatus,
        updatedDateTime: new Date(),
        updatedBy: "Truora",
        action: "admin",
        notes: "",
    };
    addFirestoreRecord(logDocPath, logVal);
}