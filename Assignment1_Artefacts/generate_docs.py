from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os

OUT = os.path.dirname(os.path.abspath(__file__))

def style_doc(doc):
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(11)
    for s in ['Heading 1', 'Heading 2', 'Heading 3']:
        h = doc.styles[s]
        h.font.name = 'Calibri'
        h.font.color.rgb = RGBColor(0x1e, 0x29, 0x3b)

def add_title(doc, text):
    p = doc.add_heading(text, 0)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.runs[0]
    run.font.size = Pt(18)
    run.font.color.rgb = RGBColor(0x1e, 0x29, 0x3b)

def add_h1(doc, text):
    h = doc.add_heading(text, 1)
    h.runs[0].font.color.rgb = RGBColor(0x25, 0x63, 0xeb)

def add_h2(doc, text):
    doc.add_heading(text, 2)

def shade_table_header(table):
    for cell in table.rows[0].cells:
        tc = cell._tc
        tcPr = tc.get_or_add_tcPr()
        shd = OxmlElement('w:shd')
        shd.set(qn('w:val'), 'clear')
        shd.set(qn('w:color'), 'auto')
        shd.set(qn('w:fill'), '1E293B')
        tcPr.append(shd)
        for para in cell.paragraphs:
            for run in para.runs:
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                run.font.bold = True

