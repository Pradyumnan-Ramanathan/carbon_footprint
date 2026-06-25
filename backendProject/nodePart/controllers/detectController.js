const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const crypto = require("crypto");
const History = require("../models/history");
const Carbon = require("../models/carbon");

exports.detect = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No image uploaded" });
		}

		const formData = new FormData();
		formData.append("file", fs.createReadStream(req.file.path));

		const detectionResponse = await axios.post(
			"http://localhost:8000/detect",
			formData,
			{
				headers: formData.getHeaders(),
				timeout: 60000,
			}
		);

		fs.unlinkSync(req.file.path);

		const detections = detectionResponse.data.detections;
		const prediction_id = crypto.randomUUID();

		// Apply database overrides and format labels
		let totalFootprint = 0;
		for (let d of detections) {
			if (d.name) {
				const carbonDb = await Carbon.findOne({
					title: { $regex: new RegExp(`^${d.name.trim()}$`, "i") }
				});

				if (carbonDb) {
					console.log(`DB Override found for "${d.name}": VLM footprint = ${d.carbon_footprint}, DB footprint = ${carbonDb.footprint}`);
					d.carbon_footprint = carbonDb.footprint;
					d.footprint_explanation = "Using verified database value.";
				}
			}
			const footprintVal = d.carbon_footprint !== undefined ? d.carbon_footprint : 0;
			d.label = `${d.name || "Unknown Item"} (CO2e: ${footprintVal.toFixed(2)} kg)`;
			totalFootprint += footprintVal;
		}

		// Create a basic summary result object (Dashboard expects result.prediction and result.probability)
		const latestRisk = detections.length > 0 ? 1 : 0;
		const highestConf = detections.length > 0 ? Math.max(...detections.map(d => d.confidence)) : 0;

		await History.create({
			user_id: req.user._id,
			prediction_id: prediction_id,
			prediction: detections,
			result: {
				prediction: latestRisk,
				probability: highestConf,
				total_footprint: totalFootprint
			}
		});

		res.json({
			success: true,
			detections: detections,
		});
	} catch (error) {
		console.error(error.message);
		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
		}
		res.status(500).json({ error: "Object detection failed" });
	}
};
