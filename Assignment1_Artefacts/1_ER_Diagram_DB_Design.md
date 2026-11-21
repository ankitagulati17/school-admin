# ER Diagram – School Administration System
## Database Design (Entity-Relationship)

---

## Entities & Attributes

### 1. users
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| username | VARCHAR | UNIQUE, NOT NULL |
| password | VARCHAR | NOT NULL (BCrypt) |
| full_name | VARCHAR | NOT NULL |
| email | VARCHAR | UNIQUE |
| role | ENUM | NOT NULL (ADMIN/PRINCIPAL/TEACHER/CLERK/STUDENT) |
| active | BOOLEAN | NOT NULL, DEFAULT true |
| student_id | BIGINT | FK → students.id (nullable, for STUDENT role) |

### 2. students
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| admission_number | VARCHAR | UNIQUE, NOT NULL |
| name | VARCHAR | NOT NULL |
| date_of_birth | DATE | |
| gender | VARCHAR | |
| blood_group | VARCHAR | |
| address | VARCHAR | |
| city | VARCHAR | |
| state | VARCHAR | |
| pincode | VARCHAR | |
| father_name | VARCHAR | |
| mother_name | VARCHAR | |
| parent_contact | VARCHAR | |
| parent_email | VARCHAR | |
| parent_occupation | VARCHAR | |
| class_id | BIGINT | FK → school_classes.id |
| section_id | BIGINT | FK → sections.id |
| previous_class | VARCHAR | |
| previous_percentage | DOUBLE | |
| previous_grade | VARCHAR | |
| previous_school | VARCHAR | |
| admission_date | DATE | |
| active | BOOLEAN | DEFAULT true |

### 3. school_classes
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| class_name | VARCHAR | UNIQUE, NOT NULL |

### 4. sections
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| name | VARCHAR | NOT NULL |
| class_id | BIGINT | FK → school_classes.id, NOT NULL |

### 5. subjects
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| name | VARCHAR | NOT NULL |
| code | VARCHAR | UNIQUE, NOT NULL |
| class_id | BIGINT | FK → school_classes.id |

### 6. teachers
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| user_id | BIGINT | FK → users.id, NOT NULL |
| employee_id | VARCHAR | UNIQUE |
| qualification | VARCHAR | |
| designation | VARCHAR | |

### 7. attendance
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| student_id | BIGINT | FK → students.id, NOT NULL |
| date | DATE | NOT NULL |
| status | ENUM | NOT NULL (PRESENT/ABSENT/LATE/LEAVE) |
| marked_by | BIGINT | FK → users.id |
| class_id | BIGINT | FK → school_classes.id |
| section_id | BIGINT | FK → sections.id |

### 8. performance
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| student_id | BIGINT | FK → students.id, NOT NULL |
| subject_id | BIGINT | FK → subjects.id, NOT NULL |
| exam_type | ENUM | NOT NULL (CLASS_TEST/UNIT_TEST/MIDTERM/FINAL/ASSIGNMENT) |
| marks | DOUBLE | NOT NULL |
| max_marks | DOUBLE | NOT NULL |
| term | VARCHAR | NOT NULL |
| academic_year | VARCHAR | NOT NULL |
| remarks | VARCHAR | |
| recorded_by | BIGINT | FK → users.id |

### 9. fee_payments
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| student_id | BIGINT | FK → students.id, NOT NULL |
| amount | DOUBLE | NOT NULL |
| fee_type | VARCHAR | NOT NULL |
| payment_date | DATE | |
| payment_mode | VARCHAR | |
| receipt_number | VARCHAR | UNIQUE |
| status | ENUM | NOT NULL (PAID/PENDING/PARTIAL/WAIVED) |
| remarks | VARCHAR | |
| academic_year | VARCHAR | |
| processed_by | BIGINT | FK → users.id |

### 10. class_schedules
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| class_id | BIGINT | FK → school_classes.id, NOT NULL |
| section_id | BIGINT | FK → sections.id, NOT NULL |
| subject_id | BIGINT | FK → subjects.id, NOT NULL |
| teacher_id | BIGINT | FK → users.id, NOT NULL |
| day | VARCHAR | NOT NULL |
| period | INTEGER | NOT NULL |
| start_time | VARCHAR | NOT NULL |
| end_time | VARCHAR | NOT NULL |
| academic_year | VARCHAR | |

