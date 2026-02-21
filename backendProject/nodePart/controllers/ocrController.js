const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.performOCR = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const formData = new FormData();
        formData.append("file", fs.createReadStream(req.file.path));

        const endpoint = req.query.detect ? "detect_ocr" : "ocr";

        // Forward to Python API
        const pythonResponse = await axios.post(
            `http://localhost:8000/${endpoint}`,
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 60000,
            }
        );

        fs.unlinkSync(req.file.path);

        res.json(pythonResponse.data);
    } catch (error) {
        console.error("OCR error:", error.message);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: "OCR failed" });
    }
};
