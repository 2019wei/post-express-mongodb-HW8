var express = require('express');
var router = express.Router();
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel')
const Post = require('../models/postModel')
const {generateSendJWT,isAuth} = require('../service/auth');


const usercontroller = {
    async sign_up(req, res, next){
    let { email, password,confirmPassword,name } = req.body;
  // 內容不可為空
  if(!email||!password||!confirmPassword||!name){
    return next(appError("400","欄位未填寫正確！",next));
  }
  // 暱稱2字元以上
  if(!validator.isLength(name,{min:2})){
    return next(appError("400","暱稱至少2個字位元以上",next));
  }
  // 密碼正確
  if(password!==confirmPassword){
    return next(appError("400","密碼不一致！",next));
  }
  // 密碼 8 碼以上
  if(!validator.isLength(password,{min:8})){
    return next(appError("400","密碼字數低於 8 碼",next));
  }
  // 是否為 Email
  if(!validator.isEmail(email)){
    return next(appError("400","Email 格式不正確",next));
  }
  // 加密密碼
  password = await bcrypt.hash(req.body.password,12);
  
  //檢查mail是否註冊過
  const checkNewUser = await User.findOne({email});
  if(checkNewUser){
    return next(appError( 400,'信箱已註冊過了喔!!',next));
  }
  const newUser = await User.create({
    email,
    password,
    name
  });
  generateSendJWT(newUser,201,res);
  },

    async sign_in(req, res, next){
        const { email, password } = req.body;
        if (!email || !password) {
            return next(appError( 400,'帳號密碼不可為空',next));
        }
        const user = await User.findOne({ email }).select('+password');
        if(!user){
          return next(appError(400,'您的信箱不存在',next));
        }
        const auth = await bcrypt.compare(password, user.password);
        if(!auth){
            return next(appError(400,'您的密碼不正確',next));
        }
        generateSendJWT(user,200,res);
    },

    async updatePassword(req, res, next){
        const {password,confirmPassword } = req.body;
        if(password!==confirmPassword){
          return next(appError("400","密碼不一致！",next));
        }
        newPassword = await bcrypt.hash(password,12);
        
        const user = await User.findByIdAndUpdate(req.user.id,{
          password:newPassword
        });
        generateSendJWT(user,200,res)
    },

    async getUserinfo(req, res, next){
      const userinfo = await User.findById(req.user.id)
        res.status(200).json({
            status: 'success',
            user: userinfo
          });
    },
    async updateUserinfo(req, res, next){
      const { name, sex, photo } = req.body;
      if(!name){
        return next(appError("400","暱稱不得為空！",next));
      }
        const newUerInfo = await User.findByIdAndUpdate(req.user.id,{
          photo:photo,
          name:name,
          sex:sex
        },{new:true});
        res.status(200).json({
          status: 'success',
          user: newUerInfo
        });

    },
    async follow(req, res, next){
      if (req.params.id === req.user.id) {
        return next(appError(400,'您無法追蹤自己,不可以唷~',next));
      }
      await User.updateOne(
        {
          _id: req.user.id,
          'following.user': { $ne: req.params.id }
        },
        {
          $addToSet: { following: { user: req.params.id } }
        }
      );
      await User.updateOne(
        {
          _id: req.params.id,
          'followers.user': { $ne: req.user.id }
        },
        {
          $addToSet: { followers: { user: req.user.id } }
        }
      );
      res.status(200).json({
        status: 'success',
        message: '您已成功follow！'
      });
    },
    async unfollow(req, res, next){
      if (req.params.id === req.user.id) {
        return next(appError(400,'您無法取消追蹤自己',next));
      }
      await User.updateOne(
        {
          _id: req.user.id
        },
        {
          $pull: { following: { user: req.params.id } }
        }
      );
      await User.updateOne(
        {
          _id: req.params.id
        },
        {
          $pull: { followers: { user: req.user.id } }
        }
      );
      res.status(200).json({
        status: 'success',
        message: '您已成功取消追蹤！'
      });
    },
    async getLikeList(req, res, next){
      const likeList = await Post.find({
        likes: { $in: [req.user.id] }
      }).populate({
        path:"user",
        select:"name _id"
      });
      res.status(200).json({
        status: 'success',
        likeList
      });
    },
    async following(req, res, next){
        const _id = req.user.id
        const followingList = await User.find({_id}).populate({
        path:"following.user",
        select:"name _id"
      });
      res.status(200).json({
        status: 'success',
        followingList
      });
    },
}

module.exports = usercontroller;