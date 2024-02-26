const express = require("express")
const userRouter = express.Router()
const user = require("../controllers/user")
const {authorizeUser} = require("../middleware/auth")
const logs = require('../middleware/activity-logs')

userRouter.get("/get-user",authorizeUser, user.getAlluser)
userRouter.post("/create-user",authorizeUser, user.createUser)
userRouter.patch("/change-password",authorizeUser, user.changePassword)
userRouter.patch("/change-status/:id",authorizeUser, user.changeStatus)



module.exports = {userRouter}