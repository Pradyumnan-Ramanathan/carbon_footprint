const express = require('express');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const detectRouter = require("./routes/detectRoute");
const userRouter = require("./routes/userRoute");
const user = require('./models/user');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const app = express();

app.use(express.json());
app.use(cookieParser());

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

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongPassword123
 *     responses:
 *       201:
 *         description: User created and authenticated
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 *
 * /login:
 *   post:
 *     summary: Login an existing user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 *
 * /logout:
 *   get:
 *     summary: Logout the current user
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Logged out
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */


// Mount detect routes
app.use("/detect", detectRouter);

app.use("/",userRouter);

app.listen(5000, () => {
  console.log("Node server running at http://localhost:5000");
});
