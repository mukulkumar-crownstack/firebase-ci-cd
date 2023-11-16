const express = require('express');

const router = express.Router();

const { postMigrationsData, sendCollectionToAlgolia, postMigrationsFirestoreData, getMigrationsFirestoreData } = require('../controllers/migrations');

router.get('/firestore/:countryCode', getMigrationsFirestoreData);
router.post('/firestore', postMigrationsFirestoreData);
router.post('/migrated_data', postMigrationsData);
router.post('/algolia_migrations', sendCollectionToAlgolia);

module.exports = router;