def make_table(doc, headers, rows, col_widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = h
    shade_table_header(t)
    for row in rows:
        cells = t.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = str(val)
    if col_widths:
        for i, row in enumerate(t.rows):
            for j, cell in enumerate(row.cells):
                cell.width = Inches(col_widths[j])
    return t

def add_code(doc, text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Courier New'
    run.font.size = Pt(8.5)
    p.paragraph_format.left_indent = Inches(0.3)

# ─────────────────────────────────────────
# DOC 1: ER Diagram
# ─────────────────────────────────────────
def doc1():
    doc = Document()
    style_doc(doc)
    add_title(doc, 'ER Diagram – School Administration System')
    p = doc.add_paragraph('Database Design (Entity-Relationship)')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.runs[0].font.color.rgb = RGBColor(0x6b, 0x72, 0x80)
    doc.add_paragraph()

    add_h1(doc, '1. Entities & Attributes')

    entities = [
        ('users', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('username', 'VARCHAR', 'UNIQUE, NOT NULL'),
            ('password', 'VARCHAR', 'NOT NULL (BCrypt hash)'),
            ('full_name', 'VARCHAR', 'NOT NULL'),
            ('email', 'VARCHAR', 'UNIQUE'),
            ('role', 'ENUM', 'NOT NULL  (ADMIN / PRINCIPAL / TEACHER / CLERK / STUDENT)'),
            ('active', 'BOOLEAN', 'NOT NULL, DEFAULT true'),
            ('student_id', 'BIGINT', 'FK → students.id  (nullable, for STUDENT role)'),
        ]),
        ('students', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('admission_number', 'VARCHAR', 'UNIQUE, NOT NULL'),
            ('name', 'VARCHAR', 'NOT NULL'),
            ('date_of_birth', 'DATE', ''),
            ('gender', 'VARCHAR', ''),
            ('blood_group', 'VARCHAR', ''),
            ('address', 'VARCHAR', ''),
            ('city', 'VARCHAR', ''),
            ('state', 'VARCHAR', ''),
            ('pincode', 'VARCHAR', ''),
            ('father_name', 'VARCHAR', ''),
            ('mother_name', 'VARCHAR', ''),
            ('parent_contact', 'VARCHAR', ''),
            ('parent_email', 'VARCHAR', ''),
            ('parent_occupation', 'VARCHAR', ''),
            ('class_id', 'BIGINT', 'FK → school_classes.id'),
            ('section_id', 'BIGINT', 'FK → sections.id'),
            ('previous_class', 'VARCHAR', ''),
            ('previous_percentage', 'DOUBLE', ''),
            ('previous_grade', 'VARCHAR', ''),
            ('previous_school', 'VARCHAR', ''),
            ('admission_date', 'DATE', ''),
            ('active', 'BOOLEAN', 'DEFAULT true'),
        ]),
        ('school_classes', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('class_name', 'VARCHAR', 'UNIQUE, NOT NULL'),
        ]),
        ('sections', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('name', 'VARCHAR', 'NOT NULL'),
            ('class_id', 'BIGINT', 'FK → school_classes.id, NOT NULL'),
        ]),
        ('subjects', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('name', 'VARCHAR', 'NOT NULL'),
            ('code', 'VARCHAR', 'UNIQUE, NOT NULL'),
            ('class_id', 'BIGINT', 'FK → school_classes.id'),
        ]),
        ('teachers', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('user_id', 'BIGINT', 'FK → users.id, NOT NULL (1:1)'),
            ('employee_id', 'VARCHAR', 'UNIQUE'),
            ('qualification', 'VARCHAR', ''),
            ('designation', 'VARCHAR', ''),
        ]),
        ('attendance', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('student_id', 'BIGINT', 'FK → students.id, NOT NULL'),
            ('date', 'DATE', 'NOT NULL'),
            ('status', 'ENUM', 'NOT NULL  (PRESENT / ABSENT / LATE / LEAVE)'),
            ('marked_by', 'BIGINT', 'FK → users.id'),
            ('class_id', 'BIGINT', 'FK → school_classes.id'),
            ('section_id', 'BIGINT', 'FK → sections.id'),
        ]),
        ('performance', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('student_id', 'BIGINT', 'FK → students.id, NOT NULL'),
            ('subject_id', 'BIGINT', 'FK → subjects.id, NOT NULL'),
            ('exam_type', 'ENUM', 'NOT NULL  (CLASS_TEST / UNIT_TEST / MIDTERM / FINAL / ASSIGNMENT)'),
            ('marks', 'DOUBLE', 'NOT NULL'),
            ('max_marks', 'DOUBLE', 'NOT NULL'),
            ('term', 'VARCHAR', 'NOT NULL'),
            ('academic_year', 'VARCHAR', 'NOT NULL'),
            ('remarks', 'VARCHAR', ''),
            ('recorded_by', 'BIGINT', 'FK → users.id'),
        ]),
        ('fee_payments', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('student_id', 'BIGINT', 'FK → students.id, NOT NULL'),
            ('amount', 'DOUBLE', 'NOT NULL'),
            ('fee_type', 'VARCHAR', 'NOT NULL'),
            ('payment_date', 'DATE', ''),
            ('payment_mode', 'VARCHAR', ''),
            ('receipt_number', 'VARCHAR', 'UNIQUE'),
            ('status', 'ENUM', 'NOT NULL  (PAID / PENDING / PARTIAL / WAIVED)'),
            ('remarks', 'VARCHAR', ''),
            ('academic_year', 'VARCHAR', ''),
            ('processed_by', 'BIGINT', 'FK → users.id'),
        ]),
        ('class_schedules', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('class_id', 'BIGINT', 'FK → school_classes.id, NOT NULL'),
            ('section_id', 'BIGINT', 'FK → sections.id, NOT NULL'),
            ('subject_id', 'BIGINT', 'FK → subjects.id, NOT NULL'),
            ('teacher_id', 'BIGINT', 'FK → users.id, NOT NULL'),
            ('day', 'VARCHAR', 'NOT NULL'),
            ('period', 'INTEGER', 'NOT NULL'),
            ('start_time', 'VARCHAR', 'NOT NULL'),
            ('end_time', 'VARCHAR', 'NOT NULL'),
            ('academic_year', 'VARCHAR', ''),
        ]),
        ('syllabus', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('class_id', 'BIGINT', 'FK → school_classes.id, NOT NULL'),
            ('subject_id', 'BIGINT', 'FK → subjects.id, NOT NULL'),
            ('term', 'VARCHAR', 'NOT NULL'),
            ('topic', 'VARCHAR', 'NOT NULL'),
            ('description', 'TEXT', ''),
            ('completed', 'BOOLEAN', 'DEFAULT false'),
            ('completed_date', 'DATE', ''),
            ('academic_year', 'VARCHAR', ''),
            ('teacher_id', 'BIGINT', 'FK → users.id'),
        ]),
        ('academic_years', [
            ('id', 'BIGINT', 'PK, AUTO_INCREMENT'),
            ('year', 'VARCHAR', 'UNIQUE, NOT NULL'),
            ('start_date', 'DATE', ''),
            ('end_date', 'DATE', ''),
            ('active', 'BOOLEAN', 'DEFAULT true'),
        ]),
    ]

    for name, cols in entities:
        add_h2(doc, f'Table: {name}')
        make_table(doc, ['Column', 'Data Type', 'Constraint'], cols, [2.0, 1.2, 3.3])
        doc.add_paragraph()

    add_h1(doc, '2. Relationships')
    rels = [
        ('school_classes', 'sections', 'One-to-Many', 'One class has many sections'),
        ('school_classes', 'subjects', 'One-to-Many', 'One class has many subjects'),
        ('school_classes', 'students', 'One-to-Many', 'One class has many students'),
        ('sections', 'students', 'One-to-Many', 'One section has many students'),
        ('students', 'attendance', 'One-to-Many', 'One student has many attendance records'),
        ('students', 'performance', 'One-to-Many', 'One student has many performance records'),
        ('students', 'fee_payments', 'One-to-Many', 'One student has many fee payments'),
        ('subjects', 'performance', 'One-to-Many', 'One subject has many performance records'),
        ('subjects', 'class_schedules', 'One-to-Many', 'One subject appears in many schedules'),
        ('subjects', 'syllabus', 'One-to-Many', 'One subject has many syllabus entries'),
        ('users', 'teachers', 'One-to-One', 'Each teacher user has one teacher profile'),
        ('users', 'attendance', 'One-to-Many', 'One user (teacher) marks many attendance records'),
        ('users', 'class_schedules', 'One-to-Many', 'One teacher is assigned to many schedule slots'),
        ('users', 'fee_payments', 'One-to-Many', 'One clerk processes many fee payments'),
    ]
    make_table(doc, ['Parent Table', 'Child Table', 'Cardinality', 'Description'], rels, [1.5, 1.5, 1.3, 2.2])
    doc.add_paragraph()

    add_h1(doc, '3. ER Diagram (Textual Notation)')
    er_text = (
        "school_classes (PK: id, class_name)\n"
        "    |-- 1:N --> sections (PK: id, name, FK: class_id)\n"
        "    |-- 1:N --> subjects (PK: id, name, code, FK: class_id)\n"
        "    |-- 1:N --> students (PK: id, admission_number, FK: class_id, section_id)\n"
        "                  |-- 1:N --> attendance (PK: id, FK: student_id, date, status)\n"
        "                  |-- 1:N --> performance (PK: id, FK: student_id, subject_id, marks)\n"
        "                  |-- 1:N --> fee_payments (PK: id, FK: student_id, amount, status)\n"
        "\n"
        "users (PK: id, username, role)\n"
        "    |-- 1:1 --> teachers (PK: id, FK: user_id, employee_id)\n"
        "    |-- 1:N --> attendance (as marked_by)\n"
        "    |-- 1:N --> performance (as recorded_by)\n"
        "    |-- 1:N --> fee_payments (as processed_by)\n"
        "    |-- 1:N --> class_schedules (as teacher)\n"
        "    |-- 1:N --> syllabus (as teacher)\n"
        "\n"
        "subjects (PK: id) --> class_schedules, syllabus, performance\n"
        "school_classes + sections --> class_schedules (composite FK)\n"
        "school_classes + subjects --> syllabus (composite FK)"
    )
    add_code(doc, er_text)

    path = os.path.join(OUT, '1_ER_Diagram_DB_Design.docx')
    doc.save(path)
    print(f'Saved: {path}')

