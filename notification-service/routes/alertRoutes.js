const express = require("express");
const { getAlerts, markAlertAsRead } = require("../controllers/alertController");

const router = express.Router();

router.get("/alerts", getAlerts);
router.put("/alerts/:id/read", markAlertAsRead);

module.exports = router;
