
const mysql = require('mysql');

var db = mysql.createConnection({
  host: "sql8.freesqldatabase.com",
  user: "sql8579106",
  password: "5nRNcTh3IM",
  database: "sql8579106"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = {
	db
}