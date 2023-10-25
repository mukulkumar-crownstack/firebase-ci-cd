const algoliasearch = require("algoliasearch");
const { algoliaIndex, algoliaClientKey } = require("../utils/constants");
const helper_functions = require("../utils/helper.functions");

const getENV = () => {
    const env = helper_functions.geENVName();
    return env;
}

const algoliaClient = algoliasearch.default(
    process.env.ALGOLIA_APPLICATION_ID,
    algoliaClientKey[getENV]
);

const algoliaQualifiedLeadIndex = algoliaClient.initIndex(algoliaIndex.qualified_lead[getENV]);

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
            if (record.update_datetime) {
                record.update_datetime = new Date(
                    record.update_datetime.toDate()
                ).valueOf();
            }
            if (record.session_date) {
                record.session_date = new Date(record.session_date.toDate()).valueOf();
            }
            await algoliaQualifiedLeadIndex.saveObject(record);
        }
    }
}