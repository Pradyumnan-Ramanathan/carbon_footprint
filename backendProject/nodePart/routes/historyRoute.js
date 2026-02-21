const express = require('express');
const { getHistory } = require('../controllers/historyController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();

// GET /api/predict/history
router.get('/history', isAuthenticatedUser, getHistory);

module.exports = router;
