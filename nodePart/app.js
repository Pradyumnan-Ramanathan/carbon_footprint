const express = require('express');
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /detect:
 *   post:
 *     summary: Run YOLO object detection on an image
 *     description: Upload an image and get detected objects with bounding boxes
 *     tags:
 *       - Object Detection
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Detection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 detections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       class_id:
 *                         type: integer
 *                         example: 0
 *                       confidence:
 *                         type: number
 *                         format: float
 *                         example: 0.92
 *                       bbox:
 *                         type: array
 *                         items:
 *                           type: number
 *                         example: [120, 45, 340, 290]
 *       400:
 *         description: No image uploaded
 *       500:
 *         description: YOLO inference failed
 */


app.post("/detect", upload.single("image"), async (req, res) => {
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
        timeout: 60000, // YOLO can be slow on CPU
      }
    );

    // Clean temp file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      detections: yoloResponse.data.detections,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "YOLO inference failed" });
  }
});

app.listen(5000, () => {
  console.log("Node server running at http://localhost:5000");
});
