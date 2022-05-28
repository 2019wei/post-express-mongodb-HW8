var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var uploadsRouter = require('./routes/uploads');

//找戰犯
process.on('uncaughtException',err =>{
    console.error("Uncaughted Exception!!!")
    console.error(err.name);
    console.error(err.message);
    process.exit(1)
})


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/upload', uploadsRouter);


//404 錯誤
app.use(function(req,res,next){
    res.status(404).json({
        status:"false",
        message:"你的路由不存在"
    })
})

const resErrorProd = (err , res) =>{
    if(err.isOperational){
        res.status(err.statusCode).json({
            message:err.message
        });
    }else{
        //log
        console.error('出現重大錯誤',err);
        //
        res.status(500).json({
            status:'error',
            message:'系統錯誤,請洽系統管理員'
        })
    }
}

const resErrorDev = (err , res) =>{
    res.status(err.statusCode).json({
        message:err.message,
        error:err,
        stack:err.stack
    })
}


//express 錯誤處理
app.use(function(err,req,res,next){
    //dev
    err.statusCode = err.statusCode || 500;
    if(process.env.NODE_ENV == 'dev'){
        return resErrorDev(err , res)
    }
    //production
    if(err.name === 'ValidationError'){
        err.message = "資料欄位未填寫正確，請重新輸入!"
        err.isOperational = true;
        return resErrorProd(err , res)
    }
    resErrorProd(err , res)
})




   // 未捕捉到的 catch        保險
    process.on('unhandledRejection', (err, promise) => {
    console.error('未捕捉到的 rejection：', promise, '原因：', err);
    // 記錄於 log 上
  });

module.exports = app;
