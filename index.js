const mysql = require('mysql2');
const express = require('express');
const app = express();
const server = require("http").Server(app);
const ejs = require('ejs');
const io = require('socket.io')(server);

server.listen(5000, 'localhost');

app.set("views", "./views");

// create connection to db
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'MovingDB'
});

function getEmployeeInfo(){
  connection.query(
    'SELECT * FROM `Employee`',
    function(err, results, fields) {
      console.log(results); // results contains rows returned by server
    }
  );
}

function getEmployeeId(){
  var id = 0;
}

function insertEmployee(Fname, Lname, Position, Fid){ 
  connection.query(
    'SELECT COUNT(*) FROM `Employee`',
    function(err, results, fields) {
      id = results[0]["COUNT(*)"] + 1; // get Unique Employee Id
      connection.query(
        'INSERT INTO `Employee` (`EmployeeID`, `Fname`, `Lname`, `Position`, `FranchiseID`) VALUES (?, ?, ?, ?, ?)',
        [id, Fname, Lname, Position, Fid],
        (error, results) => {
          if (error) return "Error";
      });
  });
}



app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

// Home Page
app.get('/', function(req, res) {
  res.render("index");
});
