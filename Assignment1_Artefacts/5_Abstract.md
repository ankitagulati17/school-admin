# Project Abstract – School Administration System

## Problem Statement

Educational institutions manage large volumes of administrative data — student records, attendance, fee payments, academic performance, timetables, and syllabus tracking — primarily through manual registers or disconnected spreadsheets. This leads to data inconsistency, delayed access to information, difficulty in generating reports, and high administrative overhead. School staff, teachers, and management often lack a unified digital platform to collaborate efficiently.

## Objective

To design and develop a centralised, role-based **School Administration System** that digitises and automates all key administrative operations of a school — from student admission to fee collection, attendance marking, performance tracking, syllabus management, and report generation — accessible through a secure web interface.

## Solution Planned

A full-stack web application built on a **client-server architecture**, where:
- A **React.js** single-page application serves as the frontend UI
- A **Spring Boot REST API** provides the backend business logic
- A **PostgreSQL** relational database stores all persistent data
- **JWT-based authentication** enforces role-based access control

Each user role sees only the modules relevant to their responsibilities, ensuring security and usability.

## Technologies Used

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Material UI (MUI v6) |
| Backend | Spring Boot 3, Spring Security, Spring Data JPA |
| Database | PostgreSQL 15 |
| Authentication | JWT (JSON Web Tokens) |
| Build Tools | Maven (backend), npm/Vite (frontend) |
| Language | Java 17 (backend), JavaScript/JSX (frontend) |

## Modules

1. **User Management** – Create and manage system users; assign roles; activate/deactivate accounts
2. **Admission Module** – Multi-step student admission wizard; edit and deactivate student records
3. **Class & Section Management** – Define school classes and sections
4. **Subject Management** – Assign subjects to classes with unique codes
5. **Attendance Module** – Daily attendance marking by class/section; view historical records
6. **Fee Payment Module** – Process fee payments; generate receipts; approve pending payments
7. **Performance / Marks** – Record exam results; track grades per subject/term/year
8. **Syllabus Tracker** – Track topic completion per class/subject/term
9. **Class Schedule** – Assign subjects/teachers to time slots per day
10. **Reports & Analysis** – Admission, attendance, performance, syllabus, and class summary reports with charts

## Users / Roles

| Role | Responsibilities |
|---|---|
| **Admin** | Full system access; user/class/section/subject management |
| **Principal** | View all reports, analysis dashboards, class schedules |
| **Teacher** | Mark attendance, record performance, update syllabus, manage schedules |
| **Clerk** | Process student admissions, manage fee payments |
| **Student** | View own profile, attendance history, performance records |

## Summary

The School Administration System replaces paper-based and disconnected processes with a unified digital platform. It reduces administrative burden, improves data accuracy, enables instant reporting, and provides stakeholders at every level — from students to the principal — with real-time access to relevant information through a clean, professional web interface.
