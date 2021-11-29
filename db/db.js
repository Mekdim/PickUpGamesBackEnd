const config = require("./config");
const { Pool } = require("pg");
const { ResultsNotFound, DatabaseError } = require("../error/Error");

class db {
  constructor(options) {
    this.pool = new Pool(options);
  }

  async addProfile(values) {
    const client = await this.pool.connect();
    const addProfileQuery = {
      text: 'INSERT INTO players (first_name, last_name, email, uid, phone_number) values($1, $2, $3, $4, $5) RETURNING  id',
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

  // Add profile picture for player of id x
  async addProfilePicture(values) {
    const client = await this.pool.connect();
    const addProfilePictureQuery = {
      text: 'INSERT INTO pictures (image_url, image_type, image_id ) values($1, $2, $3) RETURNING id',
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
      console.log("Error occurred when attempting to addProfilePicture ", error);
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

  //
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

  async getUsers () {

    const query = {
      text: "SELECT id, first_name, last_name, email FROM Players"
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


  async addSession(values, fields) {
    const client = await this.pool.connect();
    const sessionQuery = {
      text: "INSERT INTO Sessions (pitch_id, name, date, start_time, end_time, duration, number_of_players) values($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      values: [...values],
      rowMode: "array",
    };
    const sessionMembersQuery = {
      text: "INSERT INTO session_members (player_id, session_id) values($1, $2)",
      values: [...fields],
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

  async joinSession(val1, val2) {
    const client = await this.pool.connect();
    const sessionUpdate = {
      text: "UPDATE Sessions set number_of_players = number_of_players+1 where id=$1",
      values: [...val1],
      rowMode: "array",
    };
    const sessionMembersJoin = {
      text: "INSERT INTO session_members (player_id, session_id) values($1, $2)",
      values: [...val2],
      rowMode: "array",
    };

    try {
      client.query("BEGIN");
      const result1 = await client.query(sessionUpdate);
      const result2 = await client.query(sessionMembersJoin);
      await client.query("COMMIT");

      return [result1, result2.rows];
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
    const querySessions = {
      text: "SELECT * FROM Sessions WHERE id = $1",
      values: [sessionId],
    };

    const querySessionMembers = {
      text: "SELECT player_id FROM session_members WHERE session_id = $1",
      values: [sessionId],
    };
    const client = await this.pool.connect();
    try {
      const results = await client.query(querySessions);
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
      text: "SELECT * FROM Sessions WHERE pitch_id = $1 AND date_part('year',  date) = $2" +
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

  async findSessionByPitchIdByTwoDays(sessionId, date = new Date()) {

    let tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      let todayEvents, tomorrowsEvents;
      try {
        todayEvents = await this.findSessionByPitchIdAndDate(sessionId, date);
      } catch (todayError) {
        if (todayError.name === "ResultsNotFound") {
          todayEvents = [];
        }
      }

      try {
        tomorrowsEvents = await this.findSessionByPitchIdAndDate(sessionId, tomorrow);
      } catch (tomorrowError) {
        if (tomorrowError.name === "ResultsNotFound") {
          tomorrowsEvents = [];
        }
      }

      return [todayEvents, tomorrowsEvents];
    } catch (error) {
      if (error.name === "ResultsNotFound") {
        throw error;
      }
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
      console.log("no pitches to show")
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

async findPitchesById(pitchId) {

  const querySessions = {
    text: "SELECT * FROM pitch WHERE id = $1",
    values: [
      pitchId
    ],
  };

  const client = await this.pool.connect();
  try {
    const results = await client.query(querySessions);
    if (results.rows.length === 0) {
      // if no pitch is in the database it means there are no pitches to show
      console.log("no pitches to show")
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

// find pitch that is available the day of the week
async findPitchByDayOfWeek(pitchId, dayofweek) {
  const query = {
    text: "SELECT distinct on (pitch_id) pitch_id, address, description, image_url as src FROM openinghours INNER JOIN pitch on pitch.id = openinghours.pitch_id INNER JOIN pictures on pictures.image_id = pitch.id  WHERE openinghours.pitch_id = $1 AND dayofweek =$2 AND image_type=$3 ORDER BY pitch_id, pictures.created_at DESC",
    values: [
      pitchId,
      dayofweek,
      "PITCH_IMAGE"
    ],
  };
  const client = await this.pool.connect();
  try {
    const results = await client.query(query);
    console.log(results)
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
    text: "SELECT distinct on (pitch_id) pitch_id, address, description, image_url as src   FROM openinghours INNER JOIN pitch on pitch.id = openinghours.pitch_id INNER JOIN pictures on pictures.image_id = pitch.id  WHERE  dayofweek =$1 AND image_type=$2 ORDER BY pitch_id, pictures.created_at DESC",
    values: [
      dayofweek,
      "PITCH_IMAGE"
    ],
  };
  const client = await this.pool.connect();
  try {
    const results = await client.query(query);
    console.log(results)
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
    text: "SELECT player_id FROM session_members WHERE session_id = $1",
    values: [sessionId],
  };

  const client = await this.pool.connect();
  try {
    const results = await client.query(querySessionMembers);
    if (results.rows.length === 0) {
      throw new ResultsNotFound("No results found for supplied pitchId");
    }

    let playerIds = results.rows.map(value => {
      return value.player_id;
    });

    const queryPlayers= {
      text: "SELECT id, first_name FROM players WHERE id = ANY($1::INT[])",
      values: [playerIds],
    };

    const sessionMembers = await client.query(queryPlayers);

    return sessionMembers.rows;
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

  async notify({type, playerId, entityId}) {
    const client = await this.pool.connect();
    const notificationInsert = {
      text: "INSERT INTO Notifications (type, playerId, entityId) values($1, $2, $3) RETURNING id",
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


  async getNotification({playerId}) {
    const notificationFetch = {
      text: "Select * from Notifications where playerId = $1 AND seen = false ORDER BY updated_at DESC LIMIT 10",
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


}

const database = new db(config.database);

module.exports = database;
