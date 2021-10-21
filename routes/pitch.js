const express = require("express");
const router = express.Router();
const database = require("../db/db");
const {getTime, getDate} = require("../util/time");

router.post("/addSession", async function (req, res, next) {
  try {
    // TODO perform some data validation
    let val1 = [
      req.body.pitch_id,
      req.body.name,
      getDate(req.body.date),
      getTime(req.body.start_time),
      getTime(req.body.end_time),
      req.body.duration,
      req.body.number_of_players
    ];
    let val2 = [req.body.player_id];

    console.log(" Date  ",new Date(req.body.date));
    let results = await database.addSession(val1, val2);

    console.info(results);

    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    next(err);
  }
});

router.put("/joinSession", async function (req, res, next) {
  console.log(req.body);
  try {
    let val1 = [req.body.session_id];
    let val2 = [req.body.player_id, req.body.session_id];
    const results = await database.joinSession(val1, val2);
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:pitchId/:date/sessions", async function (req, res, next) {
  console.log(req.params.pitchId);

  try {
    const results = await database.findSessionByPitchIdAndDate(req.params.pitchId, new Date(req.params.date));
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

router.get("/sessions/:sessionId", async function (req, res, next) {
  console.log(req.params.sessionId);

  try {
    const results = await database.findSessionBySessionId(req.params.sessionId);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

router.get("/:pitchId/sessions", async function (req, res, next) {
  console.log(req.params.pitchId);

  try {
    const results = await database.findSessionByPitchId(req.params.pitchId);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