# ─────────────────────────────────────────
# DOC 2: Architecture Diagram
# ─────────────────────────────────────────
def doc2():
    doc = Document()
    style_doc(doc)
    add_title(doc, 'Architecture Diagram')
    p = doc.add_paragraph('School Administration System – High-Level Architecture')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.runs[0].font.color.rgb = RGBColor(0x6b, 0x72, 0x80)
    doc.add_paragraph()

    add_h1(doc, '1. Overview')
    doc.add_paragraph(
        'The School Administration System is built on a classic 3-Tier Web Architecture '
        'with clear separation of concerns. The three tiers are: Presentation (React frontend), '
        'Business Logic (Spring Boot REST API), and Data (PostgreSQL database). '
        'Communication between tiers uses HTTP/REST with JSON payloads and JWT-based authentication.'
    )

    add_h1(doc, '2. Architecture Diagram')
    arch = (
        "┌──────────────────────────────────────────────────────────────┐\n"
        "│                    CLIENT BROWSER                           │\n"
        "│                                                              │\n"
        "│   PRESENTATION LAYER  –  React 18 + Vite + MUI v6           │\n"
        "│                                                              │\n"
        "│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │\n"
        "│   │  Login   │  │Dashboard │  │  Admin   │  │ Teacher  │  │\n"
        "│   │  Page    │  │          │  │  Pages   │  │  Pages   │  │\n"
        "│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │\n"
        "│   ┌──────────┐  ┌──────────┐  ┌──────────┐                │\n"
        "│   │  Clerk   │  │Principal │  │ Student  │                │\n"
        "│   │  Pages   │  │  Pages   │  │  Portal  │                │\n"
        "│   └──────────┘  └──────────┘  └──────────┘                │\n"
        "│                                                              │\n"
        "│   React Router v6  |  Axios HTTP Client  |  React Context   │\n"
        "└──────────────────────────┬───────────────────────────────────┘\n"
        "                           │  HTTP/REST + JWT Bearer Token\n"
        "                           ▼\n"
        "┌──────────────────────────────────────────────────────────────┐\n"
        "│                SERVER  (localhost:8080)                      │\n"
        "│                                                              │\n"
        "│   BUSINESS LOGIC LAYER  –  Spring Boot 3 + Java 17          │\n"
        "│                                                              │\n"
        "│   Spring Security Filter  →  JWT Auth Validation            │\n"
        "│                                                              │\n"
        "│   REST Controllers  →  Service Layer  →  Repository Layer   │\n"
        "│   (@RestController)    (@Service)        (Spring Data JPA)  │\n"
        "└──────────────────────────┬───────────────────────────────────┘\n"
        "                           │  JDBC / JPA (Hibernate ORM)\n"
        "                           ▼\n"
        "┌──────────────────────────────────────────────────────────────┐\n"
        "│                     DATA LAYER                              │\n"
        "│                PostgreSQL 15 Database                        │\n"
        "│   12 Tables: users, students, school_classes, sections,      │\n"
        "│   subjects, teachers, attendance, performance,               │\n"
        "│   fee_payments, class_schedules, syllabus, academic_years   │\n"
        "└──────────────────────────────────────────────────────────────┘"
    )
    add_code(doc, arch)
    doc.add_paragraph()

    add_h1(doc, '3. Component Interaction Flow')
    flow = (
        "User Action (Browser)\n"
        "    │\n"
        "    ▼  Axios HTTP Request + Authorization: Bearer <JWT>\n"
        "Spring Security Filter  →  Validate JWT, extract role/username\n"
        "    │\n"
        "    ▼\n"
        "REST Controller  (@RestController)  →  Route to handler method\n"
        "    │\n"
        "    ▼\n"
        "Service Layer  (@Service)  →  Business logic + validation\n"
        "    │\n"
        "    ▼\n"
        "Repository Layer  (@Repository)  →  JPA query to PostgreSQL\n"
        "    │\n"
        "    ▼  SQL Result\n"
        "JSON Response  →  React state update  →  UI re-render"
    )
    add_code(doc, flow)
    doc.add_paragraph()

    add_h1(doc, '4. Authentication Flow')
    auth = (
        "Client                              Server\n"
        "  │                                   │\n"
        "  │── POST /api/auth/login ──────────>│\n"
        "  │   { username, password }          │── BCrypt verify password\n"
        "  │                                   │── Generate JWT (role + username)\n"
        "  │<── 200 OK ────────────────────────│\n"
        "  │    { token, role }                │\n"
        "  │                                   │\n"
        "  │── GET /api/students ─────────────>│\n"
        "  │   Authorization: Bearer <token>   │── Validate JWT\n"
        "  │                                   │── Check @PreAuthorize role\n"
        "  │<── 200 OK ────────────────────────│\n"
        "  │    [{ ...students... }]            │"
    )
    add_code(doc, auth)
    doc.add_paragraph()

    add_h1(doc, '5. Technology Stack')
    tech = [
        ('Frontend Framework', 'React', '18'),
        ('Frontend Build Tool', 'Vite', '5'),
        ('UI Component Library', 'Material UI (MUI)', '6'),
        ('HTTP Client', 'Axios', '1.x'),
        ('Charting', 'Recharts', '2.x'),
        ('Backend Framework', 'Spring Boot', '3.x'),
        ('Language', 'Java', '17'),
        ('Security', 'Spring Security + JWT', '3.x'),
        ('ORM', 'Hibernate / Spring Data JPA', '6.x'),
        ('Database', 'PostgreSQL', '15'),
        ('Build Tool', 'Maven', '3.x'),
    ]
    make_table(doc, ['Component', 'Technology', 'Version'], tech, [2.5, 2.5, 1.0])

    path = os.path.join(OUT, '2_Architecture_Diagram.docx')
    doc.save(path)
    print(f'Saved: {path}')

