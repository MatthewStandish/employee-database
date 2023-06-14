const mysql = require("mysql2");
const util = require("util");

require("dotenv").config();
const connection = mysql.createConnection({
  host: "process.env.host",
  port: 3306,
  user: "process.env.username",
  password: "process.env.password",
  database: "process.env.database",
});
connection.connect();
connection.query = util.promisify(connection.query);
module.exports = connection;
