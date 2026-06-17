# Placement Management System

A full-stack Placement Management System built with **HTML, CSS, JavaScript** (frontend) and **Java Spring Boot + MySQL** (backend).

## Features

- **Two login systems**: Admin and Coordinator (plus read-only Student login)
- **Admin**: Full control — manage students of any department
- **Coordinator**: Add/Edit/Delete students, restricted to their own department only
- **Student**: Read-only access to all data
- **Dashboard**: Statistical overview (total students, placed, not placed, companies, average/highest package) with a bar chart comparing placed vs not-placed across departments (CSE, IT, ECE, MECH, CIVIL, AIDS)
- **Department drill-down**: Click a department card to view all students with photo, name, roll number, batch, email, phone, placement status, company name, offer type, and package
- **Photo upload** for each student
- JWT-based authentication & role-based access control

## Project Structure

```
placement-management-system/
├── backend/         # Spring Boot REST API
├── frontend/        # HTML/CSS/JS static frontend
└── database/        # SQL setup script
```

## Prerequisites

- Java 17+
- Maven 3.6+
- MySQL 8+
- Any modern browser
- (Optional) VS Code with "Live Server" extension for frontend

## Setup Instructions

### 1. Database Setup

1. Start MySQL server.
2. Run the script in `database/setup.sql`:
   ```sql
   CREATE DATABASE IF NOT EXISTS placement_management_db;
   ```
3. The Spring Boot app will auto-create tables and seed sample data on first run (via `DataInitializer.java`).

### 2. Backend Setup

1. Open `backend/` folder in VS Code (or any IDE).
2. Edit `src/main/resources/application.properties` and update:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
3. Run the application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
4. Backend runs at: `http://localhost:8080`

### 3. Frontend Setup

1. Open `frontend/` folder in VS Code.
2. Install the **Live Server** extension (or use any static server).
3. Right-click `index.html` → "Open with Live Server" (it will run, e.g., on `http://127.0.0.1:5500`).
4. Make sure the backend is running at `http://localhost:8080` (configured in `frontend/js/api.js` via `API_BASE_URL`).

> **Note**: If your frontend runs on a different port, ensure CORS is allowed (already configured to allow all origins in `SecurityConfig.java`).

## Default Login Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | `admin` | `admin123` | Full access to all departments |
| Coordinator (CSE) | `coordinator_cse` | `coord123` | Add/Edit/Delete CSE students only |
| Coordinator (IT) | `coordinator_it` | `coord123` | Add/Edit/Delete IT students only |
| Coordinator (ECE) | `coordinator_ece` | `coord123` | Add/Edit/Delete ECE students only |
| Coordinator (MECH) | `coordinator_mech` | `coord123` | Add/Edit/Delete MECH students only |
| Coordinator (CIVIL) | `coordinator_civil` | `coord123` | Add/Edit/Delete CIVIL students only |
| Coordinator (AIDS) | `coordinator_aids` | `coord123` | Add/Edit/Delete AIDS students only |
| Student | `student` | `student123` | Read-only access to all data |

## API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login, returns JWT token | Public |
| GET | `/api/dashboard/summary` | Overall placement summary | All roles |
| GET | `/api/dashboard/stats` | Department-wise stats | All roles |
| GET | `/api/students` | All students | All roles |
| GET | `/api/students/department/{dept}` | Students by department | All roles |
| GET | `/api/students/{id}` | Single student detail | All roles |
| POST | `/api/students` | Add student | Admin (any), Coordinator (own dept) |
| PUT | `/api/students/{id}` | Update student | Admin (any), Coordinator (own dept) |
| DELETE | `/api/students/{id}` | Delete student | Admin (any), Coordinator (own dept) |
| POST | `/api/students/upload-photo` | Upload student photo | Admin, Coordinator |

## Departments Supported

CSE, IT, ECE, MECH, CIVIL, AIDS (more can be added — just use the department dropdown/free text)

## Notes

- Uploaded photos are stored in `backend/uploads/photos/` and served at `http://localhost:8080/uploads/photos/<filename>`.
- JWT secret and expiration can be configured in `application.properties`.
- To reset sample data, drop the `students` and `users` tables and restart the backend (DataInitializer re-seeds only if tables are empty).
