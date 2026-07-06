const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.estimateDepth = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const formData = new FormData();
        formData.append("file", fs.createReadStream(req.file.path));

        // Forward to Python API
        const pythonResponse = await axios.post(
            "http://localhost:8000/depth",
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 180000,
            }
        );

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        res.json(pythonResponse.data);
    } catch (error) {
        console.error("Depth estimation error:", error.message);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.json({ error: "Depth estimation unavailable." });
    }
};
