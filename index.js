const mysql = require('mysql2');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require("http").Server(app);
const ejs = require('ejs'); server.listen(5000, 'localhost');
const util = require('util');

app.set("views", "./views");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

// create connection to db
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'MoveDB'
});

// Generate client and job information
/*
const { faker } = require('@faker-js/faker');

function getRandomMonthInt(month){
  var m = 0;
  switch (month) {
    case 'Jan':
      m = 1;
      break;
    case 'Feb':
      m = 2;
      break;
    case 'Mar':
      m = 3;
      break;
    case 'Apr':
      m = 4;
      break;
    case 'May':
      m = 5;
      break;
    case 'Jun':
      m = 6;
      break;
    case 'Jul':
      m = 7;
      break;
    case 'Aug':
      m = 8;
      break;
    case 'Sep':
      m = 9;
      break;
    case 'Oct':
      m = 10;
      break;
    case 'Nov':
      m = 11;
      break;
    case 'Dec':
      m = 12;
      break;
    default:
      m = 1;
  }
  return m;
}

function getAddressNumber(){
  return Math.floor(Math.random() * 750);
}

function emailService(){
  var services = ["@gmail.com", "@outlook.com", "@yahoo.com"];
  var min = Math.ceil(0);
  var max = Math.floor(3);
  var rand = Math.floor(Math.random() * (max - min) + min);
  return services[rand];
}

function LaCity(){
  var cities = ["New Orleans", "Baton Rouge", "Shreveport", "Metairie", "Lafayette", "Lake Charles", "Kenner", "Bossier City", "Monroe", "Alexandria", "Houma", "Prairieville"];
  var max = Math.floor(cities.length - 1);
  var min = Math.ceil(0);
  var rand = Math.floor(Math.random() * (max - min) + min);
  return cities[rand];
}

function randomFranchise(){
  var max = Math.floor(4);
  var min = Math.ceil(1);
  var rand = Math.floor(Math.random() * (max - min) + min);
  return rand;
}

for(var i = 0; i < 350; i++){
  var fName = faker.name.firstName();
  var lName = faker.name.lastName();
  var number = faker.phone.phoneNumberFormat();
  var originalStreet = getAddressNumber() + " " + faker.address.streetName();
  var destinationStreet = getAddressNumber() + " " + faker.address.streetName();
  var date = faker.date.between("2019-01-01", "2022-05-15").toString().split(" ");
  var month = getRandomMonthInt(date[1]);
  var email = fName+lName+emailService();
  var day = parseInt(date[2]);
  var year = parseInt(date[3]);
  var originalCity = LaCity();
  var destinationCity = LaCity();

  const query = util.promisify(connection.query).bind(connection);
  (async () => {
    try {
      connection.query(
        'INSERT INTO ClientInfo (PhoneNumber,Email,Fname,Lname) VALUES(?, ?, ?, ?)',
        [number, email, fName, lName],
        (error, results) => {
          if (error) { console.log(error) };
      }); 
    } finally { 
      console.log("Finished insert.")
    }
  })();

  var mSQL='SELECT ClientID FROM `ClientInfo` WHERE `PhoneNumber`="'+number+'"';
  connection.query(
    mSQL,
    (error, data) => {
      if (error) { console.log(error) };
      var client_id = data[0]["ClientID"];
      connection.query(
        'INSERT INTO JobInfo (ClientID,Day,Month,jYear,OriginalCity,OriginalStreetAddress,DestinationCity,DestinationStreetAddress,FranchiseID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [client_id, day, month, year, originalCity, originalStreet, destinationCity, destinationStreet, randomFranchise()],
        (error, results) => {
          if (error) { console.log(error) };
          console.log("Job Added");
      });
    }
  );
}       
*/


// Check if the date is valid during when scheduling
// TODO check for valid month and day of a valid month
function validDate(Day, Month, year){
  var validDate = true;
  var currentYear = new Date().getFullYear();
  // Must be currentYear or next year
  if(year != currentYear && year != (currentYear + 1)){
    validDate = false;
  }
  return validDate;
}


// Adds a client to the ClientInfo table and adds job information to the JobInfo table.
// is used from "localhost:5000/schedule"
app.post('/add', function(req,res){
  if(validDate(req.body.MoveDay, req.body.MoveMonth, req.body.MoveYear) == false){
    const data = new Object();
    data.error = "  Invalid Date";
    res.render("schedule_conflict.ejs", { title: 'schedule-conflict', employeeData: data } );
  }
  else {
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
  }
});

