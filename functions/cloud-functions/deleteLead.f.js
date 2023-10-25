const { deleteDocumentFromAlgolia } = require("../models/algolia.model");

exports.deleteLead_f = async (change, context) => {
    await deleteDocumentFromAlgolia(change)
};