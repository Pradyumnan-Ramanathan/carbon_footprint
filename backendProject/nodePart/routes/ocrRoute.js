const express = require('express');
const multer = require('multer');
const { performOCR } = require('../controllers/ocrController');
const { isAuthenticatedUser } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });
const upload = multer({ dest: 'uploads/' });

// POST /ocr?detect=true|false
router.post('/', isAuthenticatedUser, upload.single('image'), performOCR);

module.exports = router;
