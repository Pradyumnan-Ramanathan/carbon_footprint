const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const crypto = require("crypto");
const History = require("../models/history");

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

		const detections = yoloResponse.data.detections;
		const prediction_id = crypto.randomUUID();

		// Create a basic summary result object (Dashboard expects result.prediction and result.probability)
		const latestRisk = detections.length > 0 ? 1 : 0;
		const highestConf = detections.length > 0 ? Math.max(...detections.map(d => d.confidence)) : 0;

		await History.create({
			user_id: req.user._id,
			prediction_id: prediction_id,
			prediction: detections,
			result: {
				prediction: latestRisk,
				probability: highestConf
			}
		});

		res.json({
			success: true,
			detections: detections,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: "YOLO inference failed" });
	}
};
