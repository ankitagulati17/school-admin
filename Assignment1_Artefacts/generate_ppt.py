from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# ── Colour palette ──────────────────────────────────────────
DARK_BLUE  = RGBColor(0x1e, 0x29, 0x3b)   # slide background / header bg
ACCENT     = RGBColor(0x25, 0x63, 0xeb)   # blue accent
WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GRAY = RGBColor(0xF1, 0xF5, 0xF9)
MID_GRAY   = RGBColor(0x64, 0x74, 0x8B)
GREEN      = RGBColor(0x16, 0xA3, 0x4A)
AMBER      = RGBColor(0xD9, 0x77, 0x06)

SLIDE_W = Inches(13.33)
SLIDE_H = Inches(7.5)

prs = Presentation()
prs.slide_width  = SLIDE_W
prs.slide_height = SLIDE_H

blank_layout = prs.slide_layouts[6]   # completely blank


# ── helpers ─────────────────────────────────────────────────

def bg(slide, color):
    from pptx.oxml.ns import qn
    from lxml import etree
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color

def box(slide, text, x, y, w, h,
        font_size=18, bold=False, color=WHITE,
        bg_color=None, align=PP_ALIGN.LEFT,
        italic=False, wrap=True):
    txBox = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = txBox.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    if bg_color:
        txBox.fill.solid()
        txBox.fill.fore_color.rgb = bg_color
    return txBox

