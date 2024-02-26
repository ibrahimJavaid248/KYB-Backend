const ejs = require('ejs');
const fs = require('fs');
const Model = require("../database/models")
const crypto = require('crypto')
const {successResponse , failureResponse } = require('../helper/responses')
const {extractToken} = require('../helper/split-token');
const { sendEmail } = require('../helper/send-email');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const JWTR =  require('jwt-redis').default;
// const { Model } = require('sequelize');

// const {forgetPasswordEmail} = require('../scheduling/email-scheduling')


  // Login function and send Jwt-redis Token
const login = async (req, res) => {
  console.log("im")
    const { email, password  , rememberMe} = req.body;
    if (!email || !password || rememberMe == null) {
      return failureResponse(res, 400, 'Missing required fields');
    }

    try {
      const user = await Model.Users.findOne({
        where: {
          email,
        },
      });

      if(!user){
        return failureResponse(res, 400, 'Please Enter Valid email and password');
      }
        // call compare password from user model table
      const passwordComparisonResult = await user.comparePassword(password);
  
      if (passwordComparisonResult.error) {
        return failureResponse(res, 400, passwordComparisonResult.message);
      }
  
      if (!user || !passwordComparisonResult.result) {
        return failureResponse(res, 400, 'Please Enter Valid email and password');
      }
    const tokenResult = await user.signToken(rememberMe);

    if (tokenResult.error) {
      return failureResponse(res, 500, tokenResult.message);
    }
    const token = tokenResult.token;

      const loginUser = {
        "UserName": user.full_name,
        "email": user.email,
        "isActive": user.is_active
      };
  
      return successResponse(res, 'success', 200, 'User Login Successfully', loginUser, null, null, token);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return failureResponse(res, 400, "Invalid JSON data");
      } else {
        return failureResponse(res, 400, error.message);
      }
    }
  };

  // Logout function and destroy jwt
  const logout = async (req, res) => {
    const result = extractToken(req.headers);
    if (result.error) {
      return failureResponse(res, result.status, result.message);
    }
    const token = result.token;
    try {
        //call destroy token function from user model
      const tokenDestroyed = await mdestroyToken(token);
      if (tokenDestroyed) {
        return successResponse(res, 'success', 200, 'User Logout Successfully');
      } else {
        return failureResponse(res, 404, 'Token not Exist');
      }
    } catch (error) {
     
      return failureResponse(res, 500, error.message);
    }
     
    
  };
  const mdestroyToken = async function (token) {
    try {
      const redisClient = redis.createClient();
      await redisClient.connect();
      const jwtr = new JWTR(redisClient);
      const decoded = jwt.verify(token, process.env.SECERET_STRING);
      const jti = decoded.jti;
      const result = await jwtr.destroy(jti);
      await redisClient.quit();
      return result; 
    } catch (error) {
        throw error
    }
  };

  

  //function to forget the password
  const forgetPassword = async(req,res)=>{
    const {email} = req.body;
    const logId = res.getHeader('logId');
    const template = fs.readFileSync('./app/templates/forgetEmail.ejs', 'utf-8');
    if(!email){
        return failureResponse(res, 400, 'Missing required feilds', logId)
    }
    try{
    const user = await Model.Users.findOne({
        where: {
          email,
        },
      });
     if(!user){
        return failureResponse(res, 400, 'Sorry User Not Found', logId)
     }  
     const rememberToken = await user.createRememberToken();
     await user.save()
     const templateData = {
        user: {
          name: user.full_name,
        },
        resetUrl: `http://localhost:8080/set-password/${rememberToken}`,
      };
    const htmlMessage = ejs.render(template, templateData);
   const changePasswordEmailData = {
    email: user.email,
    subject: 'Reset You password',
    message: htmlMessage,
  }
  const emailSent = await sendEmail(changePasswordEmailData)
  
  if(!emailSent){
    return failureResponse(res, 400, 'Email Not sent', logId)

  }
  
  return successResponse(res, 'success', 201, 'Email sent successfully')
    }
    catch(error){
        return failureResponse(res, 400, 'Internal server error', logId)
    }

  }

  //function to set a password 
  const setPassword = async (req, res) => {
    const { token, password, confirmPassword } = req.body;
    const logId = res.getHeader('logId');
    if (!token || !password || !confirmPassword) {
      return failureResponse(res, 400, 'Missing required feilds', logId)
    }
    try {
      const encryptToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await Model.Users.findOne({
        where: {
          remember_token: encryptToken,
        },
      });
      if (!user) {
        return failureResponse(res, 404, 'User not found or token expired', logId)
      }
      const tokenExpiryDuration = 24*60*60*1000; //one Day
    //   const tokenExpiryDuration = 60 * 1000    //one minute
      const tokenExpiryTime = new Date(user.updated_at.getTime() + tokenExpiryDuration);
      console.log(tokenExpiryTime)
      if (new Date() > tokenExpiryTime) {
        console.log(new Date())
        console.log(tokenExpiryTime)
        return failureResponse(res, 404, 'Token expired', logId);
      }

      if (password !== confirmPassword) {
        return failureResponse(res, 400, 'Password donot match', logId)
      }
      user.password = password;
      user.remember_token = null;
      user.is_active = true;
      await user.save();
      return successResponse(res, 'success', 200, 'Password set successfully', logId)
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return failureResponse(res, 400, validationErrors.message, logId)
      }
      return failureResponse(res, 400, error.message, logId)
    }
  };






module.exports = {login , logout , forgetPassword , setPassword}