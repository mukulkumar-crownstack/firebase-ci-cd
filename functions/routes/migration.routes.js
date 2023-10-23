const express = require('express');

const router = express.Router();

const { postMigrationsData } = require('../controllers/migrations');

router.post('/migrated_data', postMigrationsData);

module.exports = router;
