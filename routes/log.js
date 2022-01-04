var express = require('express');
var router = express.Router();
const config = require('../db/config')
const { Pool } = require('pg')
const pool = new Pool(config.database)
const database = require("../db/db");


router.post('/error', (req, res, next)=>{
  
  res.status(200).json("Success")
  if (req.body.error){
      console.trace(req.body.error)
  }
});
module.exports = router;
