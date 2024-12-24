const admin = require("firebase-admin");
const moment = require("moment");

const helper_functions = require("../utils/helper.functions");
const { getFirestoreRecord, getFirestoreDocument, addFirestoreRecord, updateFirestoreRecord, deleteFirestoreRecord } = require("../models/firestore.model");
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

exports.getQualifiedLeadByPhone = async (req, res, next) => {
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

const removeUndefinedFields = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
};

exports.addQualifiedLead = async (req, res, next) => {
    const {
        phone,
        full_name,
        referred_by_name,
        referred_by_phone,
        source,
        pr_user_id,
        truora_flow_id,
        truora_flow_name,
        user_language,
        vehicles,
        vehicle_configuration,
        vehicle_capacity,
        calculate_vehicle_type,
        vehicle_subcategory,
        vehicle_subcategory_codes,
        vehicle_type_codes,
        email,
        session_time,
        vehicle_year,
        meeting_type,
        driver_type_code,
        pr_zone,
        pr_market,
        pr_zone_code,
        pr_operation_centres,
        assigned_datetime,
        contact_counter
    } = req.body;

    let phoneNumber = helper_functions.getPhoneFromPhoneNumber(phone);
    let sourceName = sourceData.find(s => s.code === source)?.code || 'facebook';

    const leadSnapshot = await getFirestoreRecord(qulifiedleadCollectionPath, {
        key: "phone",
        operator: "==",
        value: phoneNumber,
    });

    if (leadSnapshot.size === 0) {
        const qualifiedLeadSnapshot = await checkIfLeadAlreadyPresentAsQualified(phoneNumber, 'mx');
        if (qualifiedLeadSnapshot.size === 0) {
            let qualifiedLeadData = {
                full_name: full_name,
                company_name: full_name,
                phone: phoneNumber,
                prospect_uuid: helper_functions.generateUUID(),
                phone_country_code: "mx",
                created_datetime: new Date(),
                update_datetime: new Date(),
                user_language: user_language || "es",
                referred_by_name: referred_by_name || null,
                referred_by_phone: referred_by_phone || null,
                source: sourceName,
                pr_user_id: pr_user_id || 'unknown',
                last_status_update: new Date(),
                application_id: `PRD${Math.random().toString().substring(2, 9)}`,
                vehicles,
                vehicle_configuration,
                vehicle_capacity,
                calculate_vehicle_type,
                vehicle_subcategory,
                vehicle_subcategory_codes,
                vehicle_type_codes,
                assigned_datetime,
                email,
                session_time,
                vehicle_year,
                meeting_type,
                driver_type_code: driver_type_code || "cliente_independiente",
                application_type: driver_type_code || "cliente_independiente",
                pr_zone,
                pr_market,
                pr_zone_code,
                pr_operation_centres,
                contact_counter: contact_counter || 0
            };
    
            if (truora_flow_id) {
                qualifiedLeadData = {
                    ...qualifiedLeadData,
                    truora_flow_id: truora_flow_id,
                    truora_flow_name: truora_flow_name || null,
                    status: "prospect",
                    created_by: 'user',
                    driver_type_code: "cliente_independiente",
                    application_type: "cliente_independiente",
                    lead_status: "vehicle_info_check",
                    interview_status_code: "scheduled",
                    driver_user_uuid: helper_functions.generateUUID(),
                };
            } else {
                const currentDateTime = new Date();
                currentDateTime.setSeconds(currentDateTime.getSeconds() + 3);
                qualifiedLeadData = {
                    ...qualifiedLeadData,
                    vehicles,
                    vehicle_configuration,
                    vehicle_capacity,
                    calculate_vehicle_type,
                    vehicle_subcategory,
                    vehicle_subcategory_codes,
                    vehicle_type_codes,
                    email,
                    session_time,
                    assigned_datetime: currentDateTime,
                    status: "qualified",
                    vehicle_year,
                    meeting_type,
                    created_by: 'admin',
                    driver_type_code: driver_type_code || "cliente_independiente",
                    application_type: driver_type_code || "cliente_independiente",
                    pr_zone,
                    pr_market,
                    pr_zone_code,
                    pr_operation_centres,
                };
            }
    
            qualifiedLeadData['application_status'] = 'in_progress';
            qualifiedLeadData['interview_status_code'] = "scheduled";
            qualifiedLeadData['driver_uuid'] = qualifiedLeadData.prospect_uuid;
    
            if (qualifiedLeadData.driver_type_code === 'cliente_independiente') {
                qualifiedLeadData['lead_status'] = "vehicle_info_check";
                qualifiedLeadData['driver_user_uuid'] = qualifiedLeadData.prospect_uuid;
            } else {
                qualifiedLeadData.lead_status = "company_background_check";
                qualifiedLeadData['dispatch_driver_uuid'] = qualifiedLeadData.prospect_uuid;
            }
    
            qualifiedLeadData = removeUndefinedFields(qualifiedLeadData);
    
            const leadID = `${qualifiedLeadData.driver_type_code}_${qualifiedLeadData.phone_country_code}_${phoneNumber}`;
            const qualifiedLeadDocPath = qulifiedleadDocPath.replace(':lead_uuid', leadID);
    
            const addRecord = await addFirestoreRecord(qualifiedLeadDocPath, qualifiedLeadData);
            if (addRecord && addRecord.status === 200) {
                res.status(200).json({
                    message: "Lead added successfully to qualified leads",
                    status: qualifiedLeadData.status,
                    qualifiedLeadData: qualifiedLeadData,
                    is_available: true,
                    prospect_uuid: qualifiedLeadData.prospect_uuid,
                });
            } else {
                res.status(500).json(addRecord.error);
            }
        } else {
            res.status(409).json({ 
                message: `Lead already present with phone: +52 ${phoneNumber}`,
                status: 'qualified',
                is_available: false,
            });
        }
    } else {
        const { prospectID, prospectData } = getLeadFromSnapshot(leadSnapshot);
        const docPath = qulifiedleadDocPath.replace(":prospect_uuid", prospectID);
        if (prospectData?.created_by === 'admin') {
            res.status(200).json({
                message: "Lead already present",
                status: prospectData.status,
                is_avalabile: false
            });
        } else {
            const data = {
                created_datetime: new Date(),
                update_datetime: new Date(),
                truora_flow_name: truora_flow_name,
                truora_flow_id: truora_flow_id,
                created_by: prospectData?.created_by || 'user',
                last_status_update: new Date(),
            };
            if (prospectData.status === "prospect") {
                res.status(201).json({
                    message: "Lead already present with prospect status",
                    status: prospectData.status,
                    is_avalabile: false
                });
            } else if (prospectData.status === "rejected") {
                data.status = "prospect";
                const updateRecord = await updateFirestoreRecord(docPath, data);
                if (updateRecord && updateRecord.status === 200) {
                    res.status(200).json({
                        message:
                            "Lead already present with update from rejected to prospect status in firestore",
                        status: prospectData.status,
                        is_avalabile: false
                    });
                } else {
                    res.status(500).json(updateRecord.error);
                }
            } else if (prospectData.status === "qualified") {
                res.status(201).json({
                    message: "Lead already present with qualified status",
                    status: prospectData.status,
                    is_avalabile: false
                });
            } else if (prospectData.status === "lead") {
                res.status(201).json({
                    message: "Lead already present with lead status",
                    status: 'qualified',
                    is_avalabile: false
                });
            } else {
                const updateRecord = await updateFirestoreRecord(docPath, data);
                if (!prospectData.location) {
                    prospectData.status = 'prelead_without_location';
                }
                if (prospectData.location) {
                    prospectData.status = 'prelead_with_location';
                }
                if (prospectData.vehicle_type_codes) {
                    prospectData.status = 'prelead_with_vehicle_category';
                }
                if (prospectData.vehicle_subcategory_codes) {
                    prospectData.status = 'prelead_with_vehicle_type';
                }
                if (updateRecord && updateRecord.status === 200) {
                    res.status(200).json({
                        message:
                            "Lead already present with update from rejected to prospect status in firestore",
                        status: prospectData.status,
                        is_avalabile: false
                    });
                } else {
                    res.status(500).json(updateRecord.error);
                }
            }
        }
    }
};

