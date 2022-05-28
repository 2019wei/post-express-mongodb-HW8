const mongoose = require('mongoose');
const Post = require('../models/postModel')
const User = require('../models/userModel')
const dotenv = require('dotenv');
const appError = require('../service/appError');


const postcontroller = {
async getPosts(req, res, next){
    const timeSort = req.query.timeSort == "asc" ? "createdAt":"-createdAt"
        const q = req.query.q !== undefined ? {"content": new RegExp(req.query.q)} : {};
        const posts = await Post.find(q).populate({
            path: 'user',
            select: 'name photo '
        }).populate({
            path: 'comments',
            select: 'comment user'
          }).sort(timeSort);
          res.status(200).json({
          "status":"success",
          "data":posts
      })
   },
async createPosts(req, res, next){
    const {content} = req.body
    if(req.body.content == undefined){
        return next(appError(400,"你沒有傳入content資料",next))
    }
    const posts = await Post.create({
        user: req.user.id,
        content
    })
    res.status(200).json({
        "status":"success",
       "data":posts
    })
},
  async getOnePost(req, res, next){
    const _id = req.params.id;
    const post = await Post.find({_id}).populate({
        path: 'user',
        select: 'name photo '
      }).populate({
        path: 'comments',
        select: 'comment user'
      });
    // res.send('respond with a resource');
    res.status(200).json({
      post
    })
  },
  async likePost(req, res, next){
    const _id = req.params.id;
      await Post.findOneAndUpdate(
          { _id},
          { $addToSet: { likes: req.user.id } }
        );
        res.status(201).json({
          status: 'success',
          postId: _id,
          userId: req.user.id
        });
    },
async unLikePost(req, res, next){
    const _id = req.params.id;
    await Post.findOneAndUpdate(
        { _id},
        { $pull: { likes: req.user.id } }
      );
      res.status(201).json({
        status: 'success',
        postId: _id,
        userId: req.user.id
      });
    },
async CreateComment(req, res, next){
    const user = req.user.id;
    const post = req.params.id;
    const {comment} = req.body;
    const newComment = await Comment.create({
      post,
      user,
      comment
    });
    res.status(201).json({
        status: 'success',
        data: {
          comments: newComment
        }
    });
    },
async getPersonPosts(req, res, next){
    const user = req.params.id;
    const posts = await Post.find({user}).populate({
      path: 'comments',
      select: 'comment user'
    });
  
    res.status(200).json({
        status: 'success',
        results: posts.length,
        posts
    });
    },
}

module.exports = postcontroller;