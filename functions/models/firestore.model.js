const admin = require("firebase-admin");

exports.getFirestoreDocument = async (docPath) => {
    try {
        const snapshot = await admin.firestore().doc(docPath).get();
        return snapshot.exists ? snapshot.data() : null;
    } catch (err) {
        console.error("Error getting document:", err.message);
        return null;
    }
};

exports.getFirestoreRecord = (collectionsPath, query) => {
    const { key, operator, value, isMultiple = false } = query;
    let ref = admin.firestore().collection(collectionsPath).where(key, operator, value);
    if (isMultiple && query.key2 && query.operator2 && query.value2) {
        ref = ref.where(query.key2, query.operator2, query.value2);
    }
    return ref.limit(1).get().then((snapshot) => snapshot);
};

exports.addFirestoreRecord = (docPath, data) => {
    return admin.firestore().doc(docPath).set(data).then(() => {
        return { status: 200, error: "" };
    }).catch((err) => {
        console.error("Error adding document:", err.message);
        return { status: 500, error: err.message };
    });
};

exports.updateFirestoreRecord = (docPath, data) => {
    return admin.firestore().doc(docPath).update(data).then(() => {
        return { status: 200, error: "" };
    }).catch((err) => {
        console.error("Error updating document:", err.message);
        return { status: 500, error: err.message };
    });
};