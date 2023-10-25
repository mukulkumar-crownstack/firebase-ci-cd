const { saveDocumentInAlgolia } = require("../models/algolia.model");

exports.addLead_f = async (change, context) => {
    await saveDocumentInAlgolia(change)
};