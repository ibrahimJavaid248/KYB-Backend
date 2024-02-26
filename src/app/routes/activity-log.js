const express = require("express")
const activityRouter = express.Router()
const {getActivityLogs} = require("../controllers/activity-log")
const {authorizeUser} = require("../middleware/auth")


activityRouter.get("/get-logs",getActivityLogs)




module.exports = {activityRouter}