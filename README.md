# Installation
## Install Dependencies
```sh
git clone https://github.com/Collin-Varisco/LA-College-Movers.git
```
```sh
cd la-college-movers
```
```sh
npm install
```

## MySQL & Apache Configuration
- Install XAMPP
- Open it and go to the manage servers tab.
- Enable MySQL Database
- Enable Apache Web Server

## Import Database to MySQL
```sh
mysql -u root
```
- In MySQL Shell
```
CREATE DATABASE MoveDB;
exit;
```
- Back at command line
```sh  
mysql -u root MoveDB < MovingDB.sql 
```

# Start Website Server
```sh
  npm start
```
Or 
```sh
node index.js
```
# Access Website
- Open Browser
- Enter this into URL bar: [http://localhost:5000](http://localhost:5000)
