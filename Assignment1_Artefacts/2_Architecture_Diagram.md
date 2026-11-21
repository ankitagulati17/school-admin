# Architecture Diagram – School Administration System
## High-Level System Architecture

---

## Overview

The School Administration System follows a classic **3-Tier Web Architecture** with clear separation of concerns across Presentation, Business Logic, and Data layers, communicating over HTTP/REST.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                             │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │               PRESENTATION LAYER (Frontend)                  │  │
│   │                                                              │  │
│   │   React 18  +  Vite  +  Material UI (MUI v6)                │  │
│   │                                                              │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │  │
│   │  │  Login   │ │Dashboard │ │  Admin   │ │   Teacher    │  │  │
│   │  │  Page    │ │          │ │  Pages   │ │   Pages      │  │  │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │  │
│   │  │  Clerk   │ │Principal │ │ Student  │                   │  │
│   │  │  Pages   │ │  Pages   │ │  Portal  │                   │  │
│   │  └──────────┘ └──────────┘ └──────────┘                   │  │
│   │                                                              │  │
│   │  ┌─────────────────────────────────────────────────────┐   │  │
│   │  │       React Router v6  (Client-side Routing)        │   │  │
│   │  │       Axios HTTP Client  (REST API calls)           │   │  │
│   │  │       React Context  (JWT token / auth state)       │   │  │
│   │  │       React Toastify  (Notifications)               │   │  │
│   │  └─────────────────────────────────────────────────────┘   │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│                 HTTP/HTTPS  (REST API + JSON)                       │
│                    Bearer Token (JWT)                               │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SERVER  (localhost:8080)                        │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │               BUSINESS LOGIC LAYER (Backend)                 │  │
│   │                  Spring Boot 3  +  Java 17                   │  │
│   │                                                              │  │
│   │  ┌─────────────────────────────────────────────────────┐   │  │
│   │  │              Spring Security Filter Chain           │   │  │
│   │  │          JWT Authentication Filter (stateless)      │   │  │
│   │  └───────────────────────┬─────────────────────────────┘   │  │
│   │                          │                                   │  │
│   │  ┌─────────────────────────────────────────────────────┐   │  │
│   │  │                REST Controllers                     │   │  │
│   │  │                                                     │   │  │
│   │  │  AuthController    StudentController               │   │  │
│   │  │  ClassController   SectionController               │   │  │
│   │  │  SubjectController AttendanceController            │   │  │
│   │  │  FeeController     PerformanceController           │   │  │
│   │  │  SyllabusController ScheduleController             │   │  │
│   │  │  ReportController  AnalysisController              │   │  │
│   │  └───────────────────────┬─────────────────────────────┘   │  │
│   │                          │                                   │  │
│   │  ┌─────────────────────────────────────────────────────┐   │  │
│   │  │                 Service Layer                       │   │  │
│   │  │   Business Logic / Validation / Orchestration       │   │  │
│   │  └───────────────────────┬─────────────────────────────┘   │  │
│   │                          │                                   │  │
│   │  ┌─────────────────────────────────────────────────────┐   │  │
│   │  │         Repository Layer (Spring Data JPA)          │   │  │
│   │  │    JPA Repositories → Hibernate ORM Queries         │   │  │
│   │  └───────────────────────┬─────────────────────────────┘   │  │
│   └──────────────────────────┼───────────────────────────────────┘  │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │  JDBC / JPA
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                   │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                  PostgreSQL 15 Database                      │  │
│   │                                                              │  │
│   │   users          students        school_classes             │  │
│   │   sections       subjects        teachers                   │  │
│   │   attendance     performance     fee_payments               │  │
│   │   class_schedules  syllabus      academic_years             │  │
│   └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

```
User Action (Browser)
        │
        ▼
React Component
        │  Axios HTTP Request
        │  Authorization: Bearer <JWT>
        ▼
Spring Security Filter
        │  Validate JWT → extract role/username
        ▼
REST Controller  (@RestController)
        │  Route to appropriate handler
        ▼
Service Layer  (@Service)
        │  Business logic, validation
        ▼
Repository Layer  (@Repository)
        │  JPA query
        ▼
PostgreSQL Database
        │  SQL Result
        ▼  (back up the chain)
JSON Response  →  React State Update  →  UI Re-render
```

---

## Authentication Flow

```
 Client                    Server
   │                          │
   │── POST /api/auth/login ──>│
   │   {username, password}   │
   │                          │── BCrypt verify password
   │                          │── Generate JWT (role + username)
   │<── 200 OK ───────────────│
   │    {token, role}         │
   │                          │
   │── GET /api/students ────>│
   │   Authorization: Bearer  │
   │   <token>                │── Validate JWT → extract role
   │                          │── Check @PreAuthorize role
   │<── 200 OK ───────────────│
   │    [{...students...}]    │
```

---

## Technology Stack Summary

| Component | Technology | Version |
|---|---|---|
| Frontend Framework | React | 18 |
| Frontend Build Tool | Vite | 5 |
| UI Component Library | Material UI (MUI) | 6 |
| HTTP Client | Axios | 1.x |
| Charting | Recharts | 2.x |
| Backend Framework | Spring Boot | 3.x |
| Language | Java | 17 |
| Security | Spring Security + JWT | 3.x |
| ORM | Hibernate (Spring Data JPA) | 6.x |
| Database | PostgreSQL | 15 |
| Build Tool | Maven | 3.x |
