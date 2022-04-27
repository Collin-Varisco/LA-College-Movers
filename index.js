const mysql = require('mysql2');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const server = require("http").Server(app);
const ejs = require('ejs');
server.listen(8080, 'localhost');
const util = require('util');

app.set("views", "./views");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

// Database activation
let db = new sqlite3.Database('./db/lamovers.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// GET Functions
// --------------------------
// Gets a list of clients. By Default, it lists clients in franchise 1 which
// is the lafayette location.

// Home page
app.get('/', function(req, res) {
    res.render("index.ejs");
});

app.get('/employees/add', function(req, res) {
		res.render('add_employee.ejs');
});

app.get('/edit/jobs', function(req, res) {
		var job_id = req.query.id;
		sql = "SELECT * FROM JobInfo WHERE JobID='" + job_id + "'";
		db.each(sql, (err, data) => {
				if(err){
						console.log(err);
				} else {
						res.render('edit_job.ejs', { title: 'job-data', jobData: data } );
				}
		});
});

app.get('/delete_job_confirmation', function(req,res){
		var sql = "SELECT * FROM JobInfo WHERE JobID=" + req.query.id;
		db.each(sql, function(err, data) {
				if(err){ throw err }
				else {
					res.render('delete_job_confirmation.ejs', { title: 'Job Info', jobData: data } );
				}
		});
});

app.get('/clients', function(req, res) {
		  // sql for clients at Franchise #1
    //var sql = 'SELECT * FROM ClientInfo WHERE ClientID IN (SELECT ClientID FROM JobInfo WHERE JobInfo.FranchiseID=1)';
		  var sql = 'SELECT * FROM ClientInfo';
    db.all(sql, function (err, data, fields) {
      if (err){ throw err }
						else {
								res.render("clients.ejs", {title: 'Job List', employeeData: data} );
						}
    })
});

app.get('/analysis', function(req, res) {
		var month = new Date().getMonth() + 1;
		var lastMonth = month;
		var year = new Date().getFullYear();
		var lastYear = year - 1;

		var includeLastYear = false;
		if(month == 1){
				includeLastYear = true;
				lastMonth = 12;
		}

		var sql = '';
		if(includeLastYear == false){
				var totalFranchises = 3;
				for(var i = 1; i < (totalFranchises + 1); i++){
						sql = sql + 'SELECT e1.empCount, FranchiseID as FID, t2.lafCount, t1.jmonth FROM (SELECT FranchiseID, COUNT(JobID) as jmonth FROM JobInfo WHERE FranchiseID=' + i + ' AND jYear=' + year + ' AND Month=' + month + ' OR Month=' + (month - 1) + ' AND jYear=' + year + ' AND FranchiseID=' + i + ') AS t1, '
						sql = sql + '(SELECT COUNT(JobID) as lafCount FROM JobInfo WHERE FranchiseID=' + i + ') as t2, (SELECT COUNT(EmployeeID) as empCount FROM EMPLOYEE WHERE FranchiseID=' + i + ') as e1';
						if (i < totalFranchises){
								sql = sql + ' UNION ';
						}
				}

				/*
				sql = sql + ' UNION ';
				sql = sql + 'SELECT FranchiseID as FID, t2.lafCount, t1.jmonth FROM (SELECT FranchiseID, COUNT(JobID) as jmonth FROM JobInfo WHERE FranchiseID=2 AND jYear=' + year + ' AND Month=' + month + ' OR Month=' + (month - 1) + ' AND jYear=' + year + ' AND FranchiseID=2) AS t1, '
				sql = sql + '(SELECT COUNT(JobID) as lafCount FROM JobInfo WHERE FranchiseID=2) as t2'
				sql = sql + ' UNION ';
				sql = sql + 'SELECT t1.FID, t2.lafCount, t1.jmonth FROM (SELECT FranchiseID as FID, COUNT(JobID) as jmonth FROM JobInfo WHERE FranchiseID=3 AND jYear=' + year + ' AND Month=' + month + ' OR Month=' + (month - 1) + ' AND jYear=' + year + ' AND FranchiseID=3) AS t1, '
				sql = sql + '(SELECT COUNT(JobID) as lafCount FROM JobInfo WHERE FranchiseID=3) as t2'
		} else {
				sql = 'SELECT FranchiseID AS FID, COUNT(JobID) as jcount, t1.jmonth FROM (SELECT COUNT(JobID) as jmonth FROM JobInfo WHERE FranchiseID=1 AND jYear=' + year + ' AND Month=' + month + ' OR jYear=' + lastYear + ' AND Month=' + lastMonth + ') AS t1, JobInfo '
				sql = sql + '(SELECT COUNT(JobID) as lafCount FROM JobInfo WHERE FranchiseID=1) as t2'
				*/
		}


		//WHERE FranchiseID=1 UNION SELECT FranchiseID as FID, COUNT(JobID) AS jcount FROM JobInfo WHERE FranchiseID=2 UNION SELECT FranchiseID as FID, COUNT(JobID) AS jcount FROM JobInfo WHERE FranchiseID=3';
    db.all(sql, function(err, data) {
      if(err){ throw err }
						else {
								res.render("analysis.ejs", {title: 'Franchise Data', franchiseData: data} );
						}
    });
});


// Jobs page. SQL Sorts by date in descending order and returns the results to the jobs page.
app.get('/jobs', function(req, res) {
    var sql = 'SELECT * FROM JobInfo ORDER BY jYear DESC, Month DESC, Day DESC';
    db.all(sql, function (err, data, fields) {
      if (err) throw err;
      res.render("jobs.ejs", {title: 'Job List', employeeData: data} );
    })
});

// Page where you can schedule a register a client as well as schedule a new job
app.get('/schedule', function(req, res) {
  res.render("schedule_job.ejs");
});

// Page that list all employee information
app.get("/employees", function(req,res){
  var sql = "SELECT * FROM Employee ORDER BY FranchiseID ASC";
		db.all(sql, (err, data) => {
		  if(err) {
		    console.log(err);
		  } else {
		    res.render('employees.ejs', { title: 'employee-data', employeeData: data } );
		  }
		});
});

app.get("/edit/employees", function(req, res){
		var employee_id = req.query.id;
		sql = "SELECT * FROM Employee WHERE EmployeeID='" + employee_id + "'";
		db.each(sql, (err, data) => {
				if(err){
						console.log(err);
				} else {
						res.render('edit_employee.ejs', { title: 'employee-data', employeeData: data } );
				}
		});
});

app.get('/client_info', function(req,res) {
		var clientID = req.query.id;
		var sql = "SELECT * FROM ClientInfo WHERE ClientID="+clientID;
		db.each(sql, (err, data) => {
				if(err){
						console.log(err);
				} else {
						res.render('view_client.ejs', { title: 'client-data', clientData: data } );
				}
		});

})

// SORT Functions
// -----------------------------
// Receives job sorting parameters, forms sql syntax, executes sql and returns results to jobs page.
app.post('/sortJobs', function(req,res){
  var franchises = [];
  if(req.body.lafayette  != undefined){ franchises.push(1); }
  if(req.body.batonrouge != undefined){ franchises.push(2); }
  if(req.body.neworleans != undefined){ franchises.push(3); }
  var sql = 'SELECT ClientID, JobID, Month, Day, jYear, OriginalStreetAddress, OriginalCity, DestinationStreetAddress, DestinationCity FROM JobInfo ';
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
  db.all(sql, function (err, data, fields) {
    if (err) throw err;
    res.render("jobs.ejs", {title: 'Employee List', employeeData: data} );
  })
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
    db.all(sql, function (err, data, fields) {
      if (err) throw err;
      res.render("employees.ejs", {title: 'Employee List', employeeData: data} );
    })
  }
  if(positions.length == 0 && franchises.length == 0){
    var default_sql='SELECT * FROM Employee';
    db.all(default_sql, function (err, data, fields) {
      if (err) throw err;
      res.render("employees.ejs", {title: 'Employee List', employeeData: data} );
    });
  }
});