exports.updateQualifiedLead = async (req, res, next) => {
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
        pr_user_id,
        driver_type_code,
        pr_zone,
        pr_market,
        pr_zone_code,
        pr_operation_centres,
        accepted_terms_condition
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
        const oldDocPath = qulifiedleadDocPath.replace(":lead_uuid", prospectID);

        let data = {
            ...prospectData,
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
            pr_user_id: pr_user_id || prospectData.pr_user_id || 'unknown',
            pr_zone_code: pr_zone_code || prospectData.pr_zone_code || null,
            pr_market: pr_market || prospectData.pr_market || null,
            pr_zone: pr_zone || prospectData.pr_zone || null,
            pr_operation_centres: pr_operation_centres || prospectData.pr_operation_centres || null,
            accepted_terms_condition: true,
        };

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

        if (driver_type_code && driver_type_code !== prospectData.driver_type_code) {
            data.driver_type_code = driver_type_code;
            data.application_type = driver_type_code;

            const newDocPath = qulifiedleadDocPath.replace(":lead_uuid", `${data.driver_type_code}_${prospectData.phone_country_code}_${phoneNumber}`);

            try {
                await addFirestoreRecord(newDocPath, data);

                await deleteFirestoreRecord(oldDocPath);

                res.status(200).json({ message: "Lead updated successfully with new driver_type_code" });
            } catch (error) {
                res.status(500).json({ error: "An error occurred while updating the document." });
            }
        } else {
            try {
                await updateFirestoreRecord(oldDocPath, data);
                res.status(200).json({ message: "Lead updated successfully without changing driver_type_code" });
            } catch (error) {
                res.status(500).json({ error: "An error occurred while updating the document." });
            }
        }

    } else {
        res.status(404).json({ message: "Lead not found in qualified leads collection." });
    }
};

