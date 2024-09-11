const express = require('express');

const router = express.Router();

const { getQualifiedLeadByPhone, updateQualifiedLead, updateQualifiedLeadStatus, addQualifiedLead } = require('../controllers/leads');

router.get('/prospects/:phone', getQualifiedLeadByPhone);
router.post('/prospects/add', addQualifiedLead);
router.put('/prospects/add', updateQualifiedLead);
router.put('/prospects/update', updateQualifiedLeadStatus);
router.post('/prospects/qualify', addQualifiedLead);

module.exports = router;