-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS hackmate_db;
USE hackmate_db;

-- Disable foreign key checks during cleanup to avoid deletion order issues
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS invitations;
DROP TABLE IF EXISTS required_roles;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS interests;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (Core Auth)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Profiles Table (Extended details)
CREATE TABLE profiles (
    user_id INT PRIMARY KEY,
    college VARCHAR(150),
    branch VARCHAR(100),
    year INT,
    bio TEXT,
    github VARCHAR(150),
    linkedin VARCHAR(150),
    photo VARCHAR(255) DEFAULT 'default_avatar.png',
    role VARCHAR(50) DEFAULT 'Fullstack',
    experience VARCHAR(50) DEFAULT 'Intermediate',
    availability VARCHAR(50) DEFAULT 'Available',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Skills Table (User skills)
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Interests Table (Domains / topics user likes)
CREATE TABLE interests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    interest_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_interest (user_id, interest_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Projects Table (Portfolio / Hackathon projects)
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    repo_link VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Teams Table (Hackathon teams)
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    hackathon_name VARCHAR(150) NOT NULL,
    creator_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'recruiting',
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. Team Members Table (Junction table)
CREATE TABLE team_members (
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(100) DEFAULT 'Member',
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. Required Roles Table (Roles a team needs to recruit)
CREATE TABLE required_roles (
    team_id INT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (team_id, role_name),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 9. Invitations Table (User to Team or Team to User)
CREATE TABLE invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    team_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 10. Feedback Table (Peer review post-hackathon)
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==========================================
-- SEED DATA (For easy testing out-of-the-box)
-- Hashed password for all seeded users is: 'password123'
-- Hash created using Werkzeug's generate_password_hash (scrypt:32768:8:1)
-- ==========================================

INSERT INTO users (id, name, email, password) VALUES
(1, 'Aravind Sharma', 'aravind@gmail.com', 'scrypt:32768:8:1$u0Vqtb0B67gjoQgY$36f06fe9592f3e8f407fbcddefb626a493cf716541bef558e9a922165fe373ff8883bed72013db93fc29e8029f8268e3fc34c7cfdc2818aacc08b663277b0c96'),
(2, 'Neha Iyer', 'neha@gmail.com', 'scrypt:32768:8:1$u0Vqtb0B67gjoQgY$36f06fe9592f3e8f407fbcddefb626a493cf716541bef558e9a922165fe373ff8883bed72013db93fc29e8029f8268e3fc34c7cfdc2818aacc08b663277b0c96'),
(3, 'Rohan Das', 'rohan@gmail.com', 'scrypt:32768:8:1$u0Vqtb0B67gjoQgY$36f06fe9592f3e8f407fbcddefb626a493cf716541bef558e9a922165fe373ff8883bed72013db93fc29e8029f8268e3fc34c7cfdc2818aacc08b663277b0c96'),
(4, 'Tanya Sen', 'tanya@gmail.com', 'scrypt:32768:8:1$u0Vqtb0B67gjoQgY$36f06fe9592f3e8f407fbcddefb626a493cf716541bef558e9a922165fe373ff8883bed72013db93fc29e8029f8268e3fc34c7cfdc2818aacc08b663277b0c96');

INSERT INTO profiles (user_id, college, branch, year, bio, github, linkedin, photo, role, experience, availability) VALUES
(1, 'PES University', 'Computer Science', 3, 'Fullstack web developer loving Python & JS. Experienced in building Flask apps and playing with database schemas.', 'github.com/aravind', 'linkedin.com/in/aravind', 'default_avatar.png', 'Fullstack', 'Intermediate', 'Available'),
(2, 'RV College of Engineering', 'Information Science', 4, 'UI/UX Designer and Frontend developer. I make things look pretty and work smoothly.', 'github.com/neha', 'linkedin.com/in/neha', 'default_avatar.png', 'UI/UX', 'Advanced', 'Available'),
(3, 'BMS College of Engineering', 'Electronics', 2, 'AI/ML enthusiast. Familiar with PyTorch, pandas, and data cleaning. Looking to join a team as a data scientist.', 'github.com/rohan', 'linkedin.com/in/rohan', 'default_avatar.png', 'AI/ML', 'Beginner', 'Available'),
(4, 'PES University', 'Computer Science', 3, 'Backend engineering nerd. Django, Flask, FastAPI, PostgreSQL, and MySQL. Always optimizing queries.', 'github.com/tanya', 'linkedin.com/in/tanya', 'default_avatar.png', 'Backend', 'Intermediate', 'Tentative');

INSERT INTO skills (user_id, skill_name) VALUES
(1, 'Python'), (1, 'Flask'), (1, 'JavaScript'), (1, 'HTML/CSS'),
(2, 'HTML/CSS'), (2, 'Figma'), (2, 'React'), (2, 'UI/UX'),
(3, 'Python'), (3, 'PyTorch'), (3, 'Data Analysis'),
(4, 'Python'), (4, 'SQL'), (4, 'FastAPI'), (4, 'Flask');

INSERT INTO interests (user_id, interest_name) VALUES
(1, 'Web Apps'), (1, 'Fintech'),
(2, 'Edtech'), (2, 'Design Systems'),
(3, 'Healthcare AI'), (3, 'Computer Vision'),
(4, 'System Design'), (4, 'API Development');

INSERT INTO projects (user_id, title, description, repo_link) VALUES
(1, 'TaskManager', 'A collaborative productivity board using Flask and SQLite.', 'github.com/aravind/taskmanager'),
(2, 'Portfolio Website', 'Custom SVG animations and responsive grid CSS styling.', 'github.com/neha/portfolio'),
(4, 'QueryOptimizer', 'A command-line script that analyzes SQL statements and suggests index tweaks.', 'github.com/tanya/optimizer');

INSERT INTO teams (id, name, description, hackathon_name, creator_id, status) VALUES
(1, 'Code Crafters', 'Building a student dashboard with integrated study schedules.', 'Hackfest 2026', 1, 'recruiting');

INSERT INTO team_members (team_id, user_id, role) VALUES
(1, 1, 'Creator / Backend Dev');

INSERT INTO required_roles (team_id, role_name) VALUES
(1, 'Frontend'), (1, 'UI/UX');
