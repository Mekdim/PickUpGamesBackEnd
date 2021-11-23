var express = require('express');
var router = express.Router();
const config = require('../db/config')
const { Pool } = require('pg')
const pool = new Pool(config.database)
const database = require("../db/db");
const {sender} = require("../module/mailer");
/* GET users listing. */
router.get('/', async function(req, res, next) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [1])
  res.send(rows);
});

router.post('/addProfile', async function(req, res, next) {
   // Mark: validate if the req.body fields are not nil from the request - TODO
   let val1 = [
    req.body.first_name,
    req.body.last_name,
    req.body.email,
    req.body.uid,
    req.body.phone_number
  ];
   try{
     // id is returned here
       let result = await database.addProfile(val1);
       res.status(201).json({
        id: result
      })
   }catch(err){
      next(err)
   }
});

router.post('/addProfilePicture', async function(req, res, next) {
  // Mark: validate if the req.body fields are not nil from the request - TODO
  let val1 = [
   req.body.image_url,
   "PROFILE_IMAGE",
   req.body.image_id
 ];
  try{
      let results = await database.addProfilePicture(val1);
      res.status(201).json({
        status:"success"
      })
  }catch(err){
     next(err)
  }
});
// profilepicture, email and password should be changed separately
router.put('/updateProfile', async function(req, res, next) {
  // Mark: validate if the req.body fields are not nil from the request - TODO
  let val = [
   req.body.first_name,
   req.body.last_name,
   req.body.address,
   req.body.uid

 ];
  try{
      let results = await database.updateProfile(val);
      res.status(201).json({
        status:"success"
      })
  }catch(err){
     next(err)
  }
});

router.get('/getProfilePicture/:id', async function(req, res, next) {
  try{
      const results = await database.getProfilePicture(req.params.id);
      res.status(201).json(results);
  }catch(err){
    next(err);
  }
});

router.get('/all', async function(req, res, next) {
    try{
        const results = await database.getUsers();
        res.status(201).json(results);
    }catch(err){
        next(err);
    }
});

router.post('/invite/:sessionId', async (req, res, next) => {
    res.json({status: "success"});
    try {
        await sender({list: req.body, sessionId: req.params.sessionId});
    } catch (error) {
        console.error("unable to send ", error);
    }
})

// MARK: not very great way of doing it but let it do. Authenticate maybe using jwt etc
router.get('/getProfile/:uid', async function(req, res, next) {
  console.log(req.params.uid)
  try{
      const results = await database.getProfile(req.params.uid);
      res.status(201).json(results);
  }catch(err){
    next(err);
  }
});

module.exports = router;
