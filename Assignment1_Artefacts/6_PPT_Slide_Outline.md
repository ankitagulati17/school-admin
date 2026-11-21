# PPT Slide Outline – School Administration System
## Presentation Brief (7 Slides)

---

## Slide 1 – Title Slide

**School Administration System**
A Full-Stack Web Application for Digital School Management

- Course: Full Stack Application Development (FSAD)
- Team: [Your team names]
- Date: November 2026

---

## Slide 2 – Problem Statement

**Current Challenges in School Administration**

- Student records maintained in physical registers — prone to loss and errors
- Attendance marked manually — no centralised tracking or reports
- Fee collection tracked in spreadsheets — no receipt generation or approval workflow
- Performance data fragmented across teachers — no unified academic history
- No single platform for all school stakeholders (Admin, Principal, Teacher, Clerk, Student)

**Result:** High administrative overhead, data inconsistency, delayed decision-making

---

## Slide 3 – Objective & Solution

**Objective**
To build a centralised, role-based web application that digitises all key school administrative operations.

**Solution**
A secure, full-stack web portal where:
- Each user role (Admin / Principal / Teacher / Clerk / Student) sees only relevant modules
- All data is stored in a single PostgreSQL database
- REST API enforces JWT-based authentication and role-based access
- Real-time reports and dashboards provide instant insights

---

## Slide 4 – Architecture

**High-Level 3-Tier Architecture**

```
┌──────────────────┐      HTTP/REST      ┌──────────────────┐
│  React Frontend  │ ◄─────────────────► │  Spring Boot API │
│  (MUI + Vite)    │   JWT Auth Token     │  (Java 17)       │
│  localhost:5173  │                      │  localhost:8080  │
└──────────────────┘                      └────────┬─────────┘
                                                   │ JPA/JDBC
                                          ┌────────▼─────────┐
                                          │  PostgreSQL DB    │
                                          │  (15 tables)      │
                                          └──────────────────┘
```

**Layers:**
- Presentation: React 18 + Material UI v6
- Business Logic: Spring Boot 3 + Spring Security
- Data: PostgreSQL 15 with Hibernate ORM

---

## Slide 5 – Modules & Users

**10 Functional Modules**

| # | Module | Role |
|---|---|---|
| 1 | User Management | Admin |
| 2 | Admission Module | Clerk |
| 3 | Class & Section Management | Admin |
| 4 | Subject Management | Admin |
| 5 | Attendance | Teacher |
| 6 | Fee Payment | Clerk |
| 7 | Performance / Marks | Teacher |
| 8 | Syllabus Tracker | Teacher |
| 9 | Class Schedule (Timetable) | Teacher / Principal |
| 10 | Reports & Analysis | Principal |

**5 User Roles:** Admin · Principal · Teacher · Clerk · Student

---

## Slide 6 – Technologies Used

**Tech Stack**

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Material UI v6, React Router v6 |
| HTTP Client | Axios |
| Charts | Recharts |
| Backend | Spring Boot 3, Java 17 |
| Security | Spring Security, JWT (JSON Web Tokens) |
| ORM | Hibernate / Spring Data JPA |
| Database | PostgreSQL 15 |
| Build | Maven (backend), npm + Vite (frontend) |

**Key Design Decisions:**
- Stateless JWT auth — no server-side sessions
- Role-based routing on both frontend (React Router) and backend (@PreAuthorize)
- Spring Boot LocalDate serialised as ISO string for clean frontend date handling

---

## Slide 7 – Summary & Demo

**What We Built**

- A production-ready full-stack school admin portal
- 10 modules covering the full school administration lifecycle
- 5 distinct role-based interfaces with protected routes
- Clean, professional UI (no emojis, consistent design system)
- Real-time reports with charts for the principal dashboard

**Database:** 12 tables, fully normalised with FK constraints

**Lines of Code:** ~3,500 (frontend) + ~2,000 (backend)

**Demo Flow:**
1. Login as Admin → Create class / section / subject / user
2. Login as Clerk → Admit student → Process fee
3. Login as Teacher → Mark attendance → Record marks
4. Login as Principal → View reports → View analysis charts
5. Login as Student → View profile, attendance, performance
