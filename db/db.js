const config = require("./config");
const { Pool } = require("pg");
const { ResultsNotFound, DatabaseError } = require("../error/Error");

class db {
  constructor(options) {
    this.pool = new Pool(options);
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
      sessionMembersQuery.values.push(result1.rows[0].id);
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

  async findSession(sessionId, date = new Date()) {
    //TODO add date to the query values too
    const query = {
      text: "SELECT * FROM Sessions WHERE pitch_id = $1",
      values: [sessionId],
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
