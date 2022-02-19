const mysql = require('mysql2');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require("http").Server(app);
const ejs = require('ejs');
server.listen(5000, 'localhost');

app.set("views", "./views");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

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


app.post('/add', function(req,res){
  connection.query(
    'SELECT COUNT(*) FROM `ClientInfo`',
    function(err, results, fields) {
      var client_id = results[0]["COUNT(*)"] + 1; // get Unique Client Id
      connection.query(
        'INSERT INTO ClientInfo (ClientID,PhoneNumber,Email,Fname,Lname) VALUES(?, ?, ?, ?, ?)',
        [client_id, req.body.PhoneNumber, req.body.ClientEmail, req.body.ClientFname, req.body.ClientLname],
        (error, results) => {
          if (error) { console.log(error) };
          console.log("Client Added");
          connection.query(
            'SELECT COUNT(*) FROM `JobInfo`',
            function(err, results, fields) {
              var job_id = results[0]["COUNT(*)"] + 1; // get Unique Job Id
              connection.query(
                'INSERT INTO JobInfo (JobID,Day,Month,jYear,ClientID,OriginalCity,OriginalStreetAddress,DestinationCity,DestinationStreetAddress) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [job_id, req.body.MoveDay, req.body.MoveMonth, req.body.MoveYear, client_id, req.body.OriginalCity, req.body.OriginalStreet, req.body.DestinationCity, req.body.DestinationStreet],
                (error, results) => {
                  if (error) { console.log(error) };
                  console.log("Job Added");
              });
          });
      });
  });
});

app.post('/sortEmployees', function(req,res){
  var positions  = [];
  var franchises = [];
 
  if(req.body.movers     != undefined){ positions.push("Mover");   } 
  if(req.body.managers   != undefined){ positions.push("Manager"); } 
  if(req.body.lafayette  != undefined){ franchises.push(1);        } 
  if(req.body.batonrouge != undefined){ franchises.push(2);        } 
  if(req.body.neworleans != undefined){ franchises.push(3);        }
  var sql = 'SELECT * FROM Employee WHERE ';
  if(positions.length != 0){ 
    if(positions.length == 1){ sql = sql + 'Position="' + positions[0] + '"'; }
    else {
      for(var i = 0; i < positions.length; i++){
        sql = sql + 'Position="' + positions[i] + '"';
        if(i != (positions.length - 1)){ sql = sql + " OR "; }
      }
    }
  }
  if(franchises.length != 0){
    if(positions.length != 0){ sql = sql + " AND "; } 
    if(franchises.length == 1){ sql = sql + 'FranchiseID=' + franchises[0]; }
    else {
      for(var i = 0; i < franchises.length; i++){
        sql = sql + 'FranchiseID=' + franchises[i];
        if(i != (franchises.length - 1)){ sql = sql + " OR "; }
      }
    }
  }
  if(positions.length != 0 || franchises.length != 0){
    connection.query(sql, function (err, data, fields) {
      if (err) throw err;
      res.render("employees.ejs", {title: 'Employee List', employeeData: data} );
    })
  }
  if(positions.length == 0 && franchises.length == 0){
    var default_sql='SELECT * FROM Employee';
    connection.query(default_sql, function (err, data, fields) {
      if (err) throw err;
      res.render("employees.ejs", {title: 'Employee List', employeeData: data} );
    });
  }
});

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

// Home Page
app.get('/schedule', function(req, res) {
  res.render("schedule_job.ejs");
});

app.get('/', function(req, res) {
  var sql='SELECT * FROM Employee';
  connection.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render("employees.ejs", {title: 'Employee List', employeeData: data} );
  })
});
