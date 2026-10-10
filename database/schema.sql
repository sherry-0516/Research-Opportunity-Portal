-- =====================================================================
-- University Research Opportunity Portal
-- Database Definition & Table Schema
-- Course: Computer Networks / Web Engineering (BS Computer Science)
-- =====================================================================

-- Step 1: Create Database if it does not already exist
CREATE DATABASE IF NOT EXISTS `research_portal`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `research_portal`;

-- Step 2: Create Table for Research Opportunities
CREATE TABLE IF NOT EXISTS `research_opportunities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `research_area` VARCHAR(150) NOT NULL,
  `faculty_name` VARCHAR(150) NOT NULL,
  `department` VARCHAR(150) NOT NULL,
  `required_skills` VARCHAR(500) NOT NULL,
  `available_positions` INT NOT NULL CHECK (`available_positions` >= 1),
  `application_deadline` DATE NOT NULL,
  `status` ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
