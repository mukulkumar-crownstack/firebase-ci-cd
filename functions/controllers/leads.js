const admin = require("firebase-admin");
const moment = require("moment");

const helper_functions = require("../utils/helper.functions");
const { getFirestoreRecord, getFirestoreDocument, addFirestoreRecord, updateFirestoreRecord } = require("../models/firestore.model");
const { sourceData, interviewers } = require("../utils/constants");

const leadCollectionPath = "driver_lead/leads/prospects";
const leadDocPath = "driver_lead/leads/prospects/:prospect_uuid";
const qulifiedleadCollectionPath = "driver_lead";
const qulifiedleadDocPath = `driver_lead/:lead_uuid`;
const vehicleTypesMetadata = "driver_lead_metadata/vehicle_types";
const getLeadFromSnapshot = (snapshot) => ({
    prospectID: snapshot.docs[0].id,
    prospectData: snapshot.docs[0].data(),
});

exports.getProspectByPhone = async (req, res, next) => {
    const phoneNumber = req.params.phone;
    const snapshot = await getFirestoreRecord(qulifiedleadCollectionPath, {
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
    const {
        phone,
        full_name,
        truora_flow_id,
        truora_flow_name,
        referred_by_name,
        referred_by_phone,
        created_by = "user",
        user_language,
        source,
        pr_user_id
    } = req.body;

    let phoneNumber = helper_functions.getPhoneFromPhoneNumber(phone);
    let sourceName = sourceData.find(s => s.code === source)?.code || 'facebook';

    const qualifiedLeadSnapshot = await checkIfLeadAlreadyPresentAsQualified(phoneNumber, 'mx');

    if (qualifiedLeadSnapshot.size === 0) {
        const prospectData = {
            full_name: full_name,
            company_name: full_name,
            phone: phoneNumber,
            prospect_uuid: helper_functions.generateUUID(),
            phone_country_code: "mx",
            status: "qualified",
            created_datetime: new Date(),
            update_datetime: new Date(),
            user_language: user_language || "es",
            created_by: created_by,
            truora_flow_id: truora_flow_id || null,
            truora_flow_name: truora_flow_name || null,
            last_status_update: new Date(),
            application_id: `PRD${Math.random().toString().substring(2, 9)}`,
            referred_by_name: referred_by_name || null,
            referred_by_phone: referred_by_phone || null,
            source: sourceName,
            pr_user_id: pr_user_id || 'unknown',
            driver_type_code: 'cliente_independiente',
            application_type: 'cliente_independiente',
            application_status: 'in_progress',
            lead_status: "vehicle_info_check",
            interview_status_code: "scheduled",
            driver_user_uuid: helper_functions.generateUUID(),
        };

        const leadID = `${prospectData.driver_type_code}_${prospectData.phone_country_code}_${phoneNumber}`;
        const qualifiedLeadDocPath = qulifiedleadDocPath.replace(':lead_uuid', leadID);

        const addRecord = await addFirestoreRecord(qualifiedLeadDocPath, prospectData);
        if (addRecord && addRecord.status === 200) {
            res.status(200).json({
                message: "Prospect added successfully to qualified leads",
                status: prospectData.status,
                is_available: true,
                prospect_uuid: prospectData.prospect_uuid
            });
        } else {
            res.status(500).json(addRecord.error);
        }
    } else {
        res.status(200).json({
            message: `Lead already present with phone: +52 ${phoneNumber}`,
            status: 'qualified',
            is_available: false
        });
    }
};

exports.putProspect = async (req, res, next) => {
    const {
        full_name,
        vehicles,
        vehicle_configuration,
        vehicle_capacity,
        calculate_vehicle_type,
        vehicle_subcategory,
        email,
        session_time,
        phone,
        status,
        vehicle_year,
        meeting_type,
        referred_by_name,
        referred_by_phone,
        source,
        created_by = 'user',
        pr_user_id,
        driver_type_code,
        pr_zone,
        pr_market,
        pr_zone_code,
        pr_operation_centres
    } = req.body;

    let phoneNumber = helper_functions.getPhoneFromPhoneNumber(phone);
    let vehicleCodes = vehicles ? vehicles.split(',') : [];
    let vehicleSubcategoryCode = vehicle_subcategory ? vehicle_subcategory.split(',') : [];

    const snapshot = await getFirestoreRecord(qulifiedleadCollectionPath, {
        key: "phone",
        operator: "==",
        value: phoneNumber,
    });

    if (snapshot.size > 0) {
        const { prospectID, prospectData } = getLeadFromSnapshot(snapshot);
        const docPath = qulifiedleadDocPath.replace(":lead_uuid", prospectID);

        let data = {
            full_name: full_name || prospectData.full_name,
            vehicle_type_codes: vehicleCodes.length > 0 ? vehicleCodes : prospectData.vehicle_type_codes || null,
            vehicle_subcategory_codes: vehicleSubcategoryCode.length > 0 ? vehicleSubcategoryCode : prospectData.vehicle_subcategory_codes || null,
            vehicle_configuration: vehicle_configuration || prospectData.vehicle_configuration || null,
            vehicle_capacity: vehicle_capacity || prospectData.vehicle_capacity || null,
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
            referred_by_name: referred_by_name || prospectData.referred_by_name || null,
            referred_by_phone: referred_by_phone || prospectData.referred_by_phone || null,
            source: source || prospectData.source,
            driver_type_code: driver_type_code || prospectData.driver_type_code || null,
            application_type: driver_type_code || prospectData.driver_type_code || null,
            pr_user_id: pr_user_id || prospectData.pr_user_id || 'unknown',
        };

        if (pr_zone_code) data.pr_zone_code = pr_zone_code;
        if (pr_market) data.pr_market = pr_market;
        if (pr_zone) data.pr_zone = pr_zone;
        if (pr_operation_centres) data.pr_operation_centres = pr_operation_centres;

        if (calculate_vehicle_type) {
            const vehicleTypesCodes = await getFirestoreDocument(vehicleTypesMetadata);
            const vehicleCategory = vehicleTypesCodes[data.vehicle_type_codes[0]];
            if (vehicleCategory) {
                const vehicleConfig = vehicleCategory[data.vehicle_configuration];
                if (vehicleConfig && data.vehicle_capacity) {
                    const unit = vehicleConfig.units.find(u => u.capacity.includes(data.vehicle_capacity));
                    if (unit) {
                        data.vehicle_subcategory_codes = [unit['vehicle_type_codes']];
                    }
                }
            }
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

        if (prospectData.source === 'referidos' && source && source !== prospectData.source) {
            data.referred_by_name = '';
            data.referred_by_phone = '';
        }

        const updateRecord = await updateFirestoreRecord(docPath, data);
        if (updateRecord && updateRecord.status === 200) {
            res.status(200).json({ message: "updated the truora data" });
        } else {
            res.status(500).json(updateRecord.error);
        }
    } else {
        res.status(404).json({ message: "Prospect not found in qualified leads collection." });
    }
};

exports.putProspectStatus = async (req, res, next) => {
    const { status, phone, is_fleet, rejection_reason, created_by = 'user' } = req.body;
    let phoneNumber = helper_functions.getPhoneFromPhoneNumber(phone);

    const data = {
        status: status,
        phone: phoneNumber,
        update_datetime: new Date(),
        last_status_update: new Date(),
    };

    if (is_fleet.toString() === "true") {
        data.driver_type_code = "flotilleros";
    } else {
        data.driver_type_code = "cliente_independiente";
    }

    if (status === "rejected") {
        data["rejection_reason"] = rejection_reason ? +rejection_reason : 7;
    }

    if (status === "pre_lead") {
        data["has_vehicle"] = true;
    }

    const snapshot = await getFirestoreRecord(qulifiedleadCollectionPath, {
        key: "phone",
        operator: "==",
        value: phoneNumber,
    });

    if (snapshot.size > 0) {
        const { prospectID, prospectData } = getLeadFromSnapshot(snapshot);
        const docPath = qulifiedleadDocPath.replace(":lead_uuid", prospectID);

        const updateRecord = await updateFirestoreRecord(docPath, data);

        if (updateRecord && updateRecord.status === 200) {
            res.status(200).json({ message: "Updated the prospect status successfully." });
        } else {
            res.status(500).json(updateRecord.error);
        }
    } else {
        res.status(404).json({ message: "Prospect not found in qualified leads collection." });
    }
};

exports.postProspectQualify = async (req, res, next) => {
    const { status, phone, created_by = "user" } = req.body;
    let phoneNumber = helper_functions.getPhoneFromPhoneNumber(phone);

    const data = {
        status: status,
        phone: phoneNumber,
        update_datetime: new Date(),
        last_status_update: new Date(),
    };

    const snapshot = await getFirestoreRecord(qulifiedleadCollectionPath, {
        key: "phone",
        operator: "==",
        value: phoneNumber,
    });

    if (snapshot.size > 0) {
        const { prospectID, prospectData } = getLeadFromSnapshot(snapshot);
        const qualifiedLeadDocumentPath = qulifiedleadDocPath.replace(":lead_uuid", prospectID);

        if (prospectData) {
            const existingQualifiedLeadSnapshot = await checkIfLeadAlreadyPresentAsQualified(phoneNumber, 'mx');
            
            if (existingQualifiedLeadSnapshot.size === 0) {
                prospectData['driver_uuid'] = prospectData.prospect_uuid;
                prospectData['application_status'] = 'in_progress';
                prospectData['application_type'] = prospectData?.driver_type_code;
                prospectData['interview_status_code'] = "scheduled";

                if (prospectData.driver_type_code === 'cliente_independiente') {
                    prospectData['lead_status'] = "vehicle_info_check";
                    prospectData['driver_user_uuid'] = prospectData.prospect_uuid;
                } else {
                    prospectData.lead_status = "company_background_check";
                    prospectData['dispatch_driver_uuid'] = prospectData.prospect_uuid;
                }

                const leadID = `${prospectData.driver_type_code}_${prospectData.phone_country_code}_${phoneNumber}`;
                const qualifiedLeadDocPath = qulifiedleadDocPath.replace(':lead_uuid', leadID);

                const addRecord = await addFirestoreRecord(qualifiedLeadDocPath, prospectData);
                if (addRecord && addRecord.status === 200) {
                    const updateLeadRecord = await updateFirestoreRecord(qualifiedLeadDocumentPath, data);
                    if (updateLeadRecord && updateLeadRecord.status === 200) {
                        res.status(200).json({ message: `Added driver lead ${leadID} and updated the truora profile ${prospectID}` });
                    } else {
                        res.status(500).json(updateLeadRecord.error);
                    }
                } else {
                    res.status(500).json(addRecord.error);
                }
            } else {
                const updateRecord = await updateFirestoreRecord(qualifiedLeadDocumentPath, data);
                if (updateRecord && updateRecord.status === 200) {
                    res.status(400).json({
                        message: `Lead already present with phone: ${prospectData.phone_country_code}${phoneNumber}`,
                    });
                } else {
                    res.status(500).json(updateRecord.error);
                }
            }
        }
    } else {
        res.status(404).json({ message: "Prospect not found in qualified leads collection." });
    }
};

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
