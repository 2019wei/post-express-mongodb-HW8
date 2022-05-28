var express = require('express');
var router = express.Router();
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const {generateSendJWT,isAuth} = require('../service/auth');
const sizeOf = require('image-size');
const upload = require('../service/image');
const { ImgurClient } = require('imgur');
const uploadcontroller =require('../controllers/uploadcontroller')

router.post('/', isAuth,upload,handleErrorAsync(uploadcontroller.uploadPhote))

module.exports = router 