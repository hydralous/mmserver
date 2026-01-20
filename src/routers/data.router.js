const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data.controller');

router.get('/all', dataController.getAllData);
router.post('/', dataController.saveData);

module.exports = router; 