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
      text: 'INSERT INTO players (first_name, last_name, email, uid, phone_number) values($1, $2, $3, $4, $5) RETURNING id',
      values: [...values],
      rowMode: "array",
    };
    
    try {
      client.query("BEGIN");
      const result1 = await client.query(addProfileQuery);
      console.log(result1.rows[0].id);
      await client.query("COMMIT");

      return [result1];
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
    let tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    const query = {
      text: "SELECT * FROM Sessions WHERE pitch_id = $1 AND date between $2 and $3",
      values: [
        sessionId,
        date.toLocaleDateString(),
        tomorrow.toLocaleDateString(),
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
}

const database = new db(config.database);

module.exports = database;
