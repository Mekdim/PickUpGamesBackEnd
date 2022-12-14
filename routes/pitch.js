const express = require("express");
const moment = require("moment");
const router = express.Router();
const database = require("../db/db");
const {
  getOpeningHours,
  buildSpecialOpeningHours,
  getOpeningHoursForPitch,
} = require("../service/openingHours");
const { getDate } = require("../util/time");
let authenticateToken = require("../Auth/authenticate");
const assert = require("assert");

function confirmValidityOfSessionTimes(currentSessionData, startTime, endTime) {
  for (let x = 0; x < currentSessionData.length; x++) {
    let curStartTime = new moment(currentSessionData[x].start_time, "HH:mm:ss");
    let curEndTime = new moment(currentSessionData[x].end_time, "HH:mm:ss");
    // then we can safely insert the session in this case
    if (
      curStartTime.isAfter(startTime) &&
      curStartTime.isSameOrAfter(endTime)
    ) {
      return true;
    } else if (
      startTime.isAfter(curStartTime) &&
      startTime.isSameOrAfter(curEndTime)
    ) {
      continue;
    }
    // it is inside allocated session time so this is invalid
    else if (
      startTime.isSameOrAfter(curStartTime) &&
      startTime.isBefore(curEndTime)
    ) {
      return false;
    }
    // this also causes an issue with an existing session time slot
    else if (
      startTime.isBefore(curStartTime) &&
      endTime.isAfter(curStartTime)
    ) {
      return false;
    }
  }
  return true;
}
router.post("/addSession", authenticateToken, async function (req, res, next) {
  try {
    // TODO perform some data validation
    console.log(req.body);
    try {
      // duration should be approximately between an hour and two hour. (uncertainity of 1 seconds )
      if (
        req.body.duration < 3599000 ||
        req.body.duration > 2 * 3600000 + 1000
      ) {
        return res.status(406).json({
          error:
            "The duration of games should be more than an hour and less than 2 hours ",
        });
      }
      let sessionTimes = await database.findSessionByPitchIdAndDate(
        req.body.pitch_id,
        new Date(req.body.date)
      );
      // couldnt find the session times
      if (!sessionTimes || !Array.isArray(sessionTimes)) {
        return;
      }
      let sortedTimes = sessionTimes.sort(compareDates);
      let start_time = new moment(req.body.start_time, "HH:mm:ss");
      let end_time = new moment(req.body.end_time, "HH:mm:ss");
      let confirmStatus = confirmValidityOfSessionTimes(
        sortedTimes,
        start_time,
        end_time
      );
      if (!confirmStatus) {
        return res.status(406).json({
          error: "Conflicting time slots to the date's session was given",
        });
      }
      // function that sort will use as a parameter
      function compareDates(a, b) {
        let a1 = new moment(a.start_time, "HH:mm:ss");
        let a2 = new moment(b.start_time, "HH:mm:ss");
        if (a1.isAfter(a2)) {
          return 1;
        } else {
          return -1;
        }
      }
    } catch (err) {
      console.trace(err);
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
      req.body.number_of_players,
    ];
    await database.addSession({
      values: val1,
      playerId: req.body.player_id,
    });
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/create", async (req, res, next) => {
  try {
    let value = [
      req.body.hostId,
      req.body.name,
      req.body.type,
      req.body.city,
      req.body.country,
      req.body.latitude,
      req.body.longitude,
      req.body.description,
      req.body.price,
      req.body.capacity,
    ];

    const formattedSpecialHours = buildSpecialOpeningHours(
      req.body?.specialHours?.raw
    );
    await database.addPitch({
      pitchDetails: value,
      openingHoursDetails: req.body.openingHours,
      specialDays: formattedSpecialHours,
      imageUrl: req.body.url,
    });
    res.status(201).json({
      status: "success",
    });
  } catch (e) {
    next(e);
  }
});

router.put("/updateDetails/:pitchId", async (req, res, next) => {
  try {
    const value = [
      req.body.name,
      req.body.description,
      req.body.price,
      req.body.capacity,
    ];

    await database.updatePitchDetails({
      pitchDetails: value,
      pitchId: req.params.pitchId,
    });
    res.status(201).json({
      status: "success",
    });
  } catch (e) {
    next(e);
  }
});

router.put("/updateLocation/:pitchId", async (req, res, next) => {
  try {
    const value = [req.body.latitude, req.body.longitude];

    await database.updatePitchLocation({
      pitchDetails: value,
      pitchId: req.params.pitchId,
    });
    res.status(201).json({
      status: "success",
    });
  } catch (e) {
    next(e);
  }
});

router.put("/updateType/:pitchId", async (req, res, next) => {
  try {
    const value = [req.body.type];

    await database.updatePitchType({
      pitchType: value,
      pitchId: req.params.pitchId,
    });
    res.status(201).json({
      status: "success",
    });
  } catch (e) {
    next(e);
  }
});

router.put("/updateUrl/:pitchId", async (req, res, next) => {
  try {
    const value = [req.body.url];

    await database.updatePitchUrl({
      pitchUrl: value,
      pitchId: req.params.pitchId,
    });
    res.status(201).json({
      status: "success",
    });
  } catch (e) {
    next(e);
  }
});

router.put("/updateHours/:pitchId", async (req, res, next) => {
  try {
    await database.updatePitchHours(req.body.hours);
    res.status(201).json({
      status: "success",
    });
  } catch (e) {
    next(e);
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
    await database.joinSession({
      sessionId: req.body.session_id,
      playerId: req.body.player_id,
    });
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
    await database.leaveSession({
      sessionId: req.body.sessionId,
      playerId: req.body.playerId,
    });
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/deleteSession/:sessionId", async function (req, res, next) {
  try {
    await database.deleteSession({
      sessionId: req.params.sessionId,
      playerId: req.body.playerId,
    });
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
    const results = await database.findSessionByPitchIdAndDate(
      req.params.pitchId,
      new Date(req.params.date)
    );
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

router.get("/:pitchId/:date/sessions/days", async function (req, res, next) {
  try {
    const results = await database.findSessionByPitchIdByTwoDays(
      req.params.pitchId,
      new Date(req.params.date)
    );
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

router.get("/:pitchId/:date/openingHours", async (req, res, next) => {
  try {
    const results = await getOpeningHours({
      pitchId: req.params.pitchId,
      date: new Date(req.params.date),
      database,
    });
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

router.get("/:pitchId/openingHours", async (req, res, next) => {
  try {
    const results = await getOpeningHoursForPitch(req.params.pitchId, database);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

router.get("/:pitchId/:date/all", async (req, res, next) => {
  try {
    let selectedDate = new Date(req.params.date);
    const events = await database.findSessionByPitchIdByTwoDays(
      req.params.pitchId,
      selectedDate
    );
    const hours = await getOpeningHours(
      req.params.pitchId,
      selectedDate,
      database
    );
    res.status(200).json([events, hours]);
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

// show events for pitches
router.get("/:pitchId/events", async function (req, res, next) {
  try {
    assert(req.query != null);
    assert(req.query.start != null);
    assert(req.query.end != null);
    assert(req.params.pitchId != null);
    // start date example format 2022-01-05T00:00:00-05
    let startDate = new moment(req.query.start).toDate();
    let endDate = new moment(req.query.end).toDate();
    function formatDate(date) {
      let d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    }
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const results = await database.findSessionByPitchIdForSpecifiedDates(
      req.params.pitchId,
      formattedStartDate,
      formattedEndDate
    );
    let modifiedResults = results.map((item) => {
      let st =
        new moment(item.date).format("YYYY-MM-DD") + "T" + item.start_time;
      let et = new moment(item.date).format("YYYY-MM-DD") + "T" + item.end_time;
      let isEditable = new moment(et).isSameOrAfter(new moment());

      return {
        start: st,
        title: item.name,
        end: et,
        extendedProps: {
          sessionId: item.id,
          name: item.name,
          players: item.number_of_players,
          date: item.date,
          startTime: item.start_time,
          endTime: item.end_time,
        },
        editable: isEditable,
      };
    });
    res.status(200).json(modifiedResults);
  } catch (err) {
    console.trace(err);
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

router.get("/featured", async function (req, res, next) {
  try {
    const results = await database.findPitchesWithImages();
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

router.get("/host/:hostId", authenticateToken, async function (req, res, next) {
  try {
    const results = await database.findPitchesForHost(req.params.hostId);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

router.get("/pitchData/:pitchId", async (req, res, next) => {
  try {
    const totalData = await database.findPitchData(req.params.pitchId);
    res.status(200).json(totalData);
  } catch (err) {
    next(err);
  }
});

// show pitches - instead of pitch id, it will be location in the future - like Bole
// date will also be start and end date instead of day of week
router.get("/pitches/:pitchId/:dayofweek", async function (req, res, next) {
  try {
    const results = await database.findPitchByDayOfWeek(
      req.params.pitchId,
      req.params.dayofweek
    );
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

// show pitches - for the day of the week when specific location isnt supplied
// date might also be start and end date in the future maybe
router.get("/pitches/:dayofweek", async function (req, res, next) {
  try {
    const results = await database.findPitchesByDayOfWeek(req.params.dayofweek);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
