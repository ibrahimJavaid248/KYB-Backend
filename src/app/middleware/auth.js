const redis = require('redis');
const JWTR = require('jwt-redis').default;
const {extractToken} = require('../helper/split-token')
const { failureResponse } = require('../helper/responses');
// const {User} = require('../database/models/users')

const Model = require('../database/models')

const authorizeUser = async (req, res, next) => {
 
  const logId = res.getHeader('logId');
  const result = extractToken(req.headers);
  if (result.error) {
    return failureResponse(res, result.status, result.message);
  }
  const tokenValue = result.token;
  try {
    const redisClient = redis.createClient();
    await redisClient.connect();
    const jwtr = new JWTR(redisClient);
    const secret = process.env.SECERET_STRING
    const decodedToken = await jwtr.verify(tokenValue, secret);
    console.log("mydecodedToken",decodedToken)
    if(!decodedToken){
      return failureResponse(res, 401, 'Unauthorized: Invalid token', logId);
    }
    const id = decodedToken.id;

    const user = await Model.Users.findOne({
      where:{
        id,
      }
    })
    if(!user){
      return failureResponse(res, 401, 'Sorry you are unauthorize', logId);
    }
    if(!user.dataValues.is_active){
      return failureResponse(res, 401, 'Sorry your account is not active', logId);
    }

    req.user = user;
    next();
  } catch (error) {
    return failureResponse(res, 401, 'Unauthorized: Invalid token', logId);
  }
};

module.exports = { authorizeUser };
