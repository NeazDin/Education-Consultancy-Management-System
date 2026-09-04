# Education XYZ BD — Study Abroad & IELTS Management System

A production-ready single-page web portal built specifically for **Education XYZ BD**, a premier education consultancy firm in Dhaka, Bangladesh.

The application features a modern **White & Royal Blue** design system matching the company's official logo, role-based dashboards, student self-service onboarding, automated **Class Student IDs**, and a persistent browser-local database with JSON export/import backup tools.

---

## 🚀 Quick Start

Open `index.html` directly in any modern web browser (Edge, Chrome, Firefox, Safari):

```bash
# Double-click index.html or start any local static server:
python -m http.server 3000
# or
npx serve .
```

Navigate to `http://localhost:3000` (or open the local file path).

---

## 🔐 Default Official Accounts

| Role | Account Name | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Managing Director | `admin@eduxyzbd.com` | `admin123` | Full system control, staff accounts, database export/import, KPIs |
| **Branch Manager** | Anisur Rahman | `manager@eduxyzbd.com` | `manager123` | Full operational management of staff, students, batches, accounts, and system database |
| **Front Desk** | Sadia Afrin | `reception@eduxyzbd.com` | `reception123` | Student directory, new registrations, batches schedule, announcements, messages |
| **Marketing** | Nafis Fuad | `marketing@eduxyzbd.com` | `marketing123` | Marketing campaigns, talent recruitment, announcements, students directory |
| **Compliance Officer** | Tahmina Akter | `compliance@eduxyzbd.com` | `compliance123` | Applications pipeline, document checklists, visa approvals, student files |
| **Admission Officer** | Zubaida Khanam | `admission@eduxyzbd.com` | `admission123` | University liaison, offer letter processing, CAS/COE issuance, document verification |
| **HR** | Mahmudur Rahman | `hr@eduxyzbd.com` | `hr123` | Staff management, department directory, daily attendance tracking, recruitment |
| **Counselor** | Farzana Yasmin | `counselor@eduxyzbd.com` | `counselor123` | Student admissions, university applications pipeline, document verification |
| **Counselor** | Nusrat Jahan | `nusrat@eduxyzbd.com` | `counselor123` | Student admissions, file counseling, stage advancement |
| **Instructor** | Nasir Uddin | `instructor@eduxyzbd.com` | `instructor123` | IELTS batches, class attendance register, mock test band grading |
| **Accountant** | Kamrul Hasan | `accounts@eduxyzbd.com` | `accounts123` | Fee collections, invoicing, payment receipts, tuition reconciliations |
| **Student** | Ayesha Karim | `ayesha@student.eduxyzbd.com` | `student123` | Student Portal, Digital Student ID Card, Class ID, Document uploads |

> **Quick Login Shortcuts**: You can log in using role keywords: `admin`, `manager`, `reception`, `marketing`, `compliance`, `counselor`, `instructor`, `accountant`, `admission`, `hr`, `student`.

> **Note for Public Users**: Prospective students can directly create an account using the **"Student Registration"** tab on the sign-in screen.

---

## ✨ Key Features

### 1. Logo & White-and-Blue Theme
- Brand palette crafted around the **Education XYZ BD** logo:
  - Primary Royal Blue: `#1E3A8A`
  - Sapphire Action Accent: `#2563EB`
  - Crisp White & Light Slate: `#FFFFFF`, `#F8FAFC`, `#EFF6FF`
- High-resolution company logo integrated into the hero screen, application topbar, and digital student cards.

### 2. Public-Ready Authentication
- Split-screen auth layout with brand hero highlighting Education XYZ BD strengths.
- Clean tabbed switcher: **Sign In** and self-service **Student Registration**.
- No demo credential tables or quick-fill buttons visible to public visitors.

### 3. Role-Tailored Dashboards
- **Admin Dashboard**: Total student volume, active applications, upcoming visa & CAS deadlines monitor, IELTS batch attendance graph, and office shortcuts.
- **Branch Manager Dashboard**: Multi-branch KPIs, counselor capacity, student pipeline, and operational management with full database access.
- **Front Desk Dashboard**: Walk-in student inquiries, counselor appointments, batch schedules, and reception operations.
- **Marketing Dashboard**: Student recruitment campaigns, events, education expos, talent acquisition, and outreach analytics.
- **Compliance Dashboard**: Embassy integrity compliance, student file auditing, visa clearances, and application pipeline tracking.
- **Admission Officer Dashboard**: Active university files radar, conditional & unconditional offer letters, CAS/COE processing queue, approaching university intake deadlines, and document verification.
- **HR (Human Resources) Dashboard**: Official staff headcount by department, live on-duty staff attendance roster, active recruitment & talent acquisition pipeline, staff announcements, and employee directory.
- **Counselor Dashboard**: Assigned student roster, active destination pipeline, pending document reviews queue, and priority visa files.
- **Instructor Dashboard**: Assigned IELTS batches, classroom schedules, attendance rates, and recent mock score submissions.
- **Accounts Dashboard**: Tuition collections, outstanding receivables, fee vouchers, and payment methods reconciliation.
- **Student Portal**:
  - Interactive **Application Milestone Stepper** (`Inquiry` → `Documents` → `Applied` → `Offer Letter` → `Visa` → `Completed`).
  - **Digital Education XYZ BD Student ID Card** complete with Student ID (`XYZ-2026-xxx`) and Class Student ID (`XYZ-IEL-xxx`).
  - Document checklist and IELTS mock band score history.

