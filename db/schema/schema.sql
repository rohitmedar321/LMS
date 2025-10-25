CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    username VARCHAR(100) UNIQUE,
    hash VARCHAR(255),
    `key` CHAR(36) DEFAULT (UUID()),
    email VARCHAR(100) UNIQUE,
    unlockquiz JSON NOT NULL DEFAULT (JSON_ARRAY()),
    mycoursesid JSON NOT NULL DEFAULT (JSON_ARRAY()),
    completeCourses JSON NOT NULL DEFAULT (JSON_ARRAY())
);

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT,
    image LONGTEXT,
    src LONGTEXT
);

CREATE TABLE IF NOT EXISTS quiz (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    category VARCHAR(255) DEFAULT 'General',
    questions JSON DEFAULT (JSON_OBJECT())
);


CREATE TABLE IF NOT EXISTS integration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(256),
    apikey VARCHAR(256),
    data JSON NOT NULL DEFAULT (JSON_ARRAY())
);


CREATE TABLE IF NOT EXISTS bundle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  course_id JSON NOT NULL DEFAULT (JSON_ARRAY()),
  user_id INT,
  status VARCHAR(255) DEFAULT 'pending'
);