# ─────────────────────────────────────────
# DOC 3: SRS
# ─────────────────────────────────────────
def doc3():
    doc = Document()
    style_doc(doc)
    add_title(doc, 'Software Requirements Specification (SRS)')
    p = doc.add_paragraph('School Administration System  |  Version 1.0  |  November 2026')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.runs[0].font.color.rgb = RGBColor(0x6b, 0x72, 0x80)
    doc.add_paragraph()

    add_h1(doc, '1. Introduction')
    add_h2(doc, '1.1 Purpose')
    doc.add_paragraph(
        'This document specifies the functional and non-functional requirements for the '
        'School Administration System — a web-based application to digitise all key '
        'school administrative operations.'
    )
    add_h2(doc, '1.2 Scope')
    doc.add_paragraph(
        'The system covers: user authentication, student admissions, class/section/subject '
        'management, daily attendance, fee processing, academic performance tracking, '
        'syllabus management, timetable scheduling, and report generation — all accessible '
        'via a role-based web portal.'
    )
    add_h2(doc, '1.3 User Roles')
    make_table(doc, ['Role', 'Description'], [
        ('Admin', 'Full system control — users, classes, sections, subjects'),
        ('Principal', 'Read-only access to reports, analysis, schedules'),
        ('Teacher', 'Attendance, performance, syllabus, timetable'),
        ('Clerk', 'Student admissions, fee payments'),
        ('Student', 'View own profile, attendance, performance'),
    ], [1.5, 5.0])

    add_h1(doc, '2. Functional Requirements')
    frs = [
        ('FR-01', 'Authentication', [
            'FR-01.1: Users shall log in using username and password.',
            'FR-01.2: System shall issue a JWT token upon successful login.',
            'FR-01.3: All API endpoints (except login) shall require a valid JWT.',
            'FR-01.4: System shall enforce role-based access per module.',
            'FR-01.5: Admin shall activate or deactivate any user account.',
        ]),
        ('FR-02', 'User Management', [
            'FR-02.1: Admin shall create users with roles: ADMIN, PRINCIPAL, TEACHER, CLERK, STUDENT.',
            'FR-02.2: Admin shall view all registered users in a table.',
            'FR-02.3: Admin shall toggle the active/inactive status of any user.',
            'FR-02.4: Student-role users must link to a valid student record.',
        ]),
        ('FR-03', 'Class Management', [
            'FR-03.1: Admin shall create, update, and delete school classes.',
            'FR-03.2: System shall display the number of sections per class.',
            'FR-03.3: Deletion prevented if students or sections are linked.',
        ]),
        ('FR-04', 'Section Management', [
            'FR-04.1: Admin shall create, update, and delete sections within a class.',
            'FR-04.2: Sections shall be linked to exactly one class.',
            'FR-04.3: Admin shall filter sections by selecting a class.',
        ]),
        ('FR-05', 'Subject Management', [
            'FR-05.1: Admin shall create subjects with a name and unique code.',
            'FR-05.2: Each subject shall be assigned to one class.',
            'FR-05.3: Admin shall update and delete subjects.',
        ]),
        ('FR-06', 'Student Admission', [
            'FR-06.1: Clerk shall admit students via a multi-step form (Personal → Parent → Academic → Review).',
            'FR-06.2: System shall auto-generate a unique admission number.',
            'FR-06.3: Clerk shall view all students with class, section, and status.',
            'FR-06.4: Clerk shall edit student details and deactivate students.',
        ]),
        ('FR-07', 'Attendance Management', [
            'FR-07.1: Teacher shall select class, section, and date to load the student list.',
            'FR-07.2: Teacher shall mark each student as PRESENT, ABSENT, LATE, or LEAVE.',
            'FR-07.3: Teacher shall save attendance for the entire class at once.',
            'FR-07.4: Teacher shall view and delete existing attendance records.',
            'FR-07.5: Student shall view own attendance history (last 30 records).',
            'FR-07.6: Student shall view attendance summary (total, present, absent, %).',
        ]),
        ('FR-08', 'Fee Payment', [
            'FR-08.1: Clerk shall process fee payments specifying type, amount, mode, and date.',
            'FR-08.2: System shall auto-generate a unique receipt number.',
            'FR-08.3: Clerk shall view all payment records and filter by pending.',
            'FR-08.4: Clerk shall approve a pending payment (→ PAID).',
            'FR-08.5: Summary cards show total collected, total pending, total records.',
            'FR-08.6: Fee types: Tuition, Exam, Library, Sports, Transport, Miscellaneous.',
            'FR-08.7: Payment modes: Cash, Cheque, Online Transfer, UPI, DD.',
        ]),
        ('FR-09', 'Performance / Marks', [
            'FR-09.1: Teacher shall record exam results (subject, type, marks, term, year).',
            'FR-09.2: Exam types: Class Test, Unit Test, Midterm, Final, Assignment.',
            'FR-09.3: Teacher shall update and delete performance records.',
            'FR-09.4: System shall calculate and display percentage for each record.',
            'FR-09.5: Student shall view own records filtered by academic year.',
        ]),
        ('FR-10', 'Syllabus Management', [
            'FR-10.1: Teacher shall add syllabus topics per class, subject, and term.',
            'FR-10.2: Teacher shall mark topics as completed with a completion date.',
            'FR-10.3: Teacher shall update and delete syllabus entries.',
            'FR-10.4: Principal shall view syllabus completion % in reports.',
        ]),
        ('FR-11', 'Class Schedule', [
            'FR-11.1: Teacher shall create timetable entries (subject, teacher, period, day).',
            'FR-11.2: System shall support 8 periods per day, Monday–Saturday.',
            'FR-11.3: Teacher shall update and delete schedule entries.',
        ]),
        ('FR-12', 'Reports', [
            'FR-12.1: Admission Report – total students, count by class, recent admissions.',
            'FR-12.2: Attendance Report – per-student summary for a class.',
            'FR-12.3: Performance Report – average score by subject for a class/year.',
            'FR-12.4: Syllabus Report – completion stats for a class/year.',
            'FR-12.5: Class Summary – active students per class.',
        ]),
        ('FR-13', 'Analysis Dashboard', [
            'FR-13.1: Bar chart showing average performance % per class.',
            'FR-13.2: Pie chart showing fee collection by fee type.',
            'FR-13.3: Financial summary (collected, pending, total transactions).',
        ]),
    ]
    for fr_id, title, items in frs:
        add_h2(doc, f'{fr_id}: {title}')
        for item in items:
            p = doc.add_paragraph(item, style='List Bullet')
            p.paragraph_format.left_indent = Inches(0.3)
        doc.add_paragraph()

    add_h1(doc, '3. Non-Functional Requirements')
    nfrs = [
        ('NFR-01', 'Security', 'All passwords stored as BCrypt hashes.'),
        ('NFR-02', 'Security', 'JWT tokens expire after a configured duration.'),
        ('NFR-03', 'Performance', 'API list endpoints shall respond within 2 seconds under normal load.'),
        ('NFR-04', 'Usability', 'UI shall be functional on screens ≥ 1024px wide.'),
        ('NFR-05', 'Reliability', 'System shall handle invalid inputs with HTTP 400/401/403/404.'),
        ('NFR-06', 'Maintainability', 'Backend follows MVC: Controller → Service → Repository.'),
        ('NFR-07', 'Portability', 'Deployable on any OS with Java 17+ and PostgreSQL 15+.'),
        ('NFR-08', 'Data Integrity', 'Foreign key constraints enforced at database level.'),
    ]
    make_table(doc, ['ID', 'Category', 'Requirement'], nfrs, [0.8, 1.5, 4.2])

    path = os.path.join(OUT, '3_SRS_Document.docx')
    doc.save(path)
    print(f'Saved: {path}')

