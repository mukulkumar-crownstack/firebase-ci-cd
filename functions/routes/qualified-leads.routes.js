const express = require('express');
const { postQualifiedDriver, putQualifiedDriver, putQualifiedDriverStatus, postQualifiedVehicle, putQualifiedVehicle, putQualifiedVehicleStatus } = require('../controllers/qualified-leads');

const router = express.Router();

router.post('/driver/add', postQualifiedDriver);
router.put('/driver/:uuid', putQualifiedDriver);
router.put('/driver/status/:uuid', putQualifiedDriverStatus);
router.post('/vehicle/add', postQualifiedVehicle);
router.put('/vehicle/:uuid', putQualifiedVehicle);
router.put('/vehicle/status/:uuid', putQualifiedVehicleStatus);

module.exports = router;