var express = require('express');
var router = express.Router();
const config = require('../db/config')
const { Pool } = require('pg')
const pool = new Pool(config.database)


router.post('/add_session', async function(req, res, next) {
  console.log(req.body)
  console.log("mickey")
  const client = await pool.connect()
  try{
      

      client.query('BEGIN')
      const result1 = await  client.query('INSERT INTO Sessions (pitch_id, start_time, end_time, duration, number_of_players,price) values($1, $2, $3, $4, $5, $6) RETURNING id',
      [req.body.pitch_id,req.body.start_time, req.body.end_time, req.body.duration,req.body.number_of_players,req.body.price] )
      console.log(result1)
      const result2 = await  client.query('INSERT INTO session_members (player_id, session_id) values($1, $2)',
      [req.body.player_id,result1.rows[0].id])
      await client.query('COMMIT')

      res.status(201).json({
        status:"success"
      }) 
  }catch(err){
     console.log(err)
     console.log("rollllll backkkk about to start!")
     try {
      await client.query('ROLLBACK');
     }catch (rollbackError) {
      console.log('A rollback error occurred:', rollbackError);
     }
     res.status(500).json(err)
  }finally {
       client.release();
  }
});
router.put('/join_session', async function(req, res, next) {
  console.log(req.body)
  console.log("mek")
  const client = await pool.connect()
  try{
      //const results = await db.query('INSERT INTO Sessions (pitch_id, start_time, end_time, address, duration,Number_of_players,Price) values($1, $2, $3, $4, $5, $6, $7)',
      //[req.body.pitch_id,req.body.start_time, req.body.end_time, req.body.address, req.body.duration,req.body.number_of_players,req.body.price]  )
      //res.status(201).json({
        //status:"success"
      //})

      client.query('BEGIN')
      const results1 = await  client.query('UPDATE Sessions set number_of_players = number_of_players+1 where id=$1',
      [req.body.session_id])

      const results2 = await  client.query('INSERT INTO session_members (player_id, session_id) values($1, $2)',
      [req.body.player_id,req.body.session_id])
      await client.query('COMMIT')

      res.status(201).json({
        status:"success"
      }) 
  }catch(err){
     console.log(err)
     console.log("rollllll backkkk!")
     try {
      await client.query('ROLLBACK');
     }catch (rollbackError) {
      console.log('A rollback error occurred:', rollbackError);
     }
     res.status(500).json(err)
  }finally {
       client.release();
  }
});

router.get('/sessions/:pitch_id', async function(req, res, next) {
  console.log(req.params.pitch_id)
  console.log("mek for pitch id")
  
  try{
      const results = await pool.query('SELECT * FROM Sessions WHERE pitch_id = $1', [req.params.pitch_id] )
      res.status(201).json(results.rows)
  }catch(err){
     console.log(err)
     res.status(500).json(err)
  }
});

module.exports = router;
