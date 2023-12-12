const express = require('express');
const { postQualifiedDriver, putQualifiedDriver, putQualifiedDriverStatus } = require('../controllers/qualified-leads');

const router = express.Router();

router.post('/driver/add', postQualifiedDriver);
router.put('/driver/:uuid', putQualifiedDriver);
router.put('/driver/status/:uuid', putQualifiedDriverStatus);

module.exports = router;