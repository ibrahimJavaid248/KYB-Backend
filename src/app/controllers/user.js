const ejs = require('ejs');
const fs = require('fs');
// const {User , destroyToken} = require('../database/models/users')
const {successResponse , failureResponse} = require('../helper/responses')
const {sendEmail} = require('../helper/send-email')
const { Op, Sequelize } = require('sequelize')
const data = require('../helper/split-token')
// const {createAccountEmail} = require('../scheduling/email-scheduling')
const { format } = require('date-fns');
const Model = require("../database/models")
const { isValid } = require('date-fns');





const createUser = async (req, res) => {
    const { userName, email ,password} = req.body;
     const creatorData = req.user;
     const creatorName = creatorData.dataValues.full_name;
    const logId = res.getHeader('logId');
    const template = fs.readFileSync('./app/templates/forgetEmail.ejs', 'utf-8');
    if (!userName || !email || !password) {
      return failureResponse(res, 400, 'Missing required feilds', logId)
    }
    try {
      const newUser = await Model.Users.create({
        full_name :userName,
        email,
        created_by:creatorName,
        password,
        is_active:true,
      });
      // const rememberToken = await newUser.createRememberToken();
      await newUser.save();
      // const templateData = {
      //   user: {
      //     name: newUser.full_name,
      //   },
      //   resetUrl: `http://localhost:8080/set-password/${rememberToken}`,
      // };
      // const htmlMessage = ejs.render(template, templateData);
      // const schedulingData = {
      //   email: newUser.email,
      //   subject: "Account Verification Email",
      //   message: htmlMessage,
      // }
      // createAccountEmail.add(schedulingData)
      
      const user = {
        "First Name": newUser.full_name,
        "email": newUser.email,
      }
      return successResponse(res, 'success', 201, 'user created  Successfully', user)
    } catch (error) {
      let errorMessage;
      if (error instanceof Sequelize.ValidationError) {
        errorMessage = error.errors[0].message;
        return failureResponse(res, 400, errorMessage, logId);
      } else {
        errorMessage = error.message;
        return failureResponse(res, 400, errorMessage, logId);
      }
    }
  };

const changePassword = async (req, res) => {

    const logId = res.getHeader('logId');
    const result = data.extractToken(req.headers);
    if (result.error) {
      return failureResponse(res, result.status, result.message);
    }
    const token = result.token;
    const userData =await  data.decodeJwtRedisToken(token)
    if (userData.error) {
        return failureResponse(res, userData.status, userData.message);
      }
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return failureResponse(res, 400, 'Missing required feilds', logId)
    }
    try {
        console.log(userData.userData.id)
      let id = userData.userData.id;
      
      const user = await Model.Users.findOne({
        where: {
          id,
        },
      });
      const isPasswordMatch = await user.comparePassword(oldPassword)
      if (!isPasswordMatch.result) {
        return failureResponse(res, 400, 'Old password does not match', logId)
      }
      console.log("--match pass",isPasswordMatch)
       
      if(newPassword != confirmPassword){
        return failureResponse(res, 400, 'New and Confirm password Does not match', logId)
      }
      user.password = newPassword;
     
      await user.save();
      // const tokenDestroyed = await destroyToken(token);
      if (!user) {
        return failureResponse(res, 400, 'Sorry user Not Found', logId)
      }
      return successResponse(res, 'success', 201, 'Password Changed SuccessFully', null, logId)
    } catch (error) {
      console.error('Error in getProfile:', error);
      return failureResponse(res, 400, 'Internal Server Error', logId)
    }
  }

  const getAlluser = async (req, res, next)=>{
    try {
      const page = req.query.page || 1;
      let limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const startDate = req.query.startDate || null;
      const endDate = req.query.endDate || null;
      const offset = (page - 1) * limit;
      let whereClause={}
      if (search !== '') {
       whereClause = {
        [Op.or]: [
          { full_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      };
    }
      if (startDate && endDate) {
        const validStartDate = isValid(new Date(startDate)) ? new Date(startDate) : null;
        const validEndDate = isValid(new Date(endDate)) ? new Date(endDate) : null;
        if (validStartDate > validEndDate) {
          [validStartDate, validEndDate] = [validEndDate, validStartDate];
        }
        if (validStartDate && validEndDate) {
          whereClause.createdAt = {
            [Op.between]: [validStartDate, validEndDate],
          };
        }
      }
      const totalRecords = await Model.Users.count()
      if(limit === -1){
        limit = totalRecords
      }
      const users = await Model.Users.findAndCountAll({
        attributes: ['full_name', 'email','created_by', 'is_active', 'createdAt' , 'updatedAt'],
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: limit,
        offset: offset,
      });
      console.log("Total-Records",totalRecords)
     console.log("Limit",limit)
     
      console.log('Generated SQL Query:', users.query)
  
      const formattedUsers = users.rows.map((user) => ({
        ...user.toJSON(),
        createdAt: format(user.createdAt, 'yyyy-MM-dd'),
        updatedAt: format(user.updatedAt, 'yyyy-MM-dd'),
        is_active: user.is_active ? 'Active' : 'Blocked',
      }));
      console.log(users.count)
      const totalPages = Math.ceil(users.count / limit);
     
  
      const response = {
        users: formattedUsers,
       
      };
      const pagination = {
        totalUsers: users.count,
        totalPages: totalPages,
        currentPage: page,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      }
  
      return successResponse(res, 'success', 200, 'User Shown Successfully', response, null, pagination);
    } catch (error) {
      return next(error);
    }
  };

const changeStatus = async (req, res, next) => {
  const { id } = req.params;
  const creatorData = req.user;
  const creatorId = creatorData.dataValues.id;
  console.log(creatorId)
  if(creatorId == id){
    return failureResponse(res, 400, "Sorry, you are not able to block your self");
  }  
  try {
    const user = await Model.Users.findOne({
      where: {
        id
      }
    });
    if (!user) {
      return failureResponse(res, 400, "Sorry, user does not exist");
    }
    const updatedStatus = !user.is_active;
    const updatedUser = await user.update({
      is_active: updatedStatus
    });
    return successResponse(res, 'success', 200, 'User status updated sucessfully', null, null);
  } catch (error) {
    console.error("Error updating user status:", error);
    return failureResponse(res, 500, "Internal Server Error");
  }
};



module.exports = {getAlluser , createUser , changePassword , changeStatus}