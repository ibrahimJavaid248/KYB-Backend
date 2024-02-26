const redis = require('redis');
const JWTR = require('jwt-redis').default;
const jwt = require('jsonwebtoken')


const extractToken = (headers) => {
    if (!headers || !headers.authorization) {
      return {
        error: true,
        status: 400,
        message: 'Authorization header not present',
      };
    }
  
    const token = headers.authorization.split(' ')[1];
    if (!token) {
      return {
        error: true,
        status: 400,
        message: 'Invalid token format',
      };
    }
  
    return {
      error: false,
      token,
    };
  };


  async function decodeJwtRedisToken(jwtToken) {
    try {
      const redisClient = redis.createClient();
      await redisClient.connect();
      const jwtr = new JWTR(redisClient);
      const userData = jwtr.decode(jwtToken);
      return {
        error: false,
        userData,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          error: true,
          status: 401,
          message: 'Token has expired.',
        };
      } else {
        return {
          error: true,
          status: 401, // Unauthorized
          message: 'Invalid token.',
        };
      }
    }
  }


  module.exports= {extractToken , decodeJwtRedisToken}