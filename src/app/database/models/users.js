'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const redis = require('redis');
const crypto = require('crypto')
const JWTR =  require('jwt-redis').default;
const Joi = require('joi');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init({
    full_name: DataTypes.STRING,
    email : DataTypes.STRING,
    password : DataTypes.STRING,
    is_active : DataTypes.BOOLEAN,
    remember_token : DataTypes.STRING,
    created_by : DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Users',
  });

const userSchema = Joi.object({
  full_name: Joi.string().trim().max(50).required().regex(/^[a-zA-Z][a-zA-Z0-9 ]*$/).message('First Name must be valid'),
  email: Joi.string().required().regex(/^[a-zA-Z][a-zA-Z0-9._%+-]*@gmail+\.[a-zA-Z]{2,}$/).message('Email must be valid'),
  password: Joi.string().min(8).allow(null), 
});

Users.addHook('beforeValidate', (user, options) => {
  const { error } = userSchema.validate(
    { 
      full_name: user.full_name,
      email: user.email,
      password: user.password !== null ? user.password : undefined,
    },
    { abortEarly: true }
  );
  if (error) {
    throw new Error(error.details.map(detail => detail.message).join(', '));
  }
});


// function to compare encrypted password
Users.prototype.comparePassword = async function (userPassword) {
  try {
    if (!this.password) {
      return { error: true, message: 'Password not set' };
    }
    const result = await bcrypt.compare(userPassword, this.password);
    return { error: false, result };
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return { error: true, message: 'Error comparing passwords' };
  }
};

// function to sign jwt-redis token
Users.prototype.signToken = async function (rememberMe) {
  try {
    const redisClient = redis.createClient();
    await redisClient.connect();
    const jwtr = new JWTR(redisClient);
    const payload = {
      id: this.id,
      email: this.email,
      name: this.full_name
    };

    const secret = process.env.SECERET_STRING;
    // const expiresIn = process.env.JWT_EXPIRY;
    const expiresIn = rememberMe ? '7d' : process.env.JWT_EXPIRY;
    const token = await jwtr.sign(payload, secret, { expiresIn });
    await redisClient.quit();

    return { error: false, token };
  } catch (error) {
    console.error('Error signing JWT:', error);
    return { error: true, message: 'Error signing JWT' };
  }
};

// function to destory jwt-redis token
//  Users.prototype.destroyToken = async function (token) {
//   try {
//     const redisClient = redis.createClient();
//     await redisClient.connect();
//     const jwtr = new JWTR(redisClient);
//     const decoded = jwt.verify(token, process.env.SECERET_STRING);
//     const jti = decoded.jti;
//     const result = await jwtr.destroy(jti);
//     await redisClient.quit();
//     return result; 
//   } catch (error) {
//       throw error
//   }
// };


//function to create a user remember token
Users.prototype.createRememberToken = function () {
  const buffer = crypto.randomBytes(32);
  const unhashedToken = buffer.toString('hex');  
  this.remember_token = crypto.createHash('sha256').update(unhashedToken).digest('hex');
  return unhashedToken; 
};

//function to update password
Users.beforeUpdate(async (user, options) => {
  if (user.changed('password')) {
    try {
      console.log('Password is being updated');
      const hashedPassword = await bcrypt.hash(user.password, 12);
      user.setDataValue('password', hashedPassword);
    } catch (error) {
      console.error('Error updating password:', error);
    }
  }
});

Users.beforeCreate(async (user, options) => {
  try {
    console.log('New user is being created');
    const hashedPassword = await bcrypt.hash(user.password, 12);
    user.setDataValue('password', hashedPassword);
  } catch (error) {
    console.error('Error creating user:', error);
  }
});

  return Users;
};






