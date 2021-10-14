const express = require('express');
const path = require('path');
const cors = require('cors')
const cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let pitchRouter = require('./routes/pitch');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/pitch', pitchRouter);

app.use((error, req, res, next)=>{
    res.status(error.statusCode).send(error);
})

module.exports = app;