app.post('/sortClients', function(req,res){
  var franchises = [];
  if(req.body.lafayette  != undefined){ franchises.push(1);        }
  if(req.body.batonrouge != undefined){ franchises.push(2);        }
  if(req.body.neworleans != undefined){ franchises.push(3);        }
  // Form SQL
  var sql = 'SELECT * FROM ClientInfo WHERE ClientID IN (SELECT ClientID FROM JobInfo WHERE  ';
  if(franchises.length != 0){
    if(franchises.length == 1){ sql = sql + 'FranchiseID=' + franchises[0] + ')'; }
    else {
      for(var i = 0; i < franchises.length; i++){
        sql = sql + 'FranchiseID=' + franchises[i];
        if(i != (franchises.length - 1)){ sql = sql + " OR "; }
      }
			sql = sql + ')';
    }
  }

	// executed new SQL statement
  if(franchises.length != 0){
    db.all(sql, function (err, data, fields) {
      if (err) throw err;
      res.render("clients.ejs", {title: 'Employee List', employeeData: data} );
    })
  }
	// execute default sql statement for client page
  if(franchises.length == 0){
    var default_sql='SELECT * FROM ClientInfo';
    db.all(default_sql, function (err, data, fields) {
      if (err) throw err;
      res.render("clients.ejs", {title: 'Employee List', employeeData: data} );
    });
  }
});

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

