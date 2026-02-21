const History = require("../models/history");

exports.getHistory = async (req, res) => {
    try {
        // Find history for the logged-in user and sort by newest first
        const history = await History.find({ user_id: req.user._id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            history
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ success: false, error: "Failed to fetch prediction history" });
    }
};
