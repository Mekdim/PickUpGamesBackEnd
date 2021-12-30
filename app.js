require('dotenv').config()
const express = require('express');
const path = require('path');
const cors = require('cors')
const cookieParser = require('cookie-parser');
let logger = require('morgan');

const jwt = require('jsonwebtoken')
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let pitchRouter = require('./routes/pitch');
let tokensRouter = require('./routes/tokensRouter');

let app = express();

app.options('*', cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tokens', tokensRouter);
app.use('/pitch', pitchRouter);






app.use((error, req, res, next)=>{
    console.log(error)
    res.status(error.statusCode || "500").json({"error":error});
})

module.exports = app;
