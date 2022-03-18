var express = require("express");
var router = express.Router();
const config = require("../db/config");
const { Pool } = require("pg");
const pool = new Pool(config.database);
const database = require("../db/db");
const { sender } = require("../module/mailer");
let authenticateToken = require("../Auth/authenticate");
/* GET users listing. */
router.get("/", async function (req, res, next) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [1]);
  res.send(rows);
});
router.post("/checkEmailExists", async function (req, res, next) {
  try {
    const results = await database.checkEmail(req.body.email);
    if (results.rows.length <= 0) {
      res.status(200).json({ emailExists: false });
    } else {
      res.status(200).json({ emailExists: true });
    }
  } catch (err) {
    console.log("Email check failed ", err);
    next(err);
  }
});
router.get("/getUserIds", authenticateToken, (req, res, next) => {
  res.status(201).json(req.user);
});
router.post("/addProfile", async function (req, res, next) {
  // Mark: validate if the req.body fields are not nil from the request - TODO
  let val1 = [
    req.body.first_name,
    req.body.last_name,
    req.body.email,
    req.body.uid,
    req.body.phone_number,
  ];
  try {
    // id is returned here
    let result = await database.addProfile(val1);
    res.status(201).json({
      id: result,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/confirmInvitationCode", async function (req, res, next) {
  // Mark: validate if the req.body fields are not nil from the request - TODO
  try {
    let existingCode = await database.confirmInvitationCodeExists(
      req.body.invitationcode
    );
    if (!existingCode.length || existingCode.length < 1) {
      return res.status(400).json({
        error: "The invitation code doesnt exist",
      });
    }
    res.status(200).json({
      status: "success! It exists",
    });
  } catch (err) {
    next(err);
  }
});

// check if user is eligible for free games (has invitation code that is active and not used)

router.post("/isUserEligibleForFreeGame", async function (req, res, next) {
  // Mark: validate if the req.body fields are not nil from the request - TODO
  try {
    let isUserEligible = await database.isUserEligibleForFreeGame(req.body.id);
    console.log(isUserEligible);
    if (!isUserEligible.length || isUserEligible.length < 1) {
      return res.status(400).json({
        error: "User is not eligble for free games",
      });
    }
    res.status(200).json({
      status: "True! User is eligible for free games",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/saveInvitationCode", async function (req, res, next) {
  // Mark: validate if the req.body fields are not nil from the request - TODO
  let val1 = [req.body.type, req.body.invitationcode, req.body.id];
  try {
    let existingCode = await database.confirmInvitationCodeExists(
      req.body.invitationcode
    );
    if (!existingCode.length || existingCode.length < 1) {
      return res.status(400).json({
        error: "The invitation code doesnt exist",
      });
    }
    let results = await database.addInvitationCodesForNewUsers(val1);
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    next(err);
  }
});
router.post("/addProfilePicture", async function (req, res, next) {
  // Mark: validate if the req.body fields are not nil from the request - TODO
  let val1 = [req.body.image_url, "PROFILE_IMAGE", req.body.image_id];
  try {
    let results = await database.addProfilePicture(val1);
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    next(err);
  }
});
// profilepicture, email and password should be changed separately
router.put(
  "/updateProfile",
  authenticateToken,
  async function (req, res, next) {
    // Mark: validate if the req.body fields are not nil from the request - TODO
    let val = [
      req.body.first_name,
      req.body.last_name,
      req.body.address,
      req.body.uid,
    ];
    try {
      let results = await database.updateProfile(val);
      res.status(201).json({
        status: "success",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/getProfilePicture/:id",
  authenticateToken,
  async function (req, res, next) {
    try {
      const results = await database.getProfilePicture(req.params.id);
      res.status(201).json(results);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/all", async function (req, res, next) {
  try {
    const results = await database.getUsers();
    res.status(201).json(results);
  } catch (err) {
    next(err);
  }
});

router.post("/invite/:sessionId", authenticateToken, async (req, res, next) => {
  res.json({ status: "success" });
  try {
    await sender({ list: req.body, sessionId: req.params.sessionId });
  } catch (error) {
    console.error("unable to send ", error);
  }
});

// MARK: not very great way of doing it but let it do. Authenticate maybe using jwt etc
router.get(
  "/getProfile/:uid",
  authenticateToken,
  async function (req, res, next) {
    try {
      const results = await database.getProfile(req.params.uid);
      res.status(201).json(results);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/notifications/:id", async function (req, res, next) {
  try {
    const results = await database.getNotification({ playerId: req.params.id });
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

router.put("/notifications/update/:id", async function (req, res, next) {
  try {
    await database.updateSingleNotification({ notificationId: req.params.id });
    res.status(200).json({ status: "success" });
  } catch (err) {
    next(err);
  }
});

router.put("/notifications/update", async function (req, res, next) {
  try {
    await database.updateMultipleNotification({ notifications: req.body.ids });
    res.status(200).json({ status: "success" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
