const mysql = require("mysql2");

// Create a connection pool
const pool = mysql.createPool({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "Thewboy1!",
  database: "employee_database",
  connectionLimit: 10,
  waitForConnections: true,
});

// Promisify the pool query method
const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = query;
