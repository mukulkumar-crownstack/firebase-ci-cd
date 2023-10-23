const express = require('express');

const router = express.Router();

const { getProspectByPhone, postProspect, putProspect, putProspectStatus, postProspectQualify } = require('../controllers/leads');

router.get('/prospects/:phone', getProspectByPhone);
router.post('/prospects/add', postProspect);
router.put('/prospects/add', putProspect);
router.put('/prospects/update', putProspectStatus);
router.post('/prospects/qualify', postProspectQualify);

module.exports = router;