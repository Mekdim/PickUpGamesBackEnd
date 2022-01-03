const express = require("express");
const moment = require('moment')
const router = express.Router();
const database = require("../db/db");
const { getTime, getDate } = require("../util/time");
let authenticateToken = require('../Auth/authenticate');
// starttime and endtime as parameters are moment date objects here
function confirmValidityOfSessionTimes(currentSessionData, startTime, endTime) {
  for (x = 0; x < currentSessionData.length; x++) {
    var curStartTime = new moment(currentSessionData[x].start_time, 'HH:mm:ss');
    var curEndTime = new moment(currentSessionData[x].end_time, 'HH:mm:ss');
    // then we can safely insert the session in this case
    if (curStartTime.isAfter(startTime) && curStartTime.isSameOrAfter(endTime)) {
      return true
    }
    else if (startTime.isAfter(curStartTime) && startTime.isSameOrAfter(curEndTime)) {
      continue
    }
    // it is inside allocated session time so this is invalid
    else if (startTime.isSameOrAfter(curStartTime) && startTime.isBefore(curEndTime)) {
      return false
    }
    // this also causes an issue with an existing session time slot
    else if (startTime.isBefore(curStartTime) && endTime.isAfter(curStartTime)) {
      return false
    }

  }
  // otherwise return true
  return true

}
router.post("/addSession", async function (req, res, next) {
  try {
    // TODO perform some data validation
    console.log(req.body)
    try {
      // duration should be approximately between an hour and two hour. (uncertainity of 1 seconds )
      if (req.body.duration < 3599000 || req.body.duration > 2*3600000+1000 ){
        return res.status(406).json({
          error: "The duration of games should be more than an hour and less than 2 hours ",
        });
      }
      let sessionTimes = await database.findSessionByPitchIdAndDate(req.body.pitch_id, new Date(req.body.date))
      // couldnt find the session times 
      if (!sessionTimes || !Array.isArray(sessionTimes)){
        return 
      }
      var sortedTimes = sessionTimes.sort(compareDates)
      start_time = new moment(req.body.start_time, 'HH:mm:ss');
      end_time = new moment(req.body.end_time, 'HH:mm:ss');
      let confirmStatus = confirmValidityOfSessionTimes(sortedTimes, start_time, end_time)
      if (!confirmStatus) {
        return res.status(406).json({
          error: "Conflicting time slots to the date's session was given",
        });
      }
      // function that sort will use as a parameter 
      function compareDates(a, b) {
        var a1 = new moment(a.start_time, 'HH:mm:ss');
        var a2 = new moment(b.start_time, 'HH:mm:ss');
        if (a1.isAfter(a2)) {
          return 1
        }
        else {
          return -1
        }
      }
    } catch (err) {
      console.trace(err)
      return res.status(400).json({
        error: "Error adding session",
      });
    }


    let val1 = [
      req.body.pitch_id,
      req.body.name,
      getDate(req.body.date),
      req.body.start_time,
      req.body.end_time,
      req.body.duration,
      req.body.number_of_players
    ];
    let val2 = [req.body.player_id];

    console.log(" Date  ", new Date(req.body.date));
    let results = await database.addSession(val1, val2);

    console.info(results);

    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:sessionId/players", async (req, res, next) => {
  try {
    const pids = await database.findAllSessionPlayers(req.params.sessionId);
    res.status(200).json(pids);

  } catch (err) {
    next(err);
  }
});

router.put("/joinSession", authenticateToken, async function (req, res, next) {
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

router.put("/leaveSession", async function (req, res, next) {
  console.log(req.body);
  try {
    const results = await database.leaveSession({ sessionId: req.body.sessionId, playerId: req.body.playerId });
    res.status(200).json({
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

router.get("/:pitchId/:date/sessions/days", async function (req, res, next) {
  console.log(req.params.pitchId);

  try {
    const results = await database.findSessionByPitchIdByTwoDays(req.params.pitchId, new Date(req.params.date));
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
// show pitches - Address and description
router.get("/pitches", async function (req, res, next) {
  try {
    const results = await database.findPitches();
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }

});

router.get("/:pitchId", async function (req, res, next) {
  try {
    const results = await database.findPitchesById(req.params.pitchId);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }

});

// show pitches - instead of pitch id, it will be location in the future - like Bole
// date will also be start and end date instead of day of week
router.get("/pitches/:pitchId/:dayofweek", async function (req, res, next) {
  console.log(req.params.pitchId);
  console.log(req.params.dayofweek);

  try {
    const results = await database.findPitchByDayOfWeek(req.params.pitchId, req.params.dayofweek);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});
// show pitches - for the day of the week when specific location isnt supplied
// date might also be start and end date in the future maybe
router.get("/pitches/:dayofweek", async function (req, res, next) {
  console.log(req.params.dayofweek);

  try {
    const results = await database.findPitchesByDayOfWeek(req.params.dayofweek);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});


module.exports = router;
