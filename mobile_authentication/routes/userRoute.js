require('dotenv').config();
const express = require('express');
const router = express();

router.use(express.json());

const userController = require('../controllers/userController') 
router.post('/send-otp',userController.sendOtp)
router.post('/verify-otp',userController.verifyOtp)

module.exports = router ;