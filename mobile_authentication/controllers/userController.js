require('dotenv').config();
const otpModel = require('../models/otp')
const {otpVerification} = require('../helpers/otpValidate')
const otpGenerator = require('otp-generator')
const twilio = require('twilio')
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifySid = process.env.TWILIO_VERIFY_SID

const twilioClient= new twilio(accountSid,authToken)


const sendOtp = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

        const cDate = new Date();

        await otpModel.findOneAndUpdate(
            { phoneNumber },
            { otp, otpExpiration: new Date(cDate.getTime()) },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        await twilioClient.verify.v2
            .services(verifySid)
            .verifications.create({ body:`Your OTP is ${otp}`, to: phoneNumber, channel: "sms" })

        // await twilioClient.messages.create({
        //     body:`Your OTP is ${otp}`,
        //     to:phoneNumber,
        //     from : process.env.TWILIO_MOBILE_NUMBER
        // })
        return res.status(200).json({
            success: true,
            msg: `Otp Sent Successfully. Your Otp Is ${otp}`
        })
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const verifyOtp = async(req,res)=>{
    try{
        const { phoneNumber,otp } = req.body;
        const otpData = await otpModel.findOne({
            phoneNumber,
            otp
        })
        if(!otpData){
            return res.status(400).json({
                success: false,
                msg: "You Enterd Wrong OTP"
            })
        }
        const isOtpExpired = await otpVerification(otpData.otpExpiration)
        if(isOtpExpired){
            return res.status(400).json({
                success: false,
                msg: "You OTP has been expired "
            })
        }
        return res.status(200).json({
            success: true,
            msg: "OTP Verified Successfully ."
        })
    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}
module.exports = { sendOtp ,verifyOtp}