def rect(slide, x, y, w, h, fill_color, radius=False):
    from pptx.util import Inches
    shape = slide.shapes.add_shape(
        1,  # MSO_SHAPE_TYPE.RECTANGLE
        Inches(x), Inches(y), Inches(w), Inches(h)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    shape.line.fill.background()
    return shape

def accent_bar(slide, y=1.15, color=ACCENT):
    rect(slide, 0.55, y, 2.2, 0.07, color)

def slide_header(slide, title, subtitle=None):
    # dark top strip
    rect(slide, 0, 0, 13.33, 1.5, DARK_BLUE)
    box(slide, title, 0.5, 0.18, 12.0, 0.8,
        font_size=32, bold=True, color=WHITE, align=PP_ALIGN.LEFT)
    if subtitle:
        box(slide, subtitle, 0.5, 0.9, 12.0, 0.5,
            font_size=14, color=RGBColor(0x94, 0xA3, 0xB8), align=PP_ALIGN.LEFT)

def bullet_col(slide, items, x, y, w, h, dot_color=ACCENT, font_size=15, spacing=0.42):
    for i, item in enumerate(items):
        iy = y + i * spacing
        if iy + 0.35 > y + h:
            break
        # dot
        dot = slide.shapes.add_shape(1, Inches(x), Inches(iy + 0.09), Inches(0.12), Inches(0.12))
        dot.fill.solid()
        dot.fill.fore_color.rgb = dot_color
        dot.line.fill.background()
        box(slide, item, x + 0.2, iy, w - 0.2, 0.38, font_size=font_size, color=DARK_BLUE)

def card(slide, label, value, x, y, w=2.8, h=1.1, val_color=ACCENT):
    rect(slide, x, y, w, h, WHITE)
    box(slide, label, x + 0.15, y + 0.08, w - 0.3, 0.32,
        font_size=11, color=MID_GRAY)
    box(slide, value, x + 0.15, y + 0.38, w - 0.3, 0.55,
        font_size=22, bold=True, color=val_color)

def tag(slide, text, x, y, bg_c=ACCENT, txt_c=WHITE, font_size=11):
    r = rect(slide, x, y, len(text)*0.095 + 0.25, 0.32, bg_c)
    box(slide, text, x + 0.1, y + 0.04, len(text)*0.095 + 0.15, 0.26,
        font_size=font_size, bold=True, color=txt_c)


# ════════════════════════════════════════════════════════════
# SLIDE 1 – Title
# ════════════════════════════════════════════════════════════
s1 = prs.slides.add_slide(blank_layout)
bg(s1, DARK_BLUE)

# big accent block
r = rect(s1, 0, 2.5, 0.18, 2.5, ACCENT)

box(s1, "FSAD – Full Stack Application Development",
    0.45, 1.3, 12.0, 0.5, font_size=13,
    color=RGBColor(0x94, 0xA3, 0xB8))

box(s1, "School Administration\nSystem",
    0.45, 1.85, 11.5, 2.0, font_size=44, bold=True, color=WHITE)

box(s1, "A full-stack web application for digital school management",
    0.45, 3.95, 10.0, 0.55, font_size=17,
    color=RGBColor(0xCB, 0xD5, 0xE1))

# divider
rect(s1, 0.45, 4.65, 5.5, 0.04, RGBColor(0x47, 0x6B, 0xB5))

box(s1, "React 18  ·  Spring Boot 3  ·  PostgreSQL 15  ·  JWT Auth",
    0.45, 4.78, 8.0, 0.45, font_size=13,
    color=RGBColor(0x94, 0xA3, 0xB8))

box(s1, "November 2026",
    0.45, 5.35, 4.0, 0.4, font_size=13,
    color=RGBColor(0x64, 0x74, 0x8B))


# ════════════════════════════════════════════════════════════
# SLIDE 2 – Problem Statement
# ════════════════════════════════════════════════════════════
s2 = prs.slides.add_slide(blank_layout)
bg(s2, LIGHT_GRAY)
slide_header(s2, "Problem Statement", "Current challenges in school administration")
accent_bar(s2)

problems = [
    "Student records in physical registers — prone to loss & errors",
    "Attendance marked manually — no centralised tracking",
    "Fee collection in spreadsheets — no receipt generation",
    "Performance data fragmented across teachers",
    "No unified platform for Admin, Principal, Teacher, Clerk & Student",
]
bullet_col(s2, problems, 0.55, 1.75, 7.8, 4.0, dot_color=RGBColor(0xDC,0x26,0x26), font_size=16, spacing=0.62)

# impact box
rect(s2, 8.8, 1.75, 4.0, 3.8, WHITE)
box(s2, "Impact", 9.0, 1.9, 3.6, 0.4, font_size=14, bold=True, color=ACCENT)
impacts = ["High admin overhead", "Data inconsistency", "Delayed reporting", "No role separation", "Manual error risk"]
for i, imp in enumerate(impacts):
    box(s2, f"✗  {imp}", 9.0, 2.38 + i*0.56, 3.6, 0.45, font_size=13, color=RGBColor(0xDC,0x26,0x26))


# ════════════════════════════════════════════════════════════
# SLIDE 3 – Objective & Solution
# ════════════════════════════════════════════════════════════
s3 = prs.slides.add_slide(blank_layout)
bg(s3, LIGHT_GRAY)
slide_header(s3, "Objective & Solution")
accent_bar(s3)

box(s3, "Objective", 0.55, 1.75, 5.9, 0.4, font_size=14, bold=True, color=ACCENT)
box(s3, "Build a centralised, role-based web application that digitises "
        "all key school administrative operations — accessible through a secure web interface.",
    0.55, 2.15, 5.9, 0.9, font_size=14, color=DARK_BLUE)

box(s3, "Solution", 0.55, 3.2, 5.9, 0.4, font_size=14, bold=True, color=ACCENT)
sol = [
    "React frontend with role-based routing",
    "Spring Boot REST API with JWT security",
    "PostgreSQL database — single source of truth",
    "5 distinct role interfaces (Admin/Principal/Teacher/Clerk/Student)",
    "Real-time reports & analysis dashboards",
]
bullet_col(s3, sol, 0.55, 3.6, 5.9, 2.8, font_size=14, spacing=0.52)

# right panel – roles
rect(s3, 7.2, 1.65, 5.6, 5.35, WHITE)
box(s3, "User Roles", 7.45, 1.8, 5.1, 0.4, font_size=14, bold=True, color=DARK_BLUE)

roles = [
    ("ADMIN",     ACCENT,                            "Full system control"),
    ("PRINCIPAL", RGBColor(0x70,0x3E,0xD8),         "Reports & analysis"),
    ("TEACHER",   GREEN,                             "Attendance, marks, syllabus"),
    ("CLERK",     AMBER,                             "Admissions, fee payments"),
    ("STUDENT",   RGBColor(0x08,0x91,0xB2),         "View own data"),
]
for i, (role, col, desc) in enumerate(roles):
    ry = 2.35 + i * 0.88
    rect(s3, 7.45, ry, 1.1, 0.36, col)
    box(s3, role, 7.5, ry + 0.03, 1.0, 0.3, font_size=10, bold=True, color=WHITE)
    box(s3, desc, 8.7, ry + 0.03, 3.8, 0.32, font_size=12, color=DARK_BLUE)


# ════════════════════════════════════════════════════════════
# SLIDE 4 – Architecture
# ════════════════════════════════════════════════════════════
s4 = prs.slides.add_slide(blank_layout)
bg(s4, LIGHT_GRAY)
slide_header(s4, "System Architecture", "3-Tier Web Architecture")
accent_bar(s4)

tiers = [
    ("PRESENTATION LAYER",  "React 18 + Vite + Material UI v6",
     "Login · Dashboard · Admin Pages · Teacher Pages · Clerk Pages · Student Portal",
     "localhost:5173", ACCENT),
    ("BUSINESS LOGIC LAYER", "Spring Boot 3 + Java 17 + Spring Security",
     "REST Controllers → Service Layer → Repository Layer · JWT Authentication Filter",
     "localhost:8080", RGBColor(0x70,0x3E,0xD8)),
    ("DATA LAYER",          "PostgreSQL 15 + Hibernate ORM",
     "12 Tables: users, students, classes, sections, subjects, attendance, performance, fees …",
     "Port 5432", GREEN),
]

for i, (tier, tech, detail, port, col) in enumerate(tiers):
    ty = 1.65 + i * 1.72
    rect(s4, 0.45, ty, 12.4, 1.5, WHITE)
    rect(s4, 0.45, ty, 0.18, 1.5, col)
    box(s4, tier,   0.75, ty + 0.08, 5.5, 0.36, font_size=11, bold=True, color=col)
    box(s4, tech,   0.75, ty + 0.44, 8.5, 0.36, font_size=14, bold=True, color=DARK_BLUE)
    box(s4, detail, 0.75, ty + 0.82, 9.5, 0.55, font_size=11, color=MID_GRAY)
    rect(s4, 11.2, ty + 0.45, 1.45, 0.38, col)
    box(s4, port,  11.25, ty + 0.48, 1.35, 0.32, font_size=11, bold=True, color=WHITE)

    if i < 2:
        box(s4, "↕  HTTP / REST + JWT Bearer Token" if i == 0 else "↕  JDBC / JPA (Hibernate)",
            4.5, ty + 1.52, 5.0, 0.18, font_size=10, color=MID_GRAY, align=PP_ALIGN.CENTER)


# ════════════════════════════════════════════════════════════
# SLIDE 5 – Modules & Users
# ════════════════════════════════════════════════════════════
s5 = prs.slides.add_slide(blank_layout)
bg(s5, LIGHT_GRAY)
slide_header(s5, "Modules & User Roles", "10 functional modules · 5 user roles")
accent_bar(s5)

modules = [
    ("01", "User Management",       ACCENT),
    ("02", "Admission Module",      ACCENT),
    ("03", "Class & Section Mgmt",  ACCENT),
    ("04", "Subject Management",    ACCENT),
    ("05", "Attendance",            GREEN),
    ("06", "Fee Payment",           AMBER),
    ("07", "Performance / Marks",   GREEN),
    ("08", "Syllabus Tracker",      GREEN),
    ("09", "Class Schedule",        RGBColor(0x70,0x3E,0xD8)),
    ("10", "Reports & Analysis",    RGBColor(0x70,0x3E,0xD8)),
]

cols = 2
col_w = 6.0
for i, (num, name, col) in enumerate(modules):
    col_idx = i % cols
    row_idx = i // cols
    mx = 0.45 + col_idx * col_w
    my = 1.65 + row_idx * 0.72
    rect(s5, mx, my, col_w - 0.2, 0.58, WHITE)
    rect(s5, mx, my, 0.55, 0.58, col)
    box(s5, num,  mx + 0.07, my + 0.1, 0.4, 0.36, font_size=12, bold=True, color=WHITE)
    box(s5, name, mx + 0.65, my + 0.1, col_w - 0.9, 0.38, font_size=13, bold=False, color=DARK_BLUE)

# role tags bottom
box(s5, "Roles:", 0.45, 7.0, 1.0, 0.35, font_size=12, bold=True, color=MID_GRAY)
role_tags = [("Admin", ACCENT), ("Principal", RGBColor(0x70,0x3E,0xD8)),
             ("Teacher", GREEN), ("Clerk", AMBER), ("Student", RGBColor(0x08,0x91,0xB2))]
rx = 1.35
for rname, rcol in role_tags:
    rect(s5, rx, 7.0, 1.55, 0.34, rcol)
    box(s5, rname, rx + 0.1, 7.03, 1.35, 0.28, font_size=11, bold=True, color=WHITE)
    rx += 1.7


# ════════════════════════════════════════════════════════════
# SLIDE 6 – Technologies Used
# ════════════════════════════════════════════════════════════
s6 = prs.slides.add_slide(blank_layout)
bg(s6, LIGHT_GRAY)
slide_header(s6, "Technologies Used", "Full-stack technology stack")
accent_bar(s6)

tech_items = [
    ("Frontend",   "React 18",             "UI Framework",       ACCENT),
    ("Frontend",   "Vite 5",               "Build Tool",         ACCENT),
    ("Frontend",   "Material UI v6",       "Component Library",  ACCENT),
    ("Frontend",   "Axios + Recharts",     "HTTP / Charts",      ACCENT),
    ("Backend",    "Spring Boot 3",        "REST API Framework", RGBColor(0x70,0x3E,0xD8)),
    ("Backend",    "Java 17",              "Language",           RGBColor(0x70,0x3E,0xD8)),
    ("Backend",    "Spring Security + JWT","Auth & Security",    RGBColor(0x70,0x3E,0xD8)),
    ("Database",   "PostgreSQL 15",        "Relational DB",      GREEN),
    ("Database",   "Hibernate / JPA",      "ORM Layer",          GREEN),
    ("Build",      "Maven + npm",          "Build Tools",        AMBER),
]

cols3 = 2
for i, (layer, tech, role, col) in enumerate(tech_items):
    ci = i % cols3
    ri = i // cols3
    tx = 0.45 + ci * 6.3
    ty = 1.65 + ri * 0.75
    rect(s6, tx, ty, 6.1, 0.6, WHITE)
    rect(s6, tx, ty, 1.1, 0.6, col)
    box(s6, layer, tx + 0.07, ty + 0.08, 0.95, 0.42, font_size=9, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    box(s6, tech,  tx + 1.22, ty + 0.05, 3.0, 0.3, font_size=13, bold=True, color=DARK_BLUE)
    box(s6, role,  tx + 1.22, ty + 0.33, 3.0, 0.24, font_size=10, color=MID_GRAY)


# ════════════════════════════════════════════════════════════
# SLIDE 7 – Summary & Demo Flow
# ════════════════════════════════════════════════════════════
s7 = prs.slides.add_slide(blank_layout)
bg(s7, LIGHT_GRAY)
slide_header(s7, "Summary & Demo Flow")
accent_bar(s7)

# left – highlights
box(s7, "What We Built", 0.55, 1.65, 6.0, 0.4, font_size=14, bold=True, color=ACCENT)
highlights = [
    "10 modules — full school admin lifecycle",
    "5 role-based interfaces with protected routes",
    "12-table PostgreSQL database (fully normalised)",
    "JWT stateless authentication",
    "Real-time reports with bar & pie charts",
    "Professional UI — consistent design system",
]
bullet_col(s7, highlights, 0.55, 2.1, 6.0, 3.5, font_size=14, spacing=0.52)

# right – demo flow
rect(s7, 7.2, 1.55, 5.7, 5.65, WHITE)
box(s7, "Demo Flow", 7.45, 1.7, 5.2, 0.4, font_size=14, bold=True, color=DARK_BLUE)

steps = [
    ("1", "Admin",     "Create classes, sections, subjects, users",  ACCENT),
    ("2", "Clerk",     "Admit students → Process fee payments",      AMBER),
    ("3", "Teacher",   "Mark attendance → Record exam marks",        GREEN),
    ("4", "Principal", "View reports → Analysis charts",             RGBColor(0x70,0x3E,0xD8)),
    ("5", "Student",   "View profile, attendance, performance",      RGBColor(0x08,0x91,0xB2)),
]
for i, (num, role, action, col) in enumerate(steps):
    sy = 2.25 + i * 0.96
    rect(s7, 7.45, sy, 0.38, 0.38, col)
    box(s7, num, 7.47, sy + 0.03, 0.34, 0.3, font_size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    box(s7, role,   7.95, sy,        2.0, 0.3, font_size=12, bold=True, color=col)
    box(s7, action, 7.95, sy + 0.3, 4.7, 0.55, font_size=11, color=MID_GRAY)


# ════════════════════════════════════════════════════════════
# Save
# ════════════════════════════════════════════════════════════
path = os.path.join(OUT, '6_Presentation.pptx')
prs.save(path)
print(f'Saved: {path}')
