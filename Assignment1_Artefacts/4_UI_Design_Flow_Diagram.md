# UI Design – Flow Diagram of UIs
## School Administration System – Screen Flow

---

## 1. Application Entry Flow

```
Browser opens localhost:5173
            │
            ▼
    ┌───────────────┐
    │   Login Page  │
    │               │
    │  [Username]   │
    │  [Password]   │
    │  [Login Btn]  │
    └───────┬───────┘
            │  POST /api/auth/login
            │  JWT + Role received
            ▼
    ┌───────────────────────────────────────────────────┐
    │           Role-Based Dashboard Redirect            │
    ├───────────┬──────────────┬──────────┬─────────────┤
    │   ADMIN   │  PRINCIPAL   │ TEACHER  │    CLERK    │
    │           │              │          │             │
    │ Dashboard │  Dashboard   │Dashboard │  Dashboard  │
    └─────┬─────┴──────┬───────┴────┬─────┴──────┬──────┘
          │            │            │             │
    ┌─────▼──┐   ┌─────▼──┐  ┌─────▼──┐   ┌─────▼──┐
    │ Admin  │   │Principal│  │Teacher │   │ Clerk  │
    │ Sidebar│   │ Sidebar │  │ Sidebar│   │ Sidebar│
    └────────┘   └─────────┘  └────────┘   └────────┘
                                                  Also:
                                        STUDENT → Student Portal
```

---

## 2. Sidebar Navigation (by Role)

```
ADMIN                    PRINCIPAL             TEACHER
─────────────────────    ─────────────────     ─────────────────────
Dashboard                Dashboard             Dashboard
User Management          Analysis              Attendance
Class Management         Reports               Performance / Marks
Section Management       Class Schedule        Syllabus
Subject Management                             Class Schedule

CLERK                    STUDENT
─────────────────────    ─────────────────
Dashboard                Student Portal
Admission Module          ├── My Profile
Fee Payment               ├── My Attendance
                          └── My Performance
```

---

## 3. Page-by-Page UI Flow

### 3.1 Login Page
```
┌──────────────────────────────┐
│         School Admin         │
│                              │
│  ┌────────────────────────┐  │
│  │       Username         │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │       Password         │  │
│  └────────────────────────┘  │
│  [        Sign In        ]   │
└──────────────────────────────┘
         │ Success
         ▼ (redirect by role)
```

### 3.2 Dashboard (All Roles)
```
┌──────────────────────────────────────────────────────┐
│  Navbar: [School Admin Title]  [User name + Logout]  │
├────────────┬─────────────────────────────────────────┤
│            │    Stat Cards (Students/Teachers/etc)   │
│  Sidebar   │    ─────────────────────────────────    │
│  (role-    │    Quick Access Buttons                 │
│  specific) │    ─────────────────────────────────    │
│            │    System Modules Panel                 │
└────────────┴─────────────────────────────────────────┘
```

### 3.3 User Management (Admin)
```
┌──────────────────────────────────────────────────┐
│ Page Header: "User Management"   [+ Add User]    │
├──────────────────────────────────────────────────┤
│  Table: # | Full Name | Username | Email | Role  │
│         | Status | Action (toggle)               │
│  Row 1: Ms. Sunita Roy | clerk1 | ... | CLERK   │
│         | Active  | [toggle green]               │
└──────────────────────────────────────────────────┘
         │ Click [+ Add User]
         ▼
┌──────────────────────────┐
│  Dialog: Add New User    │
│  [Full Name]             │
│  [Username]              │
│  [Email]                 │
│  [Password]              │
│  [Role ▼]                │
│  [Cancel]  [Create User] │
└──────────────────────────┘
```

### 3.4 Admission Module (Clerk)
```
┌─────────────────────────────────────────────┐
│ Tabs: [New Admission] | [Student List]      │
├─────────────────────────────────────────────┤
│  Stepper:                                   │
│  (1)Personal → (2)Parent → (3)Academic      │
│                          → (4)Review        │
│                                             │
│  Step 1 – Personal Details:                 │
│  [Full Name] [Date of Birth]                │
│  [Gender ▼]  [Blood Group ▼]                │
│                     [Next →]                │
├─────────────────────────────────────────────┤
│  Student List Tab:                          │
│  Table: Adm No | Name | Class | Section |  │
│         Father | Contact | Date | Status |  │
│         Actions (Edit / Delete)             │
└─────────────────────────────────────────────┘
```

### 3.5 Class & Section Management (Admin)
```
Class Management                  Section Management
─────────────────────────────     ────────────────────────────────
[+ Add New Class]                 [Select Class ▼]  [Add Section]
─────────────────────────────     ────────────────────────────────
Table: Class Name | Sections      Table: Section | Class | Actions
       | Actions                  
       Class 1 | 2 sections       Class 5 – A, B, C sections
       [Edit] [Delete]            [Edit] [Delete]
```

