const admin = require("firebase-admin");
const { getFirestoreRecord, addFirestoreRecord, updateFirestoreRecord } = require("../models/firestore.model");
const { ApplicationStatus, Driver_Type_Code } = require("../utils/enums");
const { generateUUID } = require("../utils/helper.functions");
const helper_functions = require("../utils/helper.functions");
const { interviewers } = require("../utils/constants");
const qulifiedleadCollectionPath = "driver_lead";
const qulifiedleadDocPath = `driver_lead/:doc_uuid`;
const getDataFromSnapshot = (snapshot) => ({
    docID: snapshot.docs[0].id,
    docData: snapshot.docs[0].data(),
});

exports.postQualifiedDriver = async (req, res, next) => {
    try {
        const {
            phone,
            phone_country_code,
            full_name,
            created_by,
            pr_user_id,
            dispatch_company_uuid,
            company_name,
            contact_counter,
            vehicle_subcategory_codes,
            vehicle_type_codes,
            license_plate
        } = req.body;

        // Check if the lead already exists as a qualified driver
        const qualifiedLeadSnapshot = await checkIfLeadAlreadyPresentAsQualified(phone, 'mx');
        if (qualifiedLeadSnapshot.size > 0) {
            return res.status(200).json({
                message: "Phone number already present",
                status: qualifiedLeadSnapshot.docs[0].data().application_status,
                is_available: false
            });
        }

        const dispatchDriverUUID = generateUUID();
        const currentDateTime = new Date();
        currentDateTime.setSeconds(currentDateTime.getSeconds() + 3);

        // Construct prospect data
        const prospectData = {
            full_name,
            company_name,
            phone,
            phone_country_code,
            application_status: ApplicationStatus.IN_PROGRESS,
            created_datetime: new Date(),
            update_datetime: new Date(),
            created_by,
            dispatch_company_uuid,
            dispatch_driver_uuid: dispatchDriverUUID,
            application_type: 'driver',
            how_many_drivers: 1,
            pr_user_id,
            assigned_datetime: currentDateTime,
            contact_counter: contact_counter || 0
        };

        // Assign optional vehicle properties if present
        if (vehicle_subcategory_codes) prospectData.vehicle_subcategory_codes = vehicle_subcategory_codes;
        if (vehicle_type_codes) prospectData.vehicle_type_codes = vehicle_type_codes;
        if (license_plate) prospectData.license_plate = license_plate;

        // Generate document path
        const dispatchDriverDOCID = `driver_${prospectData.phone_country_code}_${dispatchDriverUUID}_${dispatch_company_uuid}`;
        const docPath = qulifiedleadDocPath.replace(":doc_uuid", dispatchDriverDOCID);

        // Add prospect data to Firestore
        const addRecord = await addFirestoreRecord(docPath, prospectData);
        if (!addRecord || addRecord.status !== 200) {
            return res.status(500).json({ error: "Failed to add dispatch company driver" });
        }

        let vehicleData = null;
        let vehicleCount = 0;

        // Handle vehicle information if provided
        if (vehicle_subcategory_codes && vehicle_type_codes && license_plate) {
            vehicleCount = Array.isArray(vehicle_subcategory_codes) 
                ? vehicle_subcategory_codes.length 
                : 1;

            const vehicles = Array.isArray(vehicle_subcategory_codes) 
                ? vehicle_subcategory_codes.map((subcategory, index) => ({
                    code: helper_functions.generateUUID(),
                    license_plate: Array.isArray(license_plate) ? license_plate[index] : license_plate,
                    manufacturer: null,
                    model: null,
                    name: `Vehicle ${index + 1} Info`,
                    vehicle_back_proof: null,
                    vehicle_left_side_proof: null,
                    vehicle_type: subcategory,
                    year: null,
                    images: []
                }))
                : [{
                    code: helper_functions.generateUUID(),
                    license_plate,
                    manufacturer: null,
                    model: null,
                    name: "Vehicle 1 Info",
                    vehicle_back_proof: null,
                    vehicle_left_side_proof: null,
                    vehicle_type: vehicle_subcategory_codes,
                    year: null,
                    images: []
                }];

            // Save each vehicle in Firestore
            for (const vehicle of vehicles) {
                const vehicleDocPath = `${docPath}/vehicle_info/${vehicle.code}`;
                const addVehicleRecord = await addFirestoreRecord(vehicleDocPath, vehicle);
                if (!addVehicleRecord || addVehicleRecord.status !== 200) {
                    return res.status(500).json({ error: "Failed to add vehicle info" });
                }
            }

            vehicleData = vehicles;
        }

        // Update the lead record with vehicle count if vehicles exist
        if (vehicleCount > 0) {
            const updateLeadData = { how_many_vehicles: vehicleCount };
            const updateLeadRecord = await updateFirestoreRecord(docPath, updateLeadData);
            if (!updateLeadRecord || updateLeadRecord.status !== 200) {
                return res.status(500).json({ error: "Failed to update lead with vehicle count" });
            }
        } else {
            const updateLeadData = { how_many_vehicles: 0 };
            const updateLeadRecord = await updateFirestoreRecord(docPath, updateLeadData);
            if (!updateLeadRecord || updateLeadRecord.status !== 200) {
                return res.status(500).json({ error: "Failed to update lead with vehicle count" });
            }
        }

        return res.status(200).json({
            message: "Added dispatch company driver",
            dispatch_driver_uuid: prospectData.dispatch_driver_uuid,
            status: prospectData.application_status,
            is_available: true,
            qualifiedLeadData: prospectData,
            vehicleData,
            prospect_uuid: prospectData.dispatch_company_uuid,
        });
    } catch (error) {
        console.error("Error in postQualifiedDriver:", error);
        return res.status(500).json({ error: "Internal server error" });
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
        if (data.phone && data.phone !== docData.phone) {
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
    const documentUUID = req.params.uuid;
    const { driver_type_code } = req.body;
    const snapshot = await getFirestoreRecord(qulifiedleadCollectionPath, {
        key: driver_type_code === 'cliente_independiente' ? "driver_uuid" :"dispatch_driver_uuid",
        operator: "==",
        value: documentUUID,
    });
    if (snapshot.size > 0) {
        const data = { ...req.body, update_datetime: new Date() };
        const { docID, docData } = getDataFromSnapshot(snapshot);
        if (data.application_status !== docData.application_status) {
            const isUpdated = await updateRecord(docID, data);
            if (isUpdated.status === 200) {
                // const logPath = `${qulifiedleadDocPath.replace(":doc_uuid", docID)}/change_logs/${new Date().toISOString()}`;
                // docData['previousStatus'] = docData.application_status;
                // docData['application_status'] = data.application_status;
                // docData['updated_by'] = data.updated_by;
                // addLog(logPath, docData);
                res.status(200).json({ message: "Updated dispatch driver status successfully." });
            } else {
                res.status(500).json(isUpdated.error);
            }
        } else {
            res.status(500).json({ message: "no change in status provided" });
        }
    }
}

exports.postQualifiedVehicle = async (req, res, next) => {
    const {
        created_by,
        pr_user_id,
        full_name,
        dispatch_company_uuid,
        dispatch_company_id,
        driver_uuid,
        driver_id,
        driver_type,
        vehicle_type,
        vehicle_type_id,
        updated_by,
        license_plate,
        contact_counter
    } = req.body;
    const vehicleUUID = generateUUID();
    const currentDateTime = new Date();
    currentDateTime.setSeconds(currentDateTime.getSeconds() + 3);
    const vehicleData = {
        full_name: full_name,
        phone_country_code: "mx",
        application_status: ApplicationStatus.IN_PROGRESS,
        created_datetime: new Date(),
        update_datetime: new Date(),
        created_by: created_by,
        dispatch_company_uuid: dispatch_company_uuid,
        dispatch_company_id: dispatch_company_id,
        driver_user_uuid: driver_uuid,
        driver_id: driver_id,
        vehicle_uuid: vehicleUUID,
        application_type: 'vehicle',
        how_many_vehicles: 1,
        driver_type_code: driver_type == 1 ? Driver_Type_Code.cliente_independiente : Driver_Type_Code.flotilleros,
        vehicle_subcategory_codes: vehicle_type,
        vehicle_type_id: vehicle_type_id,
        driver_user_type_id: driver_type,
        pr_user_id: pr_user_id,
        assigned_datetime: currentDateTime,
        license_plate: license_plate,
        contact_counter: contact_counter || 0
    };
    // vehicleData['interviewer_details'] = interviewers.find(i => i.pr_user_id === +pr_user_id);
    const dispatchDriverDOCID = `vehicle_${vehicleData.phone_country_code}_${vehicleUUID}_${dispatch_company_uuid ? dispatch_company_uuid : driver_uuid}`;
    const docPath = qulifiedleadDocPath.replace(
        ":doc_uuid",
        dispatchDriverDOCID
    );
    const addRecord = await addFirestoreRecord(docPath, vehicleData);
    if (addRecord && addRecord.status === 200) {
        vehicleData['updated_by'] = updated_by;
        // const logPath = `${docPath}/change_logs/${new Date().toISOString()}`;
        const vehicleDocPath = `${docPath}/vehicle_info/${vehicleUUID}`;
        const data = {
            code: vehicleUUID,
            license_plate: license_plate,
            manufacturer: null,
            model: null,
            name: 'Vehicle 1 Info',
            vehicle_back_proof: null,
            vehicle_left_side_proof: null,
            vehicle_type: vehicle_type,
            year: null,
            images: []
        }
        addFirestoreRecord(vehicleDocPath, data);
        // addLog(logPath, vehicleData);
        res.status(200).json({
            message: "added vehicle driver",
            status: vehicleData.status,
            vehicleData: vehicleData
        });
    } else {
        res.status(500).json(addRecord.error);
    }
};

exports.putQualifiedVehicle = async (req, res, next) => {
    const vehicleUUID = req.params.uuid;
    const snapshot = await getFirestoreRecord(qulifiedleadCollectionPath, {
        key: "vehicle_uuid",
        operator: "==",
        value: vehicleUUID,
    });
    if (snapshot.size > 0) {
        const data = { ...req.body, update_datetime: new Date() };
        const { docID, docData } = getDataFromSnapshot(snapshot);
        const isUpdated = await updateRecord(docID, data);
        if (isUpdated.status === 200) {
            // const logPath = `${qulifiedleadDocPath.replace(":doc_uuid", docID)}/change_logs/${new Date().toISOString()}`;
            // if (data.application_status && data.application_status != docData.application_status) {
            //     docData['previousStatus'] = docData.application_status;
            //     docData['application_status'] = data.application_status;
            // } else delete docData['application_status'];
            // docData['updated_by'] = data.updated_by;
            // addLog(logPath, docData);
            res.status(200).json({ message: "Updated vehicle details" });
        } else {
            res.status(500).json(isUpdated.error);
        }
    }
}

exports.putQualifiedVehicleStatus = async (req, res, next) => {
    const vehicleUUID = req.params.uuid;
    const snapshot = await getFirestoreRecord(qulifiedleadCollectionPath, {
        key: "vehicle_uuid",
        operator: "==",
        value: vehicleUUID,
    });
    if (snapshot.size > 0) {
        const data = { ...req.body, update_datetime: new Date() };
        const { docID, docData } = getDataFromSnapshot(snapshot);
        if (data.application_status !== docData.application_status) {
            const isUpdated = await updateRecord(docID, data);
            if (isUpdated.status === 200) {
                // const logPath = `${qulifiedleadDocPath.replace(":doc_uuid", docID)}/change_logs/${new Date().toISOString()}`;
                // if (data.application_status && data.application_status != docData.application_status) {
                //     docData['previousStatus'] = docData.application_status;
                //     docData['application_status'] = data.application_status;
                // } else delete docData['application_status'];
                // docData['updated_by'] = data.updated_by;
                // addLog(logPath, docData);
                res.status(200).json({ message: "Updated vehicle status successfully." });
            } else {
                res.status(500).json(isUpdated.error);
            }
        } else {
            res.status(500).json({ message: "no change in status provided" });
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

// const addLog = (logDocPath, data) => {
//     const logVal = {
//         previousStatus: data.previousStatus || '',
//         currentStatus: data.application_status || '',
//         updatedDateTime: new Date(),
//         action: data.created_by,
//         updatedBy: data.updated_by
//     };
//     addFirestoreRecord(logDocPath, logVal);
// }