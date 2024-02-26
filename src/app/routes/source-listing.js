const express = require("express")
const sourceRouter = express.Router()
const sourceList = require("../controllers/source-listing")
const {getLanguages,getSourcetype,getCountries , getRegions , getState} = require("../controllers/filters/filters")
const {authorizeUser} = require("../middleware/auth")
const {trackEditHistoryMiddleware}= require("../middleware/edit-history-middlewear.js");

const {updateSource,createSource,update_dummy} = require("../controllers/update-create-sourcelisting.js")


sourceRouter.get("/get-source",authorizeUser, sourceList.getAllSource)
sourceRouter.get("/get-languages",authorizeUser, getLanguages)
sourceRouter.get("/get-countries", authorizeUser,getCountries)
sourceRouter.get("/get-source-type",authorizeUser, getSourcetype)
sourceRouter.get("/get-region-list",authorizeUser, getRegions)
sourceRouter.get("/get-state-list",authorizeUser, getState)



sourceRouter.patch("/update-source",authorizeUser,trackEditHistoryMiddleware, updateSource)
sourceRouter.post("/create-source",authorizeUser, createSource)


module.exports = {sourceRouter}