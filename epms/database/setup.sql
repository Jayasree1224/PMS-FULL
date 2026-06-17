CREATE DATABASE IF NOT EXISTS placement_management_db;
USE placement_management_db;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    full_name VARCHAR(255)
);

CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    batch VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    roll_number VARCHAR(255),
    is_placed BOOLEAN DEFAULT FALSE,
    company_name VARCHAR(255),
    offer_type VARCHAR(255),
    package_lpa DOUBLE,
    photo_url VARCHAR(255),
    phone_number VARCHAR(255)
);