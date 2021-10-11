const config = require("./config");
const { Pool } = require("pg");

class db {
  constructor(options) {
    this.pool = new Pool(options);
  }

  async addSession(values, fields) {
    const client = await this.pool.connect();
    const sessionQuery = {
      text: "INSERT INTO Sessions (pitch_id, start_time, end_time, duration, number_of_players,price) values($1, $2, $3, $4, $5, $6) RETURNING id",
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
      console.log("Error ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw error;
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
      console.log("Error ", error);
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.log("A rollback error occurred:", rollbackError);
      }
      throw error;
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
      return results.rows;
    } catch (error) {
      console.log("unable to query Sessions ", error);
      throw error;
    } finally {
      client.release();
    }
  }
}

const database = new db(config.database);

module.exports = database;
