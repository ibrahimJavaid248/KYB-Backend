
const {getHistory} = require('../controllers/history-controller')
const {authorizeUser} = require('../middleware/auth')
const express = require('express');
const historyRouter = express.Router();


historyRouter.get('/get-history/:id',authorizeUser,getHistory);

module.exports = {historyRouter};