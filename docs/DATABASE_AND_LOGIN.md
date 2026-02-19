# Database & Login (Mindforge Backend)

## Where is the database?

- **Development (default)**: Data is stored **in-memory** (no file).  
  - Backend uses **SQLite** via `better-sqlite3` with `database: ':memory:'`.  
  - When you restart the backend, all data is reset; the dev seeder runs again and creates one test student + activities + attendance.

- **Persistent dev database (optional)**  
  In `backend/.env` set:
  ```bash
  SQLITE_PATH=./data/mindforge.sqlite
  ```
  Then create the folder and restart:
  ```bash
  mkdir -p backend/data
  cd backend && npm run start:dev
  ```
  Tables will be created in `backend/data/mindforge.sqlite` and data will persist across restarts.

- **Production**: Uses **PostgreSQL**. Set `DATABASE_URL` (or `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`) in `.env`.

---

## Database tables (where data is stored)

| Table | Purpose |
|-------|---------|
| `students` | Student accounts, display name, class, board, school, **mpin_hash**, consent flags |
| `syllabus_metadata` | Class → Subject → Chapter → Topic (syllabus tree) |
| `teaching_feed` | Teaching feed entries (for future NotebookLM integration) |
| `activities` | Homework, quiz, test, gap_bridge — title, type, status, score, assigned to student |
| `questions` | Questions per activity (content, type, options, correct_answer, rubric) |
| `responses` | Student answers per question (answer, is_correct, score, feedback_level, ai_feedback) |
| `attendance` | Per-day attendance (student_id, date, status: present/absent/late) |
| `doubt_threads` | Doubt threads (student_id, syllabus context, title, is_resolved) |
| `doubt_messages` | Messages in a thread (thread_id, role: student/ai, content) |
| `sessions` | Auth sessions (for future session invalidation) |
| `audit_log` | Audit events (login, lockout, etc.) |

Entity definitions: `backend/src/database/entities/*.entity.ts`  
Migrations: `backend/src/database/migrations/`.

---

## Login & testing the app

- **MPIN for the seeded test student**: **`123456`**  
  - The dev seeder creates one student (e.g. “Aarav”, Class 8, CBSE) with this MPIN (stored as bcrypt hash in `students.mpin_hash`).  
  - Use **123456** on the Login screen (or when calling `POST /v1/auth/mpin/verify` with `{"mpin":"123456"}`) to sign in and test the app.

- **Summary**
  - **Database (dev)**: In-memory SQLite by default; optional file via `SQLITE_PATH`.  
  - **Tables**: Listed above; entities in `backend/src/database/entities/`.  
  - **Login for testing**: MPIN **123456**.