# ─────────────────────────────────────────
# DOC 4: UI Flow Diagram
# ─────────────────────────────────────────
def doc4():
    doc = Document()
    style_doc(doc)
    add_title(doc, 'UI Design – Flow Diagram of UIs')
    p = doc.add_paragraph('School Administration System – Screen Flow & Page Layouts')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.runs[0].font.color.rgb = RGBColor(0x6b, 0x72, 0x80)
    doc.add_paragraph()

    add_h1(doc, '1. Application Entry Flow')
    add_code(doc,
        "Browser → localhost:5173\n"
        "         |\n"
        "         ▼\n"
        "   [ Login Page ]\n"
        "   Username + Password → POST /api/auth/login\n"
        "         |\n"
        "         ▼  JWT + Role received\n"
        "   Role-Based Redirect:\n"
        "   ADMIN      → Admin Dashboard\n"
        "   PRINCIPAL  → Principal Dashboard\n"
        "   TEACHER    → Teacher Dashboard\n"
        "   CLERK      → Clerk Dashboard\n"
        "   STUDENT    → Student Portal"
    )

    add_h1(doc, '2. Sidebar Navigation by Role')
    make_table(doc, ['Role', 'Navigation Items'], [
        ('Admin', 'Dashboard, User Management, Class Management, Section Management, Subject Management'),
        ('Principal', 'Dashboard, Analysis, Reports, Class Schedule'),
        ('Teacher', 'Dashboard, Attendance, Performance / Marks, Syllabus, Class Schedule'),
        ('Clerk', 'Dashboard, Admission Module, Fee Payment'),
        ('Student', 'Student Portal (My Profile / My Attendance / My Performance)'),
    ], [1.2, 5.3])
    doc.add_paragraph()

    add_h1(doc, '3. Page-by-Page UI Flow')

    pages = [
        ('3.1 Login Page', (
            "┌──────────────────────────────────┐\n"
            "│         School Admin             │\n"
            "│  ┌──────────────────────────┐    │\n"
            "│  │  Username                │    │\n"
            "│  └──────────────────────────┘    │\n"
            "│  ┌──────────────────────────┐    │\n"
            "│  │  Password                │    │\n"
            "│  └──────────────────────────┘    │\n"
            "│  [        Sign In          ]     │\n"
            "└──────────────────────────────────┘\n"
            "  → On success: redirect by role"
        )),
        ('3.2 Dashboard (All Roles)', (
            "┌──────────────────────────────────────────────────────┐\n"
            "│  Navbar: School Admin Title  |  Username + Logout    │\n"
            "├──────────────┬───────────────────────────────────────┤\n"
            "│              │  Stat Cards: Students / Classes / etc │\n"
            "│  Sidebar     │  ─────────────────────────────────    │\n"
            "│  (role-      │  Quick Access Buttons                 │\n"
            "│   specific)  │  ─────────────────────────────────    │\n"
            "│              │  System Modules Panel                 │\n"
            "└──────────────┴───────────────────────────────────────┘"
        )),
        ('3.3 User Management (Admin)', (
            "┌──────────────────────────────────────────────────────┐\n"
            "│  Page Header: 'User Management'    [+ Add User]      │\n"
            "├──────────────────────────────────────────────────────┤\n"
            "│  Table: # | Full Name | Username | Email | Role      │\n"
            "│         | Status chip | Action (toggle)              │\n"
            "└──────────────────────────────────────────────────────┘\n"
            "  → [+ Add User] opens dialog:\n"
            "    [Full Name] [Username] [Email] [Password] [Role ▼]"
        )),
        ('3.4 Admission Module (Clerk)', (
            "┌────────────────────────────────────────────────┐\n"
            "│  Tabs: [New Admission] | [Student List]        │\n"
            "├────────────────────────────────────────────────┤\n"
            "│  Stepper: Personal → Parent → Academic → Review│\n"
            "│                                                │\n"
            "│  Step 1: [Full Name] [Date of Birth]           │\n"
            "│          [Gender ▼]  [Blood Group ▼]           │\n"
            "│  Step 2: [Father] [Mother] [Contact] [Address] │\n"
            "│  Step 3: [Class ▼] [Section ▼] [Prev School]   │\n"
            "│  Step 4: Review all details → [Submit]         │\n"
            "├────────────────────────────────────────────────┤\n"
            "│  Student List: Adm No | Name | Class | Section │\n"
            "│  | Father | Contact | Date | Status | Actions  │\n"
            "└────────────────────────────────────────────────┘"
        )),
        ('3.5 Attendance (Teacher)', (
            "┌──────────────────────────────────────────────────┐\n"
            "│  Tabs: [Mark Attendance] | [View Records]        │\n"
            "├──────────────────────────────────────────────────┤\n"
            "│  Filter: [Class ▼] [Section ▼] [Date] [Load]    │\n"
            "├──────────────────────────────────────────────────┤\n"
            "│  Mark Tab: Total | Present | Absent counts       │\n"
            "│  Table: # | Adm No | Name | Status dropdown ▼   │\n"
            "│  Status: Present / Absent / Late / Leave         │\n"
            "│                        [Save Attendance]         │\n"
            "├──────────────────────────────────────────────────┤\n"
            "│  View Tab: # | Student | Adm No | Date | Status │\n"
            "│  | Delete action                                  │\n"
            "└──────────────────────────────────────────────────┘"
        )),
        ('3.6 Fee Payment (Clerk)', (
            "┌────────────────────────────────────────────────────┐\n"
            "│  Summary Cards: Total Collected | Pending | Total  │\n"
            "├────────────────────────────────────────────────────┤\n"
            "│  Tabs: [Process Payment] | [History] | [Pending]  │\n"
            "├────────────────────────────────────────────────────┤\n"
            "│  Process: [Student ▼] [Fee Type ▼]                 │\n"
            "│  [Amount] [Mode ▼] [Status ▼] [Date] [Year]        │\n"
            "│  [Remarks]  [Process Payment & Generate Receipt]   │\n"
            "├────────────────────────────────────────────────────┤\n"
            "│  History: Receipt | Student | Type | Amount        │\n"
            "│  | Mode | Date | Status chip | Approve (✓)         │\n"
            "└────────────────────────────────────────────────────┘"
        )),
        ('3.7 Performance / Marks (Teacher)', (
            "┌──────────────────────────────────────────────────┐\n"
            "│  Header: 'Student Performance'   [+ Add Record]  │\n"
            "├──────────────────────────────────────────────────┤\n"
            "│  Filter: [Student ▼] [Academic Year ▼] [Load]   │\n"
            "├──────────────────────────────────────────────────┤\n"
            "│  Table: Subject | Exam Type | Marks | Max        │\n"
            "│  | Percentage chip | Term | Remarks | Edit/Del   │\n"
            "└──────────────────────────────────────────────────┘\n"
            "  → [+ Add Record] dialog:\n"
            "    [Student ▼] [Class ▼] [Subject ▼] [Exam Type ▼]\n"
            "    [Marks] [Max Marks] [Term ▼] [Year ▼] [Remarks]"
        )),
        ('3.8 Reports (Principal)', (
            "┌────────────────────────────────────────────────────────┐\n"
            "│  Tabs: Admission | Syllabus | Attendance               │\n"
            "│        | Performance | Class Summary                   │\n"
            "├────────────────────────────────────────────────────────┤\n"
            "│  Filter: [Class ▼] ([Year ▼])   [Generate]            │\n"
            "├────────────────────────────────────────────────────────┤\n"
            "│  Admission: Total Students card + By-Class table       │\n"
            "│             Recent Admissions table                    │\n"
            "│  Attendance: Adm No | Student | Total | Present        │\n"
            "│              | Absent | Attendance % chip              │\n"
            "│  Performance: Subject | Average % chip                 │\n"
            "│  Syllabus: Total | Completed | Pending + progress bar  │\n"
            "└────────────────────────────────────────────────────────┘"
        )),
        ('3.9 Student Portal (Student)', (
            "┌──────────────────────────────────────────────────┐\n"
            "│  Header: [Avatar] Name | Class – Section | Adm#  │\n"
            "├──────────────────────────────────────────────────┤\n"
            "│  Cards: Class info | Attendance % | Records count│\n"
            "├──────────────────────────────────────────────────┤\n"
            "│  Tabs: [My Profile] | [My Attendance] | [Marks]  │\n"
            "├──────────────────────────────────────────────────┤\n"
            "│  Profile: Name, DOB, Gender, Class, Adm Date,    │\n"
            "│           Address, Father, Mother, Contact        │\n"
            "│  Attendance: Total/Present/Absent + progress bar  │\n"
            "│              Table: Date | Status chip            │\n"
            "│  Performance: [Year ▼]                           │\n"
            "│   Table: Subject | Exam Type | Marks | % chip    │\n"
            "└──────────────────────────────────────────────────┘"
        )),
    ]
    for title, diagram in pages:
        add_h2(doc, title)
        add_code(doc, diagram)
        doc.add_paragraph()

    add_h1(doc, '4. Complete Navigation Flow')
    add_code(doc,
        "Login\n"
        "  ├── ADMIN      → Dashboard → User Mgmt / Class / Section / Subject Mgmt\n"
        "  ├── PRINCIPAL  → Dashboard → Analysis → Reports → Class Schedule\n"
        "  ├── TEACHER    → Dashboard → Attendance → Performance → Syllabus → Schedule\n"
        "  ├── CLERK      → Dashboard → Admission → Fee Payment\n"
        "  └── STUDENT    → Student Portal (Profile / Attendance / Performance)"
    )

    path = os.path.join(OUT, '4_UI_Design_Flow_Diagram.docx')
    doc.save(path)
    print(f'Saved: {path}')

