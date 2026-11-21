# Software Requirements Specification (SRS)
## School Administration System
**Version:** 1.0  
**Date:** November 2026  
**Prepared by:** Group – Full Stack Application Development

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for the **School Administration System**, a web-based application to digitise school administrative operations.

### 1.2 Scope
The system covers: user authentication, student admissions, class/section/subject management, daily attendance, fee processing, academic performance tracking, syllabus management, timetable scheduling, and reporting — all accessible via a role-based web portal.

### 1.3 Definitions
- **SRS** – Software Requirements Specification
- **JWT** – JSON Web Token (authentication mechanism)
- **RBAC** – Role-Based Access Control
- **API** – Application Programming Interface (REST)

---

## 2. Overall Description

### 2.1 System Overview
A three-tier web application:
- **Presentation Layer:** React.js SPA with Material UI
- **Business Logic Layer:** Spring Boot REST API
- **Data Layer:** PostgreSQL relational database

### 2.2 User Roles
| Role | Description |
|---|---|
| Admin | Full system control |
| Principal | Read-only reports, analysis, schedules |
| Teacher | Attendance, performance, syllabus, schedule |
| Clerk | Admissions, fee payments |
| Student | View own data only |

---

## 3. Functional Requirements

### FR-01: Authentication & Authorization
- FR-01.1: Users shall log in using username and password.
- FR-01.2: The system shall issue a JWT token upon successful login.
- FR-01.3: All API endpoints (except login) shall require a valid JWT.
- FR-01.4: The system shall enforce role-based access — each role can only access permitted modules.
- FR-01.5: Admin shall be able to activate or deactivate any user account.

### FR-02: User Management
- FR-02.1: Admin shall create new user accounts with roles: ADMIN, PRINCIPAL, TEACHER, CLERK, STUDENT.
- FR-02.2: Admin shall view all registered users in a table.
- FR-02.3: Admin shall toggle the active/inactive status of any user.
- FR-02.4: Student-role users must be linked to a valid student record via studentId.

### FR-03: Class Management
- FR-03.1: Admin shall create, update, and delete school classes (e.g., Class 1 – Class 12).
- FR-03.2: The system shall display the number of sections per class.
- FR-03.3: Deletion of a class shall be prevented if students or sections are linked to it.

### FR-04: Section Management
- FR-04.1: Admin shall create, update, and delete sections within a class (e.g., A, B, C).
- FR-04.2: Sections shall be linked to exactly one class.
- FR-04.3: Admin shall filter sections by selecting a class.

### FR-05: Subject Management
- FR-05.1: Admin shall create subjects with a name and a unique code (e.g., MATH, ENG).
- FR-05.2: Each subject shall be assigned to one class.
- FR-05.3: Admin shall update and delete subjects.

### FR-06: Student Admission
- FR-06.1: Clerk shall admit students via a multi-step form (Personal → Parent → Academic → Review).
- FR-06.2: The system shall auto-generate a unique admission number for each student.
- FR-06.3: Clerk shall view all admitted students with class, section, and status.
- FR-06.4: Clerk shall edit student details and deactivate students.
- FR-06.5: Admission date shall be recorded at the time of admission.

### FR-07: Attendance Management
- FR-07.1: Teacher shall select class, section, and date to load the student list.
- FR-07.2: Teacher shall mark each student as PRESENT, ABSENT, LATE, or LEAVE.
- FR-07.3: Teacher shall save the attendance for the entire class at once.
- FR-07.4: Teacher shall view existing attendance records for a selected class/section/date.
- FR-07.5: Teacher shall delete an individual attendance record.
- FR-07.6: Student shall view their own attendance history (last 30 records).
- FR-07.7: Student shall view an attendance summary (total days, present, absent, percentage).

### FR-08: Fee Payment
- FR-08.1: Clerk shall process a fee payment for a student, specifying fee type, amount, mode, and date.
- FR-08.2: The system shall auto-generate a unique receipt number for each payment.
- FR-08.3: Clerk shall view all payment records and filter by pending status.
- FR-08.4: Clerk shall approve a pending payment, changing its status to PAID.
- FR-08.5: The system shall display total collected, total pending, and total records as summary cards.
- FR-08.6: Supported fee types: Tuition, Exam, Library, Sports, Transport, Miscellaneous.
- FR-08.7: Supported payment modes: Cash, Cheque, Online Transfer, UPI, DD.

### FR-09: Performance / Marks
- FR-09.1: Teacher shall record exam results for a student, specifying subject, exam type, marks, max marks, term, and academic year.
- FR-09.2: Exam types supported: Class Test, Unit Test, Midterm, Final, Assignment.
- FR-09.3: Teacher shall update and delete performance records.
- FR-09.4: Teacher shall filter records by student and academic year.
- FR-09.5: The system shall calculate and display the percentage for each record.
- FR-09.6: Student shall view their own performance records filtered by academic year.

### FR-10: Syllabus Management
- FR-10.1: Teacher shall add syllabus topics per class, subject, and term.
- FR-10.2: Teacher shall mark a topic as completed (with completion date).
- FR-10.3: Teacher shall update and delete syllabus entries.
- FR-10.4: The system shall filter syllabus by class and subject.
- FR-10.5: Principal shall view the syllabus completion percentage per class in reports.

### FR-11: Class Schedule
- FR-11.1: Teacher shall create timetable entries assigning subject and teacher to a period, day, class, and section.
- FR-11.2: The system shall support 8 periods per day across Monday–Saturday.
- FR-11.3: Teacher shall update and delete schedule entries.
- FR-11.4: Principal shall view the timetable for any class/section.

### FR-12: Reports
- FR-12.1: **Admission Report** – total students, count by class, recent admissions list.
- FR-12.2: **Attendance Report** – per-student summary (total days, present, absent, %) for a class.
- FR-12.3: **Performance Report** – average score by subject for a class and academic year.
- FR-12.4: **Syllabus Report** – completion stats (total, completed, pending, %) for a class/year.
- FR-12.5: **Class Summary** – total active students with per-class breakdown.

### FR-13: Analysis Dashboard (Principal)
- FR-13.1: Bar chart showing average performance % per class.
- FR-13.2: Pie chart showing fee collection breakdown by fee type.
- FR-13.3: Financial summary (total collected, total pending, total transactions).

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Security | All passwords stored as BCrypt hashes. |
| NFR-02 | Security | JWT tokens expire after a configured duration. |
| NFR-03 | Performance | API responses for list endpoints shall return within 2 seconds under normal load. |
| NFR-04 | Usability | The UI shall be responsive and functional on screens ≥ 1024px wide. |
| NFR-05 | Reliability | The system shall handle invalid API inputs with appropriate HTTP error codes (400, 401, 403, 404). |
| NFR-06 | Maintainability | Backend follows MVC pattern: Controller → Service → Repository. |
| NFR-07 | Portability | Deployable on any OS with Java 17+ and PostgreSQL 15+. |
| NFR-08 | Data Integrity | Foreign key constraints enforced at database level. |

---

## 5. System Constraints
- Requires active PostgreSQL instance
- Requires Java 17+, Node.js 18+
- Browser: Chrome, Firefox, Edge (latest versions)
- No offline/mobile support in v1.0
