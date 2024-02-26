
// const {ActivityLog} = require('../database/models/activity-logs')
const data = require('../helper/split-token')
const {failureResponse} = require('../helper/responses')
const url = require('url');



const activityLogDetails =async (req,res,next)=>{

    const result = data.extractToken(req.headers);
    if (result.error) {
      return failureResponse(res, result.status, result.message);
    }
    const tokenValue = result.token;
    const userData =await  data.decodeJwtRedisToken(tokenValue)
    if (userData.error) {
        return failureResponse(res, userData.status, userData.message);
      }
    const method = req.method;
    let type = '';
    
    if (method === "POST") {
        type = "Created";
    } else if (method === "PATCH") {
        type = "Updated";
    } else if (method === "GET") {
        type = "Viewed";
    }
    
    console.log(method)
    console.log(type)

    const responseBodyChunks = [];
    const originalJson = res.json;
    res.json = function (body) {
        responseBodyChunks.push(Buffer.from(JSON.stringify(body)));
        originalJson.call(res, body);
    };
const route = req.url;
const parsedUrl = url.parse(route, true);
const pathSegments = parsedUrl.pathname.split('/');
const queryParameters = parsedUrl.query;
    res.on('finish', async () => {
        const responseBody = Buffer.concat(responseBodyChunks).toString("utf-8");
        const responseMessage = JSON.parse(responseBody)
        console.log(responseMessage.message)
        const activity = `${userData.userData.name} perform activity to ${pathSegments[3]} and ${responseMessage.message}`
        console.log(activity)
        console.log(res.statusCode);
        console.log("Hello, World");
        const name = userData.userData.name;
        const  id = userData.userData.id;
        const activityData = {
            // full_name:name,
            user_id:id,
            details:activity,
            type,
        }
        await ActivityLog.create(activityData)
      });
    

    next()

}


module.exports = {activityLogDetails}