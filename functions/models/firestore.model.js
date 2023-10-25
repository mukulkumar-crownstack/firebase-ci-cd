const admin = require("firebase-admin");

exports.getFirestoreRecord = (collectionsPath, query) => {
    const { key, operator, value, isMultiple = false } = query;
    const ref = admin.firestore().collection(collectionsPath).where(key, operator, value)
    if (isMultiple) {
        ref.where(query.key2, query.operator2, query.value2)
    }
    return ref.limit(1).get().then((snapshot) => snapshot);
};

exports.addFirestoreRecord = (docPath, data) => {
    return admin.firestore().doc(docPath).set(data).then((firebaseRes) => {
        return { status: 200, error: "" };
    }).catch((err) => {
        console.log(err);
        return { status: 500, error: err };
    });
};

exports.updateFirestoreRecord = (docPath, data) => {
    return admin.firestore().doc(docPath).update(data).then((firebaseRes) => {
        return { status: 200, error: "" };
    }).catch((err) => {
        return { status: 500, error: err };
    });
};