### 11. syllabus
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| class_id | BIGINT | FK → school_classes.id, NOT NULL |
| subject_id | BIGINT | FK → subjects.id, NOT NULL |
| term | VARCHAR | NOT NULL |
| topic | VARCHAR | NOT NULL |
| description | TEXT | |
| completed | BOOLEAN | DEFAULT false |
| completed_date | DATE | |
| academic_year | VARCHAR | |
| teacher_id | BIGINT | FK → users.id |

### 12. academic_years
| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| year | VARCHAR | UNIQUE, NOT NULL |
| start_date | DATE | |
| end_date | DATE | |
| active | BOOLEAN | DEFAULT true |

---

## Relationships

```
school_classes ──< sections
school_classes ──< subjects
school_classes ──< students (via class_id)
sections       ──< students (via section_id)

students       ──< attendance
students       ──< performance
students       ──< fee_payments

subjects       ──< performance
subjects       ──< class_schedules
subjects       ──< syllabus

school_classes ──< class_schedules
sections       ──< class_schedules
users          ──< class_schedules (as teacher)

school_classes ──< syllabus
users          ──< syllabus (as teacher)

users          ──  teachers (1:1 via user_id)
users          ──< attendance (as marked_by)
users          ──< performance (as recorded_by)
users          ──< fee_payments (as processed_by)
```

---

## ER Diagram (Text Notation)

```
┌─────────────────┐        ┌─────────────────┐
│  school_classes │1──────<│    sections     │
│─────────────────│        │─────────────────│
│ PK id           │        │ PK id           │
│    class_name   │        │    name         │
└────────┬────────┘        │ FK class_id     │
         │                 └────────┬────────┘
         │ 1                        │ 1
         │                          │
         ▼ *                        ▼ *
┌─────────────────────────────────────────────┐
│                  students                   │
│─────────────────────────────────────────────│
│ PK id              admission_number         │
│    name            date_of_birth   gender   │
│    blood_group     address  city  state     │
│    father_name     mother_name              │
│    parent_contact  parent_email             │
│ FK class_id    FK section_id                │
│    admission_date  active                   │
└────────┬───────────────────────┬────────────┘
         │ 1                     │ 1
         ▼ *                     ▼ *          ▼ *
┌──────────────┐  ┌───────────────────┐  ┌──────────────────┐
│  attendance  │  │   performance     │  │  fee_payments    │
│──────────────│  │───────────────────│  │──────────────────│
│ PK id        │  │ PK id             │  │ PK id            │
│ FK student_id│  │ FK student_id     │  │ FK student_id    │
│    date      │  │ FK subject_id     │  │    amount        │
│    status    │  │    exam_type      │  │    fee_type      │
│ FK marked_by │  │    marks max_marks│  │    payment_date  │
│ FK class_id  │  │    term acad_year │  │    payment_mode  │
│ FK section_id│  │ FK recorded_by    │  │    receipt_number│
└──────────────┘  └───────────────────┘  │    status        │
                                         │ FK processed_by  │
                                         └──────────────────┘

┌─────────────────┐        ┌─────────────────────┐
│    subjects     │        │   class_schedules   │
│─────────────────│        │─────────────────────│
│ PK id           │        │ PK id               │
│    name  code   │──────<─│ FK subject_id       │
│ FK class_id     │        │ FK class_id         │
└─────────────────┘        │ FK section_id       │
                           │ FK teacher_id       │
┌─────────────────┐        │    day  period      │
│    syllabus     │        │    start_time       │
│─────────────────│        │    end_time         │
│ PK id           │        └─────────────────────┘
│ FK class_id     │
│ FK subject_id   │        ┌─────────────────────┐
│    term  topic  │        │       users         │
│    completed    │        │─────────────────────│
│ FK teacher_id   │        │ PK id               │
└─────────────────┘        │    username         │
                           │    password (hash)  │
┌─────────────────┐        │    full_name email  │
│    teachers     │        │    role  active     │
│─────────────────│        │    student_id (FK)  │
│ PK id           │        └─────────────────────┘
│ FK user_id (1:1)│
│    employee_id  │        ┌─────────────────────┐
│    qualification│        │   academic_years    │
│    designation  │        │─────────────────────│
└─────────────────┘        │ PK id               │
                           │    year             │
                           │    start_date       │
                           │    end_date  active │
                           └─────────────────────┘
```
