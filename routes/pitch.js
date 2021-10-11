const express = require("express");
const router = express.Router();
const database = require("../db/db");

router.post("/addSession", async function (req, res, next) {
  try {
    // TODO perform some data validation
    let val1 = [
      req.body.pitch_id,
      req.body.start_time,
      req.body.end_time,
      req.body.duration,
      req.body.number_of_players,
      req.body.price,
    ];
    let val2 = [req.body.player_id];
    let results = await database.addSession(val1, val2);

    console.info(results);

    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.put("/joinSession", async function (req, res, next) {
  console.log(req.body);
  try {
    let val1 = [req.body.session_id];
    let val2 = [req.body.player_id, req.body.session_id];
    const results = await database.joinSession(val1, val2);

    console.info(results);
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/sessions/:pitch_id", async function (req, res, next) {
  console.log(req.params.pitch_id);

  try {
    const results = await database.findSession(req.params.pitch_id);
    res.status(201).json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
