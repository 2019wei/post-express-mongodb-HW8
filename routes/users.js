var express = require('express');
var router = express.Router();
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel')
const Post = require('../models/postModel')
const {generateSendJWT,isAuth} = require('../service/auth');
const usercontroller = require('../controllers/usercontroller')



/* GET users listing. */
//註冊
router.post('/sign_up', handleErrorAsync(usercontroller.sign_up));
//登入
router.post('/sign_in', handleErrorAsync(usercontroller.sign_in));
//取得個人資料
router.get('/profile',isAuth, handleErrorAsync(usercontroller.getUserinfo))
//更新個人資料
router.patch('/profile',isAuth, handleErrorAsync(usercontroller.updateUserinfo))
//重設密碼
router.patch('/updatePassword',isAuth,handleErrorAsync(usercontroller.updatePassword))


//追蹤朋友 {url}/users/{userID}/follow
router.post('/:id/follow',isAuth, handleErrorAsync(usercontroller.follow))
//取消追蹤朋友 {url}/users/{userID}/unfollow
router.delete('/:id/unfollow',isAuth, handleErrorAsync(usercontroller.unfollow))
//取得個人按讚列表 {url}/users/getLikeList
router.get('/getLikeList',isAuth, handleErrorAsync(usercontroller.getLikeList))
//取得個人追蹤名單 {url}/users/following
router.get('/following',isAuth, handleErrorAsync(usercontroller.following))

module.exports = router;
