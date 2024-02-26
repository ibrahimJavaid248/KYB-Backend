const express = require("express")
require("dotenv").config({path: './.env'})

const {authRouter} = require("./app/routes/auth")
// const {usersRouter} = require("./app/routes/userRoutes")
const {userRouter} = require("./app/routes/user")
const {sourceRouter} = require("./app/routes/source-listing")
const {activityRouter} = require('./app/routes/activity-log')
const {countryRouter} = require('./app/routes/dasboardRoutes')
const {historyRouter} = require('./app/routes/history')



const cors = require('cors')

const app = express()
app.use(express.json())
// app.use(cors())
app.use(cors({ origin: true, credentials: true })); //setting cors and all the origins true
app.use(express.urlencoded({ extended: true }))
app.use("/api/auth",authRouter)
// app.use(authorizeUser,logs.activityLogDetails)
app.use("/api/user",userRouter)
app.use("/api/source",sourceRouter)
app.use("/api/activity",activityRouter)
app.use("/api/dashboard" , countryRouter)
app.use("/api/history",historyRouter);
// app.use("/api/users" , usersRouter)

const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log("server is running" , port)
})

