const mysql = require('mysql2');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require("http").Server(app);
const ejs = require('ejs');
const io = require('socket.io')(server);
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



app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

// Home Page
app.get('/', function(req, res) {
  res.render("schedule_job.ejs");
});