exports.updateQualifiedLeadStatus = async (req, res, next) => {
    const { status, phone, is_fleet, created_by = 'user', driver_type_code } = req.body;
    let phoneNumber = helper_functions.getPhoneFromPhoneNumber(phone);

    let data = {
        status: status,
        phone: phoneNumber,
        update_datetime: new Date(),
        last_status_update: new Date(),
    };

    if (is_fleet?.toString() === "true") {
        data.driver_type_code = "flotilleros";
    } else {
        data.driver_type_code = "cliente_independiente";
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
        const oldDocPath = qulifiedleadDocPath.replace(":lead_uuid", prospectID);

        data = {
            ...prospectData,
            ...data,
            driver_type_code: data.driver_type_code,
            application_type: data.driver_type_code,
        };

        if (data.driver_type_code !== prospectData?.driver_type_code) {
            const newDocPath = qulifiedleadDocPath.replace(":lead_uuid", `${data.driver_type_code}_${prospectData.phone_country_code}_${phoneNumber}`);

            try {
                await addFirestoreRecord(newDocPath, data);
                await deleteFirestoreRecord(oldDocPath);

                res.status(200).json({ message: "Lead updated successfully with new driver_type_code" });
            } catch (error) {
                res.status(500).json({ error: "An error occurred while updating the document." });
            }
        } else {
            if (status === "rejected") {
                data["application_status"] = 'without_unit';
                data["status"] = 'rejected';
            }

            try {
                await updateFirestoreRecord(oldDocPath, data);
                res.status(200).json({ message: "Updated the Lead status successfully." });
            } catch (error) {
                res.status(500).json({ error: "An error occurred while updating the document." });
            }
        }
    } else {
        res.status(404).json({ message: "Lead not found in qualified leads collection." });
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
