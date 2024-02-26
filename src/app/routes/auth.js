const express = require("express")
const authRouter = express.Router()
const auth = require("../controllers/auth")
// const {authorizeUser} = require("../middleware/auth")

authRouter.post("/login", auth.login)
authRouter.get("/logout",auth.logout)
authRouter.post("/forgot-password",auth.forgetPassword) 
authRouter.patch("/set-password",auth.setPassword) 

module.exports = {authRouter}