const express = require('express');

const router = express.Router();

const { postMigrationsData, sendCollectionToAlgolia } = require('../controllers/migrations');

router.post('/migrated_data', postMigrationsData);
router.post('/algolia_migrations', sendCollectionToAlgolia);

module.exports = router;
