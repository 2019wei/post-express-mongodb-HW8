var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/postModel')
const User = require('../models/userModel')
const Comment = require('../models/commentModel')
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync')
const postcontroller = require('../controllers/postcontroller')
const {generateSendJWT,isAuth} = require('../service/auth');
require("dotenv").config();

const DB = process.env.DATABASE

//mongodb://localhost:27017/HW8
mongoose.connect(DB)
.then(()=>console.log('資料連接成功'))

//取得所有貼文
router.get('/',handleErrorAsync(postcontroller.getPosts));

//取得單一貼文 {url}/posts/{postID}
router.get('/:id/', handleErrorAsync(postcontroller.getOnePost));

//新增貼文
router.post('/',isAuth,handleErrorAsync(postcontroller.createPosts))

//新增一則貼文的讚 {url}/posts/{postID}/like
router.post('/:id/like',isAuth, handleErrorAsync(postcontroller.likePost));

//取消一則貼文的讚 {url}/posts/{postID}/unlike
router.delete('/:id/unlike',isAuth, handleErrorAsync(postcontroller.unLikePost))


//新增一則貼文的留言
router.post('/:id/comment',isAuth, handleErrorAsync(postcontroller.CreateComment))

//取得個人所有貼文列表：{url}/post/user/{userID}
router.get('/user/:id', handleErrorAsync(postcontroller.getPersonPosts))


module.exports = router;
