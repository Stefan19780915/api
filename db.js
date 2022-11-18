
const mysql = require('mysql');

var db = mysql.createConnection({
  host: "localhost",
  user: "stefan",
  password: "password",
  database: "api"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = {
	db
}