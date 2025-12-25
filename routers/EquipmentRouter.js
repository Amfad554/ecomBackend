const express = require('express');
const { getAllEquipment } = require('../controllers/EquipmentController');
const router = express.Router();


router.get('/', getAllEquipment);

module.exports = router;