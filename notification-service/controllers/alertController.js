const { Alert } = require("../models/alertModel");

// Get all system alerts
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    return res.json({ alerts });
  } catch (error) {
    console.error("Get alerts failed:", error.message);
    return res.status(500).json({ message: "failed to fetch alerts" });
  }
};

// Mark alert as read
const markAlertAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const alert = await Alert.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!alert) {
      return res.status(404).json({ message: "alert not found" });
    }
    return res.json({ alert });
  } catch (error) {
    console.error("Mark alert read failed:", error.message);
    return res.status(500).json({ message: "failed to update alert" });
  }
};

module.exports = { getAlerts, markAlertAsRead };
