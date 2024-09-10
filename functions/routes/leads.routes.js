const express = require('express');

const router = express.Router();

const { getQualifiedLeadByPhone, postQualifiedLead, putQualifiedLead, putQualifiedLeadStatus, manageQualifiedLead } = require('../controllers/leads');

router.get('/prospects/:phone', getQualifiedLeadByPhone);
router.post('/prospects/add', manageQualifiedLead);
router.put('/prospects/add', putQualifiedLead);
router.put('/prospects/update', putQualifiedLeadStatus);
router.post('/prospects/qualify', manageQualifiedLead);

module.exports = router;