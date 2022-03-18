const config = require("./config");
const { Pool } = require("pg");
const {
  ResultsNotFound,
  DatabaseError,
  ForbiddenAction,
} = require("../error/Error");
const { formatOpeningHours } = require("../service/openingHours");

class db {
  constructor(options) {
    if (process.env.NODE_ENV === "production") {
      console.log("production mode yee ");
      console.log(process.env.DATABASE_URL);
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });
    } else {
      this.pool = new Pool(options);
    }
  }

  async addProfile(values) {
    const client = await this.pool.connect();
    const addProfileQuery = {
      text: "INSERT INTO players (first_name, last_name, email, uid, phone_number) values($1, $2, $3, $4, $5) RETURNING  id",
      values: [...values],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      const result1 = await client.query(addProfileQuery);
      console.log(result1.rows[0][0]);
      await client.query("COMMIT");

      return result1.rows[0][0];
    } catch (error) {
      console.log("Error occurred when attempting to addProfile ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async checkEmail(email) {
    const client = await this.pool.connect();
    const checkEmailQuery = {
      text: "SELECT * FROM players WHERE email = $1",
      values: [email],
    };

    try {
      return await client.query(checkEmailQuery);
    } catch (error) {
      console.log("Error occurred when attempting to check email ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async confirmInvitationCodeExists(invitationCode) {
    const query = {
      text: "SELECT * FROM invitationcodes WHERE invitationcode = $1 AND type = $2",
      values: [invitationCode, "SENDER"],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(query);
      if (results.rows.length === 0) {
        return [];
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log(
        "Unable to query user inviation codes of senders/givers ",
        error
      );
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async isUserEligibleForFreeGame(playerId) {
    const query = {
      text: "SELECT * FROM invitationcodes WHERE playerid = $1 AND type = $2",
      values: [playerId, "RECEIVER"],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(query);
      if (results.rows.length === 0) {
        return [];
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log(
        "Unable to query user inviation codes for free games ",
        error
      );
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async addInvitationCodesForNewUsers(values) {
    const client = await this.pool.connect();
    const addInvitationCode = {
      text: "INSERT INTO invitationcodes (type, invitationcode, playerid) values($1, $2, $3) RETURNING  id",
      values: [...values],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      const result1 = await client.query(addInvitationCode);
      await client.query("COMMIT");

      return result1.rows[0][0];
    } catch (error) {
      console.log(
        "Error occurred when attempting to add invitation code ",
        error
      );
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  // Add profile picture for player of id x
  async addProfilePicture(values) {
    const client = await this.pool.connect();
    const addProfilePictureQuery = {
      text: "INSERT INTO pictures (image_url, image_type, image_id ) values($1, $2, $3) RETURNING id",
      values: [...values],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      const result1 = await client.query(addProfilePictureQuery);
      console.log(result1.rows[0].id);
      await client.query("COMMIT");

      return [result1];
    } catch (error) {
      console.log(
        "Error occurred when attempting to addProfilePicture ",
        error
      );
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async getProfile(uid) {
    const query = {
      text: "SELECT * FROM Players WHERE uid = $1",
      values: [uid],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(query);
      if (results.rows.length === 0) {
        throw new ResultsNotFound("No results found for supplied userId");
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query user profile details ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  //Mark: get image for profile pictures image id here is the id of the player
  async getProfilePicture(id) {
    const query = {
      text: "SELECT * FROM Players INNER JOIN pictures on Players.id = Pictures.image_id WHERE image_id = $1 AND image_type= $2 ORDER BY Pictures.created_at DESC",
      values: [id, "PROFILE_IMAGE"],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(query);
      if (results.rows.length === 0) {
        throw new ResultsNotFound("No results found for supplied userId");
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query User profile picture ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async getUsers() {
    const query = {
      text: "SELECT id, first_name, last_name, email FROM Players",
    };

    const client = await this.pool.connect();
    try {
      const results = await client.query(query);
      if (results.rows.length === 0) {
        throw new ResultsNotFound("No results found for supplied userId");
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query user profile details ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async updateProfile(val) {
    const client = await this.pool.connect();
    const upDateProfile = {
      text: "UPDATE players set first_name = $1, last_name= $2, address= $3 where uid=$4",
      values: [...val],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      const result1 = await client.query(upDateProfile);
      await client.query("COMMIT");

      return [result1];
    } catch (error) {
      console.log("Error occurred when attempting to Add profile ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async addSession({ values, playerId, sessionStatus = "Confirmed" }) {
    const client = await this.pool.connect();
    const sessionQuery = {
      text: "INSERT INTO Sessions (pitch_id, name, date, start_time, end_time, duration, number_of_players) values($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      values: [...values],
      rowMode: "array",
    };
    const sessionMembersQuery = {
      text: "INSERT INTO session_members (player_id, status, session_id) values($1, $2, $3)",
      values: [playerId, sessionStatus],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      const result1 = await client.query(sessionQuery);
      sessionMembersQuery.values.push(result1.rows[0][0]);
      const result2 = await client.query(sessionMembersQuery);
      await client.query("COMMIT");

      return [result1, result2.rows];
    } catch (error) {
      console.log("Error occurred when attempting to addSession ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async addPitch({ pitchDetails, openingHoursDetails, specialDays, imageUrl }) {
    const client = await this.pool.connect();
    const createPitch = {
      text:
        "INSERT INTO Pitch " +
        "(host_id, name, type, city, country, latitude, longitude, description, price, capacity)" +
        " values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id",
      values: [...pitchDetails],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      const pitchData = await client.query(createPitch);
      let openHours = formatOpeningHours(
        openingHoursDetails,
        pitchData.rows[0][0]
      );

      let specialHours = specialDays.map((row) => {
        row.unshift(pitchData.rows[0][0]);
        return row;
      });

      openHours.map(async (value) => {
        const createOpeningHours = {
          text: "INSERT INTO openinghours (pitch_id, dayOfWeek, enabled, start_time, end_time) values($1, $2, $3, $4, $5) RETURNING id",
          values: [...value],
          rowMode: "array",
        };
        await client.query(createOpeningHours);
      });

      specialHours.map(async (value) => {
        const createSpecialHours = {
          text: "INSERT INTO specialopeninghours (pitch_id, date, open, start_time, end_time) values($1, $2, $3, $4, $5) RETURNING id",
          values: [...value],
          rowMode: "array",
        };
        await client.query(createSpecialHours);
      });

      const addPitchImage = {
        text: "INSERT INTO pictures (image_url, image_type, image_id ) values($1, $2, $3) RETURNING id",
        values: [imageUrl, "PITCH_IMAGE", pitchData.rows[0][0]],
        rowMode: "array",
      };

      await client.query(addPitchImage);

      await client.query("COMMIT");

      return [pitchData];
    } catch (error) {
      console.log("Error occurred when attempting to addPitch ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async updatePitchDetails({ pitchDetails, pitchId }) {
    const client = await this.pool.connect();
    const updatePitch = {
      text: "UPDATE pitch set name = $1, description = $2, price = $3, capacity = $4 WHERE id=$5",
      values: [...pitchDetails, pitchId],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      await client.query(updatePitch);
      await client.query("COMMIT");
    } catch (error) {
      console.log("Error occurred when attempting to addPitch ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async updatePitchLocation({ pitchDetails, pitchId }) {
    const client = await this.pool.connect();
    const updatePitch = {
      text: "UPDATE pitch set latitude = $1, longitude = $2 WHERE id=$3",
      values: [...pitchDetails, pitchId],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      await client.query(updatePitch);
      await client.query("COMMIT");
    } catch (error) {
      console.log("Error occurred when updating pitch location ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async updatePitchType({ pitchType, pitchId }) {
    const client = await this.pool.connect();
    const updatePitch = {
      text: "UPDATE pitch set type = $2 WHERE id=$1",
      values: [pitchId, ...pitchType],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      await client.query(updatePitch);
      await client.query("COMMIT");
    } catch (error) {
      console.log(
        "Error occurred when attempting to update pitch type ",
        error
      );
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async updatePitchUrl({ pitchUrl, pitchId }) {
    const client = await this.pool.connect();
    const updatePitchUrl = {
      text: "UPDATE pictures set image_url = $2 WHERE image_id=$1",
      values: [pitchId, ...pitchUrl],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      await client.query(updatePitchUrl);
      await client.query("COMMIT");
    } catch (error) {
      console.log(
        "Error occurred when attempting to update pitch type ",
        error
      );
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async updatePitchHours(hours) {
    hours.map(async (hour) => {
      await this.updatePitchHour(hour);
    });
  }

  async updatePitchHour(hour) {
    const client = await this.pool.connect();
    const updatePitchHours = {
      text: "UPDATE openinghours set  start_time = $2, end_time = $3, enabled = $4 WHERE id=$1",
      values: [...hour],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      await client.query(updatePitchHours);
      await client.query("COMMIT");
    } catch (error) {
      console.log(
        "Error occurred when attempting to update pitch type ",
        error
      );
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async joinSession({ sessionId, playerId, sessionStatus = "Confirmed" }) {
    const client = await this.pool.connect();
    const sessionUpdate = {
      text: "UPDATE Sessions set number_of_players = number_of_players+1 where id=$1",
      values: [sessionId],
      rowMode: "array",
    };

    const sessionMembersJoin = {
      text: "INSERT INTO session_members (player_id, session_id, status) values($1, $2, $3)",
      values: [playerId, sessionId, sessionStatus],
      rowMode: "array",
    };

    const queryForCurrentPlayers = {
      text: "SELECT * FROM session_members WHERE player_id = $1 and session_id = $2",
      values: [playerId, sessionId],
    };

    try {
      client.query("BEGIN");
      const currentMembers = await client.query(queryForCurrentPlayers);
      if (currentMembers.rows.length === 0) {
        // Not a member or invited
        const result1 = await client.query(sessionUpdate);
        const result2 = await client.query(sessionMembersJoin);
        await client.query("COMMIT");
        return [result1, result2.rows];
      }

      if (currentMembers.rows.length > 1) {
        //TODO we have an error figure out
        // one user has joined or been invited to
        return;
      }

      let player = currentMembers.rows[0];
      if (player.status === "Confirmed") {
        // do nothing user is already a participant
        return;
      }
      const sessionMembersUpdate = {
        text: "UPDATE session_members set status = $2 where id=$1",
        values: [player.id, "Confirmed"],
        rowMode: "array",
      };

      const updatedSession = await client.query(sessionUpdate);
      const updatedSessionMembers = await client.query(sessionMembersUpdate);
      await client.query("COMMIT");
      return [updatedSession, updatedSessionMembers.rows];
    } catch (error) {
      console.log("Error occurred when attempting to joinSession ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async inviteToSession({ sessionId, playerId, sessionStatus = "Invited" }) {
    const client = await this.pool.connect();
    const findSessionMember = {
      text: "Select player_id as id FROM session_members WHERE player_id = $1 and session_id = $2",
      values: [playerId, sessionId],
    };

    const sessionMembersJoin = {
      text: "INSERT INTO session_members (player_id, session_id, status) values($1, $2, $3)",
      values: [playerId, sessionId, sessionStatus],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      const result = await client.query(findSessionMember);
      if (result.rows.length === 0) {
        const result2 = await client.query(sessionMembersJoin);
        await client.query("COMMIT");
        return [result2.rows];
      }
      await client.query("COMMIT");
      return [];
    } catch (error) {
      console.log("Error occurred when attempting to joinSession ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async leaveSession({ sessionId, playerId }) {
    const client = await this.pool.connect();
    const sessionUpdate = {
      text: "UPDATE Sessions set number_of_players = number_of_players-1 where id=$1",
      values: [sessionId],
    };
    const sessionMembersRemove = {
      text: "DELETE FROM session_members WHERE player_id = $1 AND session_id = $2",
      values: [playerId, sessionId],
    };

    const sessionMemberCheck = {
      text: "SELECT player_id, status FROM session_members WHERE session_id = $1 AND player_id = $2",
      values: [sessionId, playerId],
    };

    try {
      client.query("BEGIN");
      const result = await client.query(sessionMemberCheck);
      if (result.rows.length <= 0) {
        throw new ForbiddenAction("You are not a Member!");
      }
      let player = result.rows[0];
      if (player.status === "Confirmed") {
        const result1 = await client.query(sessionUpdate);
      }
      const result2 = await client.query(sessionMembersRemove);
      await client.query("COMMIT");
    } catch (error) {
      console.log("Unable to leaveSession ", error);
      if (error.name === "ForbiddenAction") {
        throw error;
      }
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async deleteSession({ sessionId, playerId }) {
    const client = await this.pool.connect();
    const sessionUpdate = {
      text: "DELETE FROM Sessions WHERE id=$1",
      values: [sessionId],
    };
    const sessionMembersRemove = {
      text: "DELETE FROM session_members WHERE session_id = $1",
      values: [sessionId],
    };

    const sessionMemberCheck = {
      text: "SELECT player_id FROM session_members WHERE session_id = $1",
      values: [sessionId],
    };

    try {
      client.query("BEGIN");
      const result = await client.query(sessionMemberCheck);
      if (result.rows.length > 1) {
        throw new ForbiddenAction("There are other players!");
      }
      if (Number(result.rows[0].player_id) !== Number(playerId)) {
        throw new ForbiddenAction("You are not a member!");
      }
      await client.query(sessionMembersRemove);
      await client.query(sessionUpdate);
      await client.query("COMMIT");
    } catch (error) {
      console.log("Error occurred when attempting to deleteSession ", error);

      if (error.name === "ForbiddenAction") {
        throw error;
      }
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  // find sessions for a pitch for specified date
  async findSessionByPitchIdForSpecifiedDates(pitchId, startDate, endDate) {
    // inclusive of start date and endDate
    const querySessions = {
      text: "SELECT * FROM Sessions WHERE pitch_id = $1 AND DATE(date) >= $2 AND DATE(date) <= $3",
      values: [pitchId, startDate, endDate],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(querySessions);
      if (results.rows.length === 0) {
        throw new ResultsNotFound(
          "No results found for supplied pitchId and specified dates"
        );
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findSessionByPitchId(pitchId) {
    const querySessions = {
      text: "SELECT * FROM Sessions WHERE pitch_id = $1",
      values: [pitchId],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(querySessions);
      if (results.rows.length === 0) {
        throw new ResultsNotFound("No results found for supplied pitchId");
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findSessionBySessionId(sessionId) {
    const joinedQuery = {
      text: "SELECT Sessions.id as id, pitch_id, pitch.name as pitch_name, city ,Sessions.name as name, number_of_players, date, start_time, end_time, price, capacity FROM Sessions INNER JOIN pitch on pitch.id = Sessions.pitch_id WHERE Sessions.id = $1",
      values: [sessionId],
    };

    const querySessionMembers = {
      text: "SELECT player_id, status FROM session_members WHERE session_id = $1",
      values: [sessionId],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(joinedQuery);
      if (results.rows.length === 0) {
        throw new ResultsNotFound("No results found for supplied pitchId");
      }

      const sessionMembers = await client.query(querySessionMembers);
      let values = results.rows[0];
      values.players = sessionMembers.rows;
      return values;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findSessionByPitchIdAndDate(sessionId, date = new Date()) {
    const query = {
      text:
        "SELECT * FROM Sessions WHERE pitch_id = $1 AND date_part('year',  date) = $2" +
        "  AND date_part('month', date) = $3 AND  date_part('day', date) = $4",
      values: [
        sessionId,
        date.getFullYear(),
        date.getMonth() + 1, // because .getMonth() is 0 indexed
        date.getDate(),
      ],
    };

    const client = await this.pool.connect();
    try {
      const results = await client.query(query);
      if (results.rows.length === 0) {
        // this could also mean there just were no sessions for that date so dont throw
        return [];
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findSessionByPitchIdByTwoDays(sessionId, date = new Date()) {
    let tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      let todayEvents, tomorrowsEvents, thirdDayEvents, forthDayEvents;
      try {
        todayEvents = await this.findSessionByPitchIdAndDate(sessionId, date);
      } catch (todayError) {
        if (todayError.name === "ResultsNotFound") {
          todayEvents = [];
        }
      }

      try {
        tomorrowsEvents = await this.findSessionByPitchIdAndDate(
          sessionId,
          tomorrow
        );
      } catch (tomorrowError) {
        if (tomorrowError.name === "ResultsNotFound") {
          tomorrowsEvents = [];
        }
      }

      try {
        let thirdDay = new Date(date);
        thirdDay.setDate(thirdDay.getDate() + 2);
        thirdDayEvents = await this.findSessionByPitchIdAndDate(
          sessionId,
          thirdDay
        );
      } catch (tomorrowError) {
        if (tomorrowError.name === "ResultsNotFound") {
          thirdDayEvents = [];
        }
      }

      try {
        let fourthDay = new Date(date);
        fourthDay.setDate(fourthDay.getDate() + 3);
        forthDayEvents = await this.findSessionByPitchIdAndDate(
          sessionId,
          fourthDay
        );
      } catch (tomorrowError) {
        if (tomorrowError.name === "ResultsNotFound") {
          forthDayEvents = [];
        }
      }
      return [todayEvents, tomorrowsEvents, thirdDayEvents, forthDayEvents];
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    }
  }

  async findOpeningHoursByPitchIdAndDay(pitchId, dayOfWeek) {
    const query = {
      text: "SELECT * FROM openinghours WHERE pitch_id = $1 AND dayofweek = $2",
      values: [pitchId, dayOfWeek],
    };

    const client = await this.pool.connect();
    try {
      const results = await client.query(query);
      if (results.rows.length === 0) {
        // this could also mean there just were no sessions for that date so dont throw
        return [];
      }
      return results.rows;
    } catch (error) {
      console.log("Unable to query openinghours ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findOpeningHoursByPitchIdForDays(pitchId, dayOfWeeks) {
    try {
      let todayOpeningHours,
        tomorrowsOpeningHours,
        thirdDayOpeningHours,
        forthDayOpeningHours;
      try {
        todayOpeningHours = await this.findOpeningHoursByPitchIdAndDay(
          pitchId,
          dayOfWeeks[0]
        );
      } catch (todayError) {
        if (todayError.name === "ResultsNotFound") {
          todayOpeningHours = [];
        }
      }

      try {
        tomorrowsOpeningHours = await this.findOpeningHoursByPitchIdAndDay(
          pitchId,
          dayOfWeeks[1]
        );
      } catch (tomorrowError) {
        if (tomorrowError.name === "ResultsNotFound") {
          tomorrowsOpeningHours = [];
        }
      }

      try {
        thirdDayOpeningHours = await this.findOpeningHoursByPitchIdAndDay(
          pitchId,
          dayOfWeeks[2]
        );
      } catch (tomorrowError) {
        if (tomorrowError.name === "ResultsNotFound") {
          thirdDayOpeningHours = [];
        }
      }

      try {
        forthDayOpeningHours = await this.findOpeningHoursByPitchIdAndDay(
          pitchId,
          dayOfWeeks[3]
        );
      } catch (tomorrowError) {
        if (tomorrowError.name === "ResultsNotFound") {
          forthDayOpeningHours = [];
        }
      }
      return [
        todayOpeningHours,
        tomorrowsOpeningHours,
        thirdDayOpeningHours,
        forthDayOpeningHours,
      ];
    } catch (error) {
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    }
  }

  // find all pitches with address and description and id
  async findPitches() {
    const querySessions = {
      text: "SELECT * FROM pitch ",
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(querySessions);
      if (results.rows.length === 0) {
        // if no pitch is in the database it means there are no pitches to show
        console.log("no pitches to show");
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findPitchesForHost(hostId) {
    const queryPitches = {
      text: "SELECT distinct on (pitch.id) pitch.id, price, capacity ,address, name ,description, image_url as src FROM pitch INNER JOIN pictures on pictures.image_id = pitch.id  WHERE pictures.image_type = $1 AND pitch.host_id = $2 ORDER BY pitch.id",
      values: ["PITCH_IMAGE", hostId],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(queryPitches);
      return results.rows;
    } catch (error) {
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findPitchesWithImages() {
    const queryPitches = {
      text: "SELECT distinct on (pitch.id) pitch.id, price, capacity ,address, name ,description, image_url as src FROM pitch INNER JOIN pictures on pictures.image_id = pitch.id  WHERE pictures.image_type = $1 ORDER BY pitch.id, pictures.created_at DESC",
      values: ["PITCH_IMAGE"],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(queryPitches);
      return results.rows;
    } catch (error) {
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findPitchesById(pitchId) {
    const querySessions = {
      text: "SELECT pitch.id, host_id, name, description, capacity, price, type, city, country, latitude, longitude, image_url, image_id  FROM pitch INNER JOIN pictures on pictures.image_id = pitch.id WHERE pitch.id = $1 AND pictures.image_type = $2",
      values: [pitchId, "PITCH_IMAGE"],
    };

    const client = await this.pool.connect();
    try {
      const results = await client.query(querySessions);
      if (results.rows.length === 0) {
        throw new ResultsNotFound();
      }
      return results.rows[0];
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findOpeningHoursForPitch(pitchId) {
    const querySessions = {
      text: "SELECT id, dayofweek, enabled, start_time, end_time FROM openinghours WHERE pitch_id = $1",
      values: [pitchId],
    };

    const client = await this.pool.connect();
    try {
      const results = await client.query(querySessions);
      return results.rows;
    } catch (error) {
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findPitchData(pitchId) {
    try {
      const pitchData = await this.findPitchesById(pitchId);
      pitchData.openingHours = await this.findOpeningHoursForPitch(pitchId);
      return pitchData;
    } catch (error) {
      console.error("PitchData not found", error);
      throw error;
    }
  }

  // find pitch that is available the day of the week
  async findPitchByDayOfWeek(pitchId, dayofweek) {
    const query = {
      text: "SELECT distinct on (pitch_id) pitch_id, price, capacity ,address, name, latitude, longitude ,description, image_url as src FROM pitch INNER JOIN openinghours on openinghours.pitch_id = pitch.id INNER JOIN pictures on pictures.image_id = pitch.id  WHERE openinghours.pitch_id = $1 AND dayofweek =$2 AND image_type=$3 ORDER BY pitch_id, pictures.created_at DESC",
      values: [pitchId, dayofweek, "PITCH_IMAGE"],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(query);
      if (results.rows.length === 0) {
        // dont throw. just means the pitch is not open that day of week
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  // find pitches
  async findPitchesByDayOfWeek(dayofweek) {
    const query = {
      text: "SELECT distinct on (pitch_id) pitch_id, name, price, capacity ,address, latitude, longitude ,description, image_url as src   FROM openinghours INNER JOIN pitch on pitch.id = openinghours.pitch_id INNER JOIN pictures on pictures.image_id = pitch.id  WHERE  dayofweek =$1 AND image_type=$2 ORDER BY pitch_id, pictures.created_at DESC",
      values: [dayofweek, "PITCH_IMAGE"],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(query);
      if (results.rows.length === 0) {
        // it means it is just empty - no open pitches were found for that day of the week
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findAllSessionPlayers(sessionId) {
    const querySessionMembers = {
      text: "SELECT player_id as id, status, first_name FROM session_members INNER JOIN players on session_members.player_id = players.id WHERE session_id = $1",
      values: [sessionId],
    };

    const client = await this.pool.connect();
    try {
      const results = await client.query(querySessionMembers);
      if (results.rows.length === 0) {
        throw new ResultsNotFound("No results found for supplied pitchId");
      }

      // let playerIds = results.rows.map(value => {
      //   return value.player_id;
      // });
      //
      // const queryPlayers= {
      //   text: "SELECT id, first_name FROM players WHERE id = ANY($1::INT[])",
      //   values: [playerIds],
      // };
      //
      // const sessionMembers = await client.query(queryPlayers);

      // return sessionMembers.rows;
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async notify({ type, playerId, entityId }) {
    const client = await this.pool.connect();
    const notificationInsert = {
      text: "INSERT INTO Notifications (type, playerid, entityid) values($1, $2, $3) RETURNING id",
      values: [type, playerId, entityId],
    };

    try {
      client.query("BEGIN");
      const result = await client.query(notificationInsert);
      await client.query("COMMIT");

      return result;
    } catch (error) {
      console.log("Error occurred when attempting to add notification ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async getNotification({ playerId }) {
    const notificationFetch = {
      text: "Select * from Notifications WHERE playerId = $1 AND seen = false ORDER BY updated_at DESC LIMIT 10",
      values: [playerId],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(notificationFetch);
      return results.rows;
    } catch (error) {
      console.log("Unable to query notifications ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async updateSingleNotification({ notificationId }) {
    const client = await this.pool.connect();
    const updateNotification = {
      text: "UPDATE Notifications SET seen=TRUE WHERE id=$1",
      values: [notificationId],
    };

    try {
      client.query("BEGIN");
      let result = await client.query(updateNotification);
      await client.query("COMMIT");
    } catch (error) {
      console.log(
        "Error occurred when attempting to update notification ",
        error
      );
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async updateMultipleNotification({ notifications }) {
    const client = await this.pool.connect();
    const updateNotification = {
      text: "UPDATE Notifications SET seen=TRUE WHERE id = ANY ($1)",
      values: [notifications],
    };

    try {
      client.query("BEGIN");
      await client.query(updateNotification);
      await client.query("COMMIT");
    } catch (error) {
      console.log(
        "Error occurred when attempting to update notification ",
        error
      );
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  // Add refreshToken and accesstoken
  async addRefreshToken(values) {
    const client = await this.pool.connect();
    const addRefreshTokenQuery = {
      text: "INSERT INTO Tokens (refreshToken, accessToken, uid) values($1, $2, $3) RETURNING id",
      values: [...values],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      const result1 = await client.query(addRefreshTokenQuery);

      await client.query("COMMIT");

      return result1;
    } catch (error) {
      console.log("Error occurred when attempting to addRefreshToken ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async findRefreshToken(refreshToken) {
    const querySessions = {
      text: "SELECT * FROM tokens WHERE refreshToken = $1",
      values: [refreshToken],
    };

    const client = await this.pool.connect();
    try {
      const results = await client.query(querySessions);
      if (results.rows.length === 0) {
        console.trace("The refresh token doesnt exist in the database");
      }
      return results.rows;
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
      console.log("Unable to query Sessions ", error);
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  async updateRefreshToken(oldRefreshToken, newRefreshToken, newaccessToken) {
    const client = await this.pool.connect();
    const updateRefreshToken = {
      text: "UPDATE Tokens SET refreshToken=$1 , accessToken= $2 WHERE refreshToken=$3",
      values: [newRefreshToken, newaccessToken, oldRefreshToken],
    };

    try {
      client.query("BEGIN");
      let result = await client.query(updateRefreshToken);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      console.log(
        "Error occurred when attempting to update refreshToken ",
        error
      );
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }

  // delete refresh tokens for user uid
  async deleteRefreshTokens(uid) {
    const client = await this.pool.connect();
    const updateRefreshToken = {
      text: "DELETE FROM Tokens  WHERE uid=$1",
      values: [uid],
    };

    try {
      client.query("BEGIN");
      let result = await client.query(updateRefreshToken);

      await client.query("COMMIT");
      return result;
    } catch (error) {
      console.log(
        "Error occurred when attempting to update refreshToken ",
        error
      );
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw new DatabaseError("Oops there seems to be some database error");
    } finally {
      client.release();
    }
  }
}

const database = new db(config.database);

module.exports = database;