# ─────────────────────────────────────────
# DOC 5: Abstract
# ─────────────────────────────────────────
def doc5():
    doc = Document()
    style_doc(doc)
    add_title(doc, 'Project Abstract')
    p = doc.add_paragraph('School Administration System')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.runs[0].font.size = Pt(13)
    p.runs[0].font.bold = True
    doc.add_paragraph()

    add_h1(doc, 'Problem Statement')
    doc.add_paragraph(
        'Educational institutions manage large volumes of administrative data — student '
        'records, attendance, fee payments, academic performance, timetables, and syllabus '
        'tracking — primarily through manual registers or disconnected spreadsheets. This leads '
        'to data inconsistency, delayed access to information, difficulty in generating reports, '
        'and high administrative overhead. School staff, teachers, and management often lack a '
        'unified digital platform to collaborate efficiently.'
    )

    add_h1(doc, 'Objective')
    doc.add_paragraph(
        'To design and develop a centralised, role-based School Administration System that '
        'digitises and automates all key administrative operations of a school — from student '
        'admission to fee collection, attendance marking, performance tracking, syllabus '
        'management, and report generation — accessible through a secure web interface.'
    )

    add_h1(doc, 'Solution Planned')
    doc.add_paragraph(
        'A full-stack web application built on a client-server architecture, where a React.js '
        'single-page application serves as the frontend UI, a Spring Boot REST API provides the '
        'backend business logic, and a PostgreSQL relational database stores all persistent data. '
        'JWT-based authentication enforces role-based access control so each user role sees only '
        'the modules relevant to their responsibilities.'
    )

    add_h1(doc, 'Technologies Used')
    make_table(doc, ['Layer', 'Technology'], [
        ('Frontend', 'React 18, Vite, Material UI (MUI v6)'),
        ('Backend', 'Spring Boot 3, Spring Security, Spring Data JPA'),
        ('Database', 'PostgreSQL 15'),
        ('Authentication', 'JWT (JSON Web Tokens)'),
        ('Backend Build', 'Maven 3, Java 17'),
        ('Frontend Build', 'npm, Vite 5'),
    ], [2.0, 4.5])
    doc.add_paragraph()

    add_h1(doc, 'Modules')
    modules = [
        ('1', 'User Management', 'Create and manage system users; assign roles; activate/deactivate accounts'),
        ('2', 'Admission Module', 'Multi-step student admission wizard; edit and deactivate student records'),
        ('3', 'Class & Section Management', 'Define school classes and assign sections to each class'),
        ('4', 'Subject Management', 'Assign subjects to classes with unique subject codes'),
        ('5', 'Attendance Module', 'Daily attendance marking by class/section; view historical records'),
        ('6', 'Fee Payment Module', 'Process fee payments; generate receipts; approve pending payments'),
        ('7', 'Performance / Marks', 'Record exam results; track grades per subject, term, and year'),
        ('8', 'Syllabus Tracker', 'Track topic completion per class, subject, and term'),
        ('9', 'Class Schedule', 'Assign subjects and teachers to time slots per day and period'),
        ('10', 'Reports & Analysis', 'Admission, attendance, performance, syllabus, and class summary reports'),
    ]
    make_table(doc, ['#', 'Module', 'Description'], modules, [0.3, 2.0, 4.2])
    doc.add_paragraph()

    add_h1(doc, 'Users / Roles')
    make_table(doc, ['Role', 'Responsibilities'], [
        ('Admin', 'Full system access; user, class, section, and subject management'),
        ('Principal', 'View all reports, analysis dashboards, class schedules'),
        ('Teacher', 'Mark attendance, record performance, update syllabus, manage schedules'),
        ('Clerk', 'Process student admissions, manage fee payments'),
        ('Student', 'View own profile, attendance history, and performance records'),
    ], [1.2, 5.3])
    doc.add_paragraph()

    add_h1(doc, 'Summary')
    doc.add_paragraph(
        'The School Administration System replaces paper-based and disconnected processes '
        'with a unified digital platform. It reduces administrative burden, improves data '
        'accuracy, enables instant reporting, and provides stakeholders at every level — '
        'from students to the principal — with real-time access to relevant information '
        'through a clean, professional web interface.'
    )

    path = os.path.join(OUT, '5_Abstract.docx')
    doc.save(path)
    print(f'Saved: {path}')