### 3.6 Attendance (Teacher)
```
┌──────────────────────────────────────────────┐
│ Tabs: [Mark Attendance] | [View Records]     │
├──────────────────────────────────────────────┤
│ Filter: [Class ▼] [Section ▼] [Date] [Load] │
├──────────────────────────────────────────────┤
│ Mark Attendance Tab:                         │
│  Summary: Total:30 Present:28 Absent:2       │
│  Table: # | Adm No | Name | Status ▼         │
│  Status dropdown: Present/Absent/Late/Leave  │
│                      [Save Attendance]       │
├──────────────────────────────────────────────┤
│ View Records Tab:                            │
│  Table: # | Student | Adm No | Date | Status│
│         | Action (Delete)                   │
└──────────────────────────────────────────────┘
```

### 3.7 Fee Payment (Clerk)
```
┌──────────────────────────────────────────────────┐
│  Summary Cards: [Total Collected] [Pending] [Total]│
├──────────────────────────────────────────────────┤
│ Tabs: [Process Payment] | [History] | [Pending]  │
├──────────────────────────────────────────────────┤
│ Process Payment:                                 │
│  [Student ▼] [Fee Type ▼]                        │
│  [Amount]    [Payment Mode ▼]  [Status ▼]        │
│  [Date]      [Academic Year]                     │
│  [Remarks]                                       │
│  [Process Payment & Generate Receipt]            │
├──────────────────────────────────────────────────┤
│ History / Pending Tab:                           │
│  Table: Receipt | Student | Type | Amount | Mode │
│         | Date | Status | Approve (✓)           │
└──────────────────────────────────────────────────┘
```

### 3.8 Performance (Teacher)
```
┌──────────────────────────────────────────────┐
│ Page Header: "Student Performance" [+ Add]   │
├──────────────────────────────────────────────┤
│ Filter: [Student ▼] [Year ▼] [Load]          │
├──────────────────────────────────────────────┤
│ Table: Subject | Exam Type | Marks | Max     │
│        | Percentage | Term | Remarks | Edit  │
└──────────────────────────────────────────────┘
         │ Click [+ Add Record]
         ▼
┌──────────────────────────┐
│ Dialog: Add Record       │
│ [Student ▼]              │
│ [Class ▼ → load subjects]│
│ [Subject ▼]              │
│ [Exam Type ▼]            │
│ [Marks] [Max Marks]      │
│ [Term ▼]  [Year ▼]       │
│ [Cancel]  [Save Record]  │
└──────────────────────────┘
```

### 3.9 Reports (Principal)
```
┌───────────────────────────────────────────────────┐
│ Tabs: Admission | Syllabus | Attendance |         │
│       Performance | Class Summary                 │
├───────────────────────────────────────────────────┤
│ Filter Card: [Class ▼] ([Year ▼]) [Generate]     │
├───────────────────────────────────────────────────┤
│ Admission Tab:                                    │
│  [Total Students Card]  [By-Class Table]          │
│  Recent Admissions Table                          │
│                                                   │
│ Attendance Tab:                                   │
│  Table: Adm No | Student | Total | Present |     │
│         Absent | Attendance%                      │
│                                                   │
│ Performance Tab:                                  │
│  Table: Subject | Average %                       │
└───────────────────────────────────────────────────┘
```

### 3.10 Student Portal (Student)
```
┌──────────────────────────────────────────────┐
│ Header: [Avatar] Name | Class - Section | Adm│
├──────────────────────────────────────────────┤
│ Summary Cards: [Class] [Attendance%] [Records]│
├──────────────────────────────────────────────┤
│ Tabs: [My Profile] [My Attendance] [My Marks]│
├──────────────────────────────────────────────┤
│ Profile:  Name, DOB, Gender, Blood Group,    │
│           Class, Admission Date, Address,    │
│           Parent Details                     │
│                                              │
│ Attendance: Summary (Total/Present/Absent)   │
│  Progress bar (attendance %)                 │
│  Table: Date | Status chip                   │
│                                              │
│ Performance: [Year ▼]                        │
│  Table: Subject | Exam Type | Marks |        │
│         Max | % chip | Term                  │
└──────────────────────────────────────────────┘
```

---

## 4. Navigation Flow Summary

```
Login
  ├── ADMIN ──► Dashboard ──► User Mgmt / Class / Section / Subject Mgmt
  │
  ├── PRINCIPAL ──► Dashboard ──► Analysis ──► Reports ──► Class Schedule
  │
  ├── TEACHER ──► Dashboard ──► Attendance ──► Performance ──► Syllabus
  │                                         └─► Class Schedule
  │
  ├── CLERK ──► Dashboard ──► Admission ──► Fee Payment
  │
  └── STUDENT ──► Student Portal (Profile / Attendance / Performance)
```