// SQL Can be Improved
app.get("/employees", function(req,res){
  var sql = "SELECT * FROM Employee ORDER BY FranchiseID ASC";
    connection.query(
      sql,
      (error, data) => {
        if (error) { console.log(error) };
        res.render("employees.ejs", { title: 'employee-data', employeeData: data } );
    });
});

// Receives sorting parameters to sort employees on the employees page
// TODO 
// - If submitted without any sorting parameters, it should return employees
//   sorted by FranchiseID in ascending order.
// - html/css need work.
app.post('/sortEmployees', function(req,res){
  var positions  = [];
  var franchises = [];
 
  if(req.body.movers     != undefined){ positions.push("Mover");   } 
  if(req.body.managers   != undefined){ positions.push("Manager"); } 
  if(req.body.lafayette  != undefined){ franchises.push(1);        } 
  if(req.body.batonrouge != undefined){ franchises.push(2);        } 
  if(req.body.neworleans != undefined){ franchises.push(3);        }
  // Form SQL
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

// Receives job sorting parameters, forms sql syntax, executes sql and returns results to jobs page.
app.post('/sortJobs', function(req,res){
  var franchises = []; 
  if(req.body.lafayette  != undefined){ franchises.push(1);        } 
  if(req.body.batonrouge != undefined){ franchises.push(2);        } 
  if(req.body.neworleans != undefined){ franchises.push(3);        }
  var sql = 'SELECT Month, Day, jYear, OriginalStreetAddress, OriginalCity, DestinationStreetAddress, DestinationCity FROM JobInfo ';
  if(franchises.length != 0){
    sql = sql + 'WHERE ';
    if(franchises.length == 1){ sql = sql + 'FranchiseID=' + franchises[0]; }
    else {
      for(var i = 0; i < franchises.length; i++){
        sql = sql + 'FranchiseID=' + franchises[i];
        if(i != (franchises.length - 1)){ sql = sql + " OR "; }
      }
    }
  }
  var selected_month = req.body.month;
  var selected_year = req.body.year;
  // selected_month or selected_year being equal to '0' means that they not changed from 
  // the default value of showing all months and years.
  if(franchises.length == 0 && (selected_month != '0' || selected_year != '0')){
    sql = sql + 'WHERE ';
    if(selected_year != '0'){
      sql = sql + 'jYear=' + selected_year;
    }
    if(selected_month != '0' && selected_year != '0'){
      sql = sql + ' AND Month=' + selected_month;   
    }
    if(selected_month != '0' && selected_year == '0'){
      sql = sql + ' Month=' + selected_month;   
    }
  }
  if(franchises.length > 0 && (selected_month != '0' || selected_year != '0')){
    if(selected_year != '0'){ sql = sql + ' AND jYear=' + selected_year; }
    if(selected_month != '0'){ sql = sql + ' AND Month=' + selected_month; }
  }

  sql = sql + ' ORDER BY jYear DESC, Month DESC, Day DESC';
  connection.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render("jobs.ejs", {title: 'Employee List', employeeData: data} );
  })
});

// Gets a list of clients. By Default, it lists clients in franchise 1 which
// is the lafayette location.
app.get('/clients', function(req, res) {
    var sql = 'SELECT * FROM ClientInfo WHERE ClientID IN (SELECT ClientID FROM JobInfo WHERE JobInfo.FranchiseID=1)';
    connection.query(sql, function (err, data, fields) {
      if (err) throw err;
      res.render("clients.ejs", {title: 'Job List', employeeData: data} );
    })
});


// Sorts jobs by date in descending order and returns the results to the jobs page.
app.get('/jobs', function(req, res) {
    var sql = 'SELECT * FROM JobInfo ORDER BY jYear DESC, Month DESC, Day DESC';
    connection.query(sql, function (err, data, fields) {
      if (err) throw err;
      res.render("jobs.ejs", {title: 'Job List', employeeData: data} );
    })
});


// Redirect to page where user registers client and schedules job.
app.get('/schedule', function(req, res) {
  res.render("schedule_job.ejs");
});

// Home page menu when website is activated.
app.get('/', function(req, res) {
    res.render("index.ejs");
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
