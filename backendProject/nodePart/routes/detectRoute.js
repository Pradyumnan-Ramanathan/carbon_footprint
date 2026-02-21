const express = require('express');
const multer = require('multer');
const { detect } = require('../controllers/detectController');
const { isAuthenticatedUser} = require("../middleware/auth");

const router = express.Router({ mergeParams: true });
const upload = multer({ dest: 'uploads/' });

// POST /detect
router.post('/', isAuthenticatedUser, upload.single('image'), detect);

module.exports = router;