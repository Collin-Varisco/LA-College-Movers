-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 18, 2022 at 11:01 PM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 8.1.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `MovingDB`
--

-- --------------------------------------------------------

--
-- Table structure for table `ClientInfo`
--

CREATE TABLE `ClientInfo` (
  `ClientID` int(11) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `Email` varchar(60) NOT NULL,
  `Fname` varchar(50) NOT NULL,
  `Lname` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `ClientInfo`
--

INSERT INTO `ClientInfo` (`ClientID`, `PhoneNumber`, `Email`, `Fname`, `Lname`) VALUES
(1, '337-348-1344', 'cj88@Gmail.com', 'Chris', 'Johnson');

-- --------------------------------------------------------

--
-- Table structure for table `Employee`
--

CREATE TABLE `Employee` (
  `EmployeeID` int(11) NOT NULL,
  `Fname` varchar(50) NOT NULL,
  `Lname` varchar(50) NOT NULL,
  `Position` varchar(50) NOT NULL,
  `FranchiseID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Employee`
--

INSERT INTO `Employee` (`EmployeeID`, `Fname`, `Lname`, `Position`, `FranchiseID`) VALUES
(1, 'Chris', 'Guidry', 'Manager', 1),
(2, 'Eric', 'Jones', 'Mover', 1),
(3, 'Thomas', 'Rivera', 'Mover', 1),
(4, 'Ryan', 'Hebert', 'Mover', 1),
(5, 'Vincent', 'Abshire', 'Manager', 2),
(6, 'Michael', 'Clark', 'Mover', 2),
(7, 'Connor', 'Milton', 'Mover', 2),
(8, 'Jack', 'Benson', 'Mover', 2);

-- --------------------------------------------------------

--
-- Table structure for table `Franchise`
--

CREATE TABLE `Franchise` (
  `FranchiseID` int(11) NOT NULL,
  `City` varchar(50) NOT NULL,
  `State` varchar(50) NOT NULL,
  `Address` varchar(50) NOT NULL,
  `FranchiseOwner` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Franchise`
--

INSERT INTO `Franchise` (`FranchiseID`, `City`, `State`, `Address`, `FranchiseOwner`) VALUES
(1, 'Lafayette', 'Louisiana', '121 Rue Louis XIV', 'Louis Anderson'),
(2, 'Baton Rouge', 'Louisiana', '9002 S Choctaw Dr', 'Ben Davis'),
(3, 'New Orleans', 'Louisiana', '2420 N Claiborne Ave', 'Ryan Martin');

-- --------------------------------------------------------

--
-- Table structure for table `JobInfo`
--

CREATE TABLE `JobInfo` (
  `JobID` int(11) NOT NULL,
  `Day` int(11) NOT NULL,
  `Month` int(11) NOT NULL,
  `jYear` int(11) NOT NULL,
  `ClientID` int(11) NOT NULL,
  `OriginalCity` varchar(50) NOT NULL,
  `OriginalStreetAddress` varchar(50) NOT NULL,
  `DestinationCity` varchar(50) NOT NULL,
  `DestinationStreetAddress` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ClientInfo`
--
ALTER TABLE `ClientInfo`
  ADD PRIMARY KEY (`ClientID`);

--
-- Indexes for table `Employee`
--
ALTER TABLE `Employee`
  ADD PRIMARY KEY (`EmployeeID`),
  ADD KEY `FK_Emp_FID` (`FranchiseID`);

--
-- Indexes for table `Franchise`
--
ALTER TABLE `Franchise`
  ADD PRIMARY KEY (`FranchiseID`);

--
-- Indexes for table `JobInfo`
--
ALTER TABLE `JobInfo`
  ADD PRIMARY KEY (`JobID`),
  ADD KEY `FK_Cli_ID` (`ClientID`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Employee`
--
ALTER TABLE `Employee`
  ADD CONSTRAINT `FK_Emp_FID` FOREIGN KEY (`FranchiseID`) REFERENCES `Franchise` (`FranchiseID`);

--
-- Constraints for table `JobInfo`
--
ALTER TABLE `JobInfo`
  ADD CONSTRAINT `FK_Cli_ID` FOREIGN KEY (`ClientID`) REFERENCES `ClientInfo` (`ClientID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
