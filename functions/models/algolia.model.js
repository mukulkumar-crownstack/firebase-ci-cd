const algoliasearch = require("algoliasearch");
const { algoliaIndex, algoliaClientKey } = require("../utils/constants");
const helper_functions = require("../utils/helper.functions");

const ALGOLIA_APPLICATION_ID = 'OD87HIQS3D';

const getENV = () => {
    const env = helper_functions.geENVName();
    return env;
}

const ALGOLIA_API_KEY = algoliaClientKey.staging;

const algoliaClient = algoliasearch.default(
    ALGOLIA_APPLICATION_ID,
    ALGOLIA_API_KEY
);

const algoliaQualifiedLeadIndex = algoliaClient.initIndex(algoliaIndex.qualified_lead.staging);

exports.deleteDocumentFromAlgolia = async (snapshot) => {
    if (snapshot.exists) {
        const objectID = snapshot.id;
        await algoliaQualifiedLeadIndex.deleteObject(objectID);
    }
}

exports.saveDocumentInAlgolia = async (snapshot) => {
    if (snapshot.exists) {
        const record = snapshot.data();
        if (record) {
            record.objectID = snapshot.id;
            if (record.created_datetime) {
                record.created_datetime = new Date(
                    record.created_datetime.toDate()
                ).valueOf();
            }
            if (record.assigned_datetime) {
                record.assigned_datetime = new Date(
                    record.assigned_datetime.toDate()
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
            console.log(record.phone, algoliaIndex.qualified_lead.staging, ALGOLIA_API_KEY)
            await algoliaQualifiedLeadIndex.saveObject(record);
        }
    }
}