# ─────────────────────────────────────────
# DOC 6: PPT Outline
# ─────────────────────────────────────────
def doc6():
    doc = Document()
    style_doc(doc)
    add_title(doc, 'PPT Slide Outline')
    p = doc.add_paragraph('School Administration System – Presentation Brief (7 Slides)')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.runs[0].font.color.rgb = RGBColor(0x6b, 0x72, 0x80)
    doc.add_paragraph()

    slides = [
        ('Slide 1 – Title Slide', [
            'Title: School Administration System',
            'Subtitle: A Full-Stack Web Application for Digital School Management',
            'Course: Full Stack Application Development (FSAD)',
            'Team: [Your team member names]',
            'Date: November 2026',
        ]),
        ('Slide 2 – Problem Statement', [
            'Student records maintained in physical registers — prone to loss and errors',
            'Attendance marked manually — no centralised tracking or reports',
            'Fee collection tracked in spreadsheets — no receipt generation or approval workflow',
            'Performance data fragmented across teachers — no unified academic history',
            'No single platform for all stakeholders (Admin, Principal, Teacher, Clerk, Student)',
            'Result: High administrative overhead, data inconsistency, delayed decision-making',
        ]),
        ('Slide 3 – Objective & Solution', [
            'Objective: Build a centralised, role-based web application that digitises all key school administrative operations',
            'Solution: Secure full-stack web portal with role-based access',
            'Each role sees only relevant modules',
            'All data in a single PostgreSQL database',
            'REST API with JWT-based authentication',
            'Real-time reports and dashboards for the principal',
        ]),
        ('Slide 4 – Architecture', [
            '3-Tier Architecture: React Frontend ↔ Spring Boot API ↔ PostgreSQL',
            'Presentation Layer: React 18 + Material UI v6 (localhost:5173)',
            'Business Logic Layer: Spring Boot 3 + Spring Security + JWT (localhost:8080)',
            'Data Layer: PostgreSQL 15 with Hibernate ORM (12 tables)',
            'Communication: HTTP/REST with JSON payloads + Bearer Token auth',
        ]),
        ('Slide 5 – Modules & Users', [
            '10 Functional Modules: User Mgmt, Admission, Class/Section/Subject Mgmt, Attendance, Fee Payment, Performance, Syllabus, Schedule, Reports',
            '5 User Roles: Admin · Principal · Teacher · Clerk · Student',
            'Role-based routing on both frontend (React Router) and backend (@PreAuthorize)',
            'Each module is accessible only to its authorised role(s)',
        ]),
        ('Slide 6 – Technologies Used', [
            'Frontend: React 18, Vite, Material UI v6, React Router v6, Axios, Recharts',
            'Backend: Spring Boot 3, Java 17, Spring Security, JWT',
            'Database: PostgreSQL 15, Hibernate / Spring Data JPA',
            'Build Tools: Maven (backend), npm + Vite (frontend)',
            'Key decisions: Stateless JWT auth, BCrypt password hashing, Role-based access on both layers',
        ]),
        ('Slide 7 – Summary & Demo', [
            'Production-ready full-stack school admin portal',
            '10 modules covering the full school administration lifecycle',
            '5 distinct role-based interfaces with protected routes',
            'Clean, professional UI with consistent design system',
            'Real-time reports with charts for the principal dashboard',
            'Database: 12 tables, fully normalised with FK constraints',
            'Demo flow: Admin setup → Clerk admission/fees → Teacher attendance/marks → Principal reports → Student view',
        ]),
    ]

    for slide_title, points in slides:
        add_h1(doc, slide_title)
        for point in points:
            p = doc.add_paragraph(point, style='List Bullet')
            p.paragraph_format.left_indent = Inches(0.3)
        doc.add_paragraph()

    path = os.path.join(OUT, '6_PPT_Slide_Outline.docx')
    doc.save(path)
    print(f'Saved: {path}')

# ─────────────────────────────────────────
# Run all
# ─────────────────────────────────────────
if __name__ == '__main__':
    doc1()
    doc2()
    doc3()
    doc4()
    doc5()
    doc6()
    print('\nAll 6 Word documents generated successfully!')