// POST Functions
// -----------------------------
// Adds a client to the ClientInfo table and adds job information to the JobInfo table.
// is used from "localhost:5000/schedule"
app.post('/add', function(req,res){
  if(validDate(req.body.MoveDay, req.body.MoveMonth, req.body.MoveYear) == false){
    const data = new Object();
    data.error = "  Invalid Date";
    res.render("schedule_conflict.ejs", { title: 'schedule-conflict', employeeData: data } );
  }
  else {
				// Protect against SQL injection attack.
				const insertClient = db.prepare("INSERT INTO ClientInfo (PhoneNumber,Email,Fname,Lname) VALUES(?, ?, ?, ?)");
				insertClient.run([req.body.PhoneNumber, req.body.ClientEmail, req.body.ClientFname, req.body.ClientLname]);
				insertClient.finalize();

				var clientID_sql = "SELECT ClientID FROM ClientInfo WHERE PhoneNumber='" + req.body.PhoneNumber + "' AND Email='" + req.body.ClientEmail + "'";
				// db.all() is to find the ClientID value for the client that was just added. That value will be inserted in the JobInfo table.
				db.all(clientID_sql, (err, data) => {
					if(err){
							console.log(err);
					} else {
								// Protect against SQL injection attack
								const insertJob = db.prepare("INSERT INTO JobInfo (ClientId, Day,Month,jYear,OriginalCity,OriginalStreetAddress,DestinationCity,DestinationStreetAddress, FranchiseID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)");
								insertJob.run([data[0]["ClientID"], req.body.MoveDay, req.body.MoveMonth, req.body.MoveYear, req.body.OriginalCity, req.body.OriginalStreet, req.body.DestinationCity, req.body.DestinationStreet, req.body.Franchise]);
								insertJob.finalize();
					}
				});
		}
	res.redirect("/");
});