### 4. Class Student ID System
- When students enroll in an IELTS batch, the system automatically generates an official **Class Student ID** (e.g. `XYZ-IEL-001`, `XYZ-IEL-002`).
- Class IDs are displayed across:
  - Batch enrolled rosters
  - Daily class attendance sheets
  - Mock test band score entries and history tables
  - Student profile and digital ID cards

### 5. Expanded Demo Dataset
- **16 Students** with varied target countries (Canada, UK, Australia, USA, Germany, Sweden, Malaysia, Japan), student codes `XYZ-2026-001` through `XYZ-2026-016`.
- **7 Batches**: IELTS Regular Evening, IELTS Executive Weekend, IELTS Intensive Morning Crash Course, Spoken English & Accent Fluency Club, PTE Academic Fast-Track, GRE/SAT Prep, IELTS Band 8+ Advanced Writing & Speaking Clinic.
- **17+ Applications** across all stages with detailed counselor notes, interview dates, and CV review statuses.
- **10 Invoices** with varied payment statuses (paid, partial, overdue) and multiple payment methods (bKash, Nagad, Bank Transfer, Cash).
- **8 Job Applications** with full CVs, interview scheduling, and review statuses.

### 6. Local Database & Backup Tools
- Data is stored in persistent local browser storage under key `edu-xyz-bd-v2`.
- **Interactive Database Management & Inspection** (`#/database`): Full-featured collection browser with live row counts, search filter, JSON inspect modal, and delete action.
- Health dashboard showing total database size, storage type, schema version, and collection count.
- Collection Cards Grid for all 14 database collections with live record counts.
- Full backup export (`.json` download) and restore (`.json` upload) available in the **System Database** section.
- **Export Collection to CSV**: Export any single collection table to CSV format.
- **Reset to Fresh Seed**: One-click reset to repopulate the entire system with clean, rich demo data.
- Zero-disruption migration: Existing localStorage sessions automatically merge new accounts, students, and batches.

### 7. Admin Broadcast Announcements & Class Cancellation Popups
- **Admin-Exclusive Control**: Only official Administrator accounts (`admin@eduxyzbd.com`) can draft, schedule, edit, toggle, or delete announcements.
- **Universal Dashboard Popups**: Active notices (such as class cancellations with specific dates) automatically pop up in a high-priority modal whenever students or staff members visit their dashboard (`#/dashboard` or `#/portal`).
- **Date & Batch Highlighting**: Prominently displays the exact cancellation date (e.g. `5 Sept 2026`), affected batches, reason for cancellation, and makeup class schedule.
- **Persistent Topbar Bell & Dashboard Banners**: Displays a live unread bell badge in the top navigation bar and an alert banner at the top of user dashboards so users can re-read notices at any time.
- **Quick 1-Click Templates**: Built-in templates for "Class Cancellation with Date", "Office & Center Holiday", "Mock Exam Reschedule", and "Emergency Alert".

### 8. Universal Direct Messaging & Inbox System
- **Universal Directory & Access**: Every user role (**Admin**, **Counselor**, **Instructor**, **Accountant**, and **Student**) has access to **Messages & Inbox** (`#/messages`).
- **Inbox Anybody**: Built-in user directory modal with instant search and role filtering pills (`Students`, `Counselors`, `Instructors`, `Admins`, `Accounts`) allowing anyone to start a 1-to-1 conversation with any person on the platform.
- **Contextual 1-Click Action Buttons**: Direct "✉ Chat / Message" action buttons embedded throughout Student Profiles, Student Directory, Applications Pipeline, Batch Rosters, and Staff Directory.
- **Persistent Topbar & Nav Badges**: Real-time unread message indicator badges in the top navigation bar and sidebar menu.
- **Interactive Messaging**: Supports quick-reply suggestion chips, timestamps, delivery indicators, and intelligent simulated responses when communicating with offline contacts.


