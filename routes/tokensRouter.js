// to put env variables from .env file
require('dotenv').config()
var express = require('express');
var router = express.Router();
const config = require('../db/config')
const { Pool } = require('pg')
const pool = new Pool(config.database)
const database = require("../db/db");
const jwt = require('jsonwebtoken');
let authenticateToken = require('../Auth/authenticate');

router.post('/logout', (req, res, next) => {
    const accessToken = req.body.accessToken
    if (accessToken == null) {
        return res.status(401).json("AccessToken is empty. Please send along a token")
    }
    try {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
            if (err) {
                try {
                    const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, { ignoreExpiration: true });
                    if (!payload || !payload.uid) {
                        res.status(400).json({
                            error: "Sorry We couldnt decode the payload from the refresh "
                        })
                        return
                    }
                    let results = await database.deleteRefreshTokens(payload.uid)
                    if (!results) {
                        res.status(400).json({
                            error: "Sorry We couldnt delete the refreshToken in the db"
                        })
                        return
                    }
                    return res.status(200).json("Successfully deleted the tokens")
                } catch (error) {
                    res.status(400).json({
                        error: "Sorry We couldnt decode the payload from the refresh "
                    })
                }

            }
            else {
                let results = await database.deleteRefreshTokens(user.uid)
                if (!results) {
                    res.status(400).json({
                        error: "Sorry We couldnt delete the refreshToken in the db"
                    })
                    return
                }
                return res.status(200).json("Successfully deleted the tokens")
            }



        })
    } catch (err) {
        console.log(err)
        next(err)
    }
});

router.post('/refreshTheToken', async (req, res, next) => {

    const refreshToken = req.body.refreshToken
    if (refreshToken == null) {
        return res.status(401).json({
            error: "Sorry the refresh token is empty"
        })
    }
    let results = await database.findRefreshToken(refreshToken)
    if (!results || results.length === 0) {
        res.status(400).json({
            error: "Sorry We couldnt get the refreshToken in the db. It could have been updated already. Logout and retry"
        })
        return
    }
    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) {
                console.log(err)
                return res.status(403).json({ "error": "refresh token may be expired or not valid" })
            }
            let userWithTokenUpdated = { firstname: user.firstname, lastname: user.lastname, uid: user.uid, id: user.id }
            const newaccessToken = generateAccessToken(userWithTokenUpdated)
            const newrefreshToken = generateRefreshToken(userWithTokenUpdated)
            let result1 = await database.updateRefreshToken(refreshToken, newrefreshToken, newaccessToken)
            if (!result1) {
                return res.status(400).json({ "error": "There was some error updating refresh Token" })
            }
            res.status(201).json({
                accessToken: newaccessToken,
                refreshToken: newrefreshToken,
                user: user

            })
        })
    } catch (err) {
        next(err)
    }

});


router.post('/login', async (req, res, next) => {

    // uid from react to get accesstoken at login
    const uid = req.body.uid
    if (!uid) {

        res.status(400).json({
            error: "Sorry the uid is empty"
        })
        return
    }
    let results = await database.getProfile(uid)
    if (!results || results.length != 1) {
        res.status(400).json({
            error: "Sorry We couldnt get the user info for this uid"
        })
        return

    }
    const firstname = results[0].first_name
    const lastname = results[0].last_name
    const email = results[0].email
    const phonenumber = results[0].phone_number
    const id = results[0].id
    const user = { firstname: firstname, lastname: lastname, id: id, uid: uid }
    try {
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)
        let val = [
            refreshToken,
            accessToken,
            uid
        ];
        // insert refresh token
        let result1 = await database.addRefreshToken(val);

        res.status(201).json({
            id: id,
            lastname: lastname,
            firstname: firstname,
            email: email,
            phonenumber: phonenumber,
            uid: uid,
            accessToken: accessToken,
            refreshToken: refreshToken

        })
    } catch (err) {
        next(err)
    }
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3600s'})
}
function generateRefreshToken(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '20000000s'})
}

module.exports = router;
