var express = require('express');
var router = express.Router();
const config = require('../db/config')
const { Pool } = require('pg')
const pool = new Pool(config.database)

/* GET users listing. */
router.get('/', async function(req, res, next) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [1])
  res.send(rows);
});

router.post('/add_profile', async function(req, res, next) {
   console.log(req.body)
   console.log("mek")
   try{
       const results = await pool.query('INSERT INTO players (first_name, last_name, email, token_password, phone_number) values($1, $2, $3, $4, $5)',
       [req.body.first_name,req.body.last_name, req.body.email, req.body.token_password, req.body.phone_number]  )
       res.status(201).json({
         status:"success"
       })
   }catch(err){
      console.log(err)
      res.status(500).json(err)
   }
});
// MARK: not very great way of doing it but let it do
router.get('/get_profile', async function(req, res, next) {
  console.log(req.body)
  console.log("mek")
  try{
      const { rows } = await pool.query('SELECT * FROM players WHERE token_password = $1', [req.body.token_password])
      res.status(201).json({
        rows
      })
  }catch(err){
     console.log(err)
     res.status(500).json(err)
  }
});

module.exports = router;
