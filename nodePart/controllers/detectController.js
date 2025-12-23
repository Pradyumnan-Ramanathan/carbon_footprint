const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.detect = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No image uploaded" });
		}

		const formData = new FormData();
		formData.append("file", fs.createReadStream(req.file.path));

		const yoloResponse = await axios.post(
			"http://localhost:8000/detect",
			formData,
			{
				headers: formData.getHeaders(),
				timeout: 60000,
			}
		);

		fs.unlinkSync(req.file.path);

		res.json({
			success: true,
			detections: yoloResponse.data.detections,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: "YOLO inference failed" });
	}
};
