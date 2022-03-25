/* Generate client and job information
------------------------------------------------
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
  (async () => {
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
				const query = util.promisify(db.all).bind(db);
    try {
      db.all(
        'INSERT INTO ClientInfo (PhoneNumber,Email,Fname,Lname) VALUES(?, ?, ?, ?)',
        [number, email, fName, lName],
        (error, results) => {
          if (error) { console.log(error) };
										var mSQL='SELECT ClientID FROM `ClientInfo` WHERE `PhoneNumber`="'+number+'" AND email="' + email + '"';
										db.all(
												mSQL,
												(error, data) => {
														if (error) { console.log(error) };
														var client_id = data[0]["ClientID"];
														db.run(
																'INSERT INTO JobInfo (ClientID,Day,Month,jYear,OriginalCity,OriginalStreetAddress,DestinationCity,DestinationStreetAddress,FranchiseID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
																[client_id, day, month, year, originalCity, originalStreet, destinationCity, destinationStreet, randomFranchise()],
																(error, results) => {
																		if (error) { console.log(error) };
																		console.log("Job Added");
														});
												}
										);
      });
    } finally {
      console.log("Finished insert.")
    }
  })();
}
*/