app.post('/editJob', function(req,res){
		// Job Identifier for SQL
		var jobID = req.body.JobID;

		// For text and number fields that users have the option to leave blank. The following code checks to see if they are blank
		// so the SQL only updates what was edited.
		var originalCity = false;
		var destCity = false;
		var originalAddress = false;
		var destAddress = false;
		var moveMonth = false;
		var moveDay = false;
		var moveYear = false;
		if(req.body.DestinationCity.length > 0)   { destCity = true; }
		if(req.body.OriginalCity.length > 0)      { originalCity = true; }
		if(req.body.OriginalStreet.length > 0)    { originalAddress = true; }
		if(req.body.DestinationStreet.length > 0) { destAddress = true; }
		if(req.body.MoveMonth.length > 0)         { moveMonth = true; }
		if(req.body.MoveDay.length > 0)           { moveDay = true; }
		if(req.body.MoveYear.length > 0)          { moveYear = true; }

		// The 1 field value that will always have a value is the dropdown selection for the chosen Franchise.
		// this checks to see if that value was changed.
		var changedFID = false;
		var oFID = Number(req.body.hiddenFID); // Original value
		var eFID = Number(req.body.Franchise); // Potentially edited value
		if(eFID != oFID){ changedFID = true; }
		var sql = "UPDATE JobInfo SET ";
		var firstConcat = true;

		if (destCity) {
			if(firstConcat){ sql = sql + "DestinationCity= '" + req.body.DestinationCity + "'"; firstConcat = false; }
			else { sql = sql + ", DestinationCity= '" + req.body.DestinationCity + "'"; }
		}

		if (originalCity) {
			if(firstConcat) { sql = sql + "OriginalCity= '" + req.body.OriginalCity + "'"; firstConcat = false; }
			else {sql = sql + ", OriginalCity= '" + req.body.OriginalCity + "'";}
		}

		if (originalAddress) {
			if(firstConcat) { sql = sql + "OriginalStreetAddress= '" + req.body.OriginalStreet + "'"; firstConcat = false;}
			else { sql = sql + ", OriginalStreetAddress= '" + req.body.OriginalStreet + "'";}
		}

		if (destAddress) {
			if(firstConcat) { sql = sql + "DestinationStreetAddress= '" + req.body.DestinationStreet + "'"; firstConcat = false;}
			else { sql = sql + ", DestinationStreetAddress= '" + req.body.DestinationStreet + "'"; }
		}

		if (moveMonth) {
			if(firstConcat) { sql = sql + "Month=" + req.body.MoveMonth; firstConcat = false;}
			else { sql = sql + ", Month=" + req.body.MoveMonth; }
		}

		if (moveDay) {
			if(firstConcat) { sql = sql + "Day=" + req.body.MoveDay; firstConcat = false;}
			else { sql = sql + ", Day=" + req.body.MoveDay; }
		}

		if (moveYear) {
			if(firstConcat) { sql = sql + "jYear=" + req.body.MoveYear; firstConcat = false;}
			else { sql = sql + ", jYear=" + req.body.MoveYear; }
		}

		if (changedFID) {
			if(firstConcat) { sql = sql + "FranchiseID=" + req.body.MoveFranchise; firstConcat = false}
			else { sql = sql + ", FranchiseID=" + req.body.MoveFranchise; }
		}

		sql = sql + " WHERE JobId=" + req.body.JobID;

		db.run(sql, [], (error, results) => {
	            if (error) { console.log(error) }
		        else { console.log("Job Information Updated"); }
		});

		res.redirect("/jobs");
});


app.post('/editEmployee', function(req,res){
		var fBlank = false;
		var lBlank = false;
		if(req.body.Fname==""){
				fBlank = true;
		}
		if(req.body.Lname==""){
				lBlank = true;
		}

		var sql = "UPDATE Employee SET ";

		if(fBlank == true && lBlank == true){
				const employeeStatement = db.prepare("UPDATE Employee SET FranchiseID = ?, Position = ? WHERE EmployeeID=" + req.body.EmployeeID);
				employeeStatement.run([req.body.Franchise, req.body.Position]);
				employeeStatement.finalize();
		}
		if(lBlank == false && fBlank == true){
				const employeeStatement = db.prepare("UPDATE Employee SET Lname = ?, FranchiseID = ?, Position = ? WHERE EmployeeID=" + req.body.EmployeeID)
				employeeStatement.run([req.body.Lname, req.body.Franchise, req.body.Position]);
				employeeStatement.finalize();
		}
		if(lBlank == true && fBlank == false){
				const employeeStatement = db.prepare("UPDATE Employee SET Fname = ?, FranchiseID = ?, Position = ? WHERE EmployeeID=" + req.body.EmployeeID)
				employeeStatement.run([req.body.Fname, req.body.Franchise, req.body.Position]);
				employeeStatement.finalize();
		}
		if(lBlank == false && fBlank == false){
				const employeeStatement = db.prepare("UPDATE Employee SET Fname = ?, Lname = ?, FranchiseID = ?, Position = ? WHERE EmployeeID=" + req.body.EmployeeID)
				employeeStatement.run([req.body.Fname, req.body.Lname, req.body.Franchise, req.body.Position]);
				employeeStatement.finalize();
		}
		res.redirect("/employees");
});

app.post('/deleteJob', function(req,res){
		var sql = 'DELETE FROM JobInfo WHERE JobID=' + req.query.id;
		console.log(sql);
		db.run(sql, [], (error, results) => {
				if(error) { console.log(error) }
				else {
						console.log("Deleted a job.");
				}
		});
		res.redirect("/jobs");
});

app.post('/add_new_employee', function(req, res){
	const addEmployee = db.prepare("INSERT INTO Employee (Fname, Lname, FranchiseID, Position) VALUES(?,?,?,?)");
	addEmployee.run([req.body.Fname, req.body.Lname, req.body.Franchise, req.body.Position]);
	addEmployee.finalize();
	res.redirect("/employees");
});


app.set('view engine', 'ejs');
