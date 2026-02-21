const express = require('express');
const multer = require('multer');
const { estimateDepth } = require('../controllers/depthController');
const { isAuthenticatedUser } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });
const upload = multer({ dest: 'uploads/' });

// POST /depth
router.post('/', isAuthenticatedUser, upload.single('image'), estimateDepth);

module.exports = router;
