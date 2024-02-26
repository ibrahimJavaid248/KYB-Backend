// const {ActivityLog} = require('../database/models/activity-logs')


const getActivityLogs = async (req,res,next)=>{

    // const logs = await module.ActivityLog.findAll({})
    res.json("Logs File")
}


module.exports =  {getActivityLogs}