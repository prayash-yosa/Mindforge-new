# Mindforge Student Experience — Project Tracking

## Spreadsheet

| File | Use |
|------|-----|
| **Mindforge_Student_Experience_Project_Tracking.xlsx** | Excel workbook for tracking (recommended). Two sheets: **Sprint & Task Tracking**, **Sprint Summary**. |
| **Mindforge_Student_Experience_Project_Tracking.csv** | Same data in CSV; opens in Excel/Sheets. Use if .xlsx is not available. |

## What “AI” vs “Non-AI” task means

| Label | Meaning |
|--------|--------|
| **Non-AI** | Work that does **not** call an AI/LLM provider. Examples: API gateway, auth (MPIN), database, CRUD, UI screens that only call REST APIs, DevOps, monitoring. Behavior is **deterministic** and predictable. |
| **AI** | Work that **does** involve an AI/LLM: calling an AI provider for hints, progressive guidance (Hint → Approach → Concept → Solution), doubt-solving chat, or AI-assisted grading. Behavior is **probabilistic** (timeouts, fallbacks, syllabus alignment). Planning uses lower confidence % for AI tasks. |

Use the **AI/Non-AI** column to filter or prioritise (e.g. AI tasks often need fallbacks and validation).

## Columns (Sprint & Task Tracking)

| Column | Purpose |
|--------|--------|
| Sprint #, Sprint Name | Which sprint the task belongs to |
| Task ID, Task Title | Identifier and short title |
| User Story (short) | As a… I want… So that… (one line) |
| Area, Type, AI/Non-AI, Risk | Labels from backlog |
| SP | Story points |
| **Status** | **For tracking:** Not Started → In Progress → Code Complete → Review → **Done** |
| **Start Date** | Date when work on this task started (e.g. when Dev agent begins implementation) |
| **Completed Date** | Date when task marked Done (for Dev agent / you) |
| Dependencies | Task IDs or API dependency |
| Acceptance Criteria Ref | Points to Backlog § Task X.X Checklist |
| **Tracker Notes (Dev Agent)** | Notes when Dev completes code (e.g. PR link, branch, blockers) |

## How to use for tracking

1. **Open** `Mindforge_Student_Experience_Project_Tracking.xlsx` in Excel (or the CSV in Excel/Google Sheets).
2. **Status:** Use the **Status** column. In .xlsx, use the dropdown: **Not Started**, **In Progress**, **Code Complete**, **Review**, **Done**.
3. **When Dev agent completes code:** Set Status to **Code Complete** or **Done**, set **Completed Date** (e.g. `2026-02-06`), and optionally add **Tracker Notes** (e.g. “PR #12”, “branch feature/1.2-mpin”).
4. **Sprint Summary** sheet: Update the **Done** column per sprint (number of tasks done) to see remaining work.

## Regenerating the Excel file

To regenerate the .xlsx from the script (e.g. after adding tasks to the backlog):

```bash
# From project root, with venv that has openpyxl:
.venv/bin/python docs/planning/generate_tracking_spreadsheet.py
```

Or install openpyxl and run:

```bash
pip install openpyxl
python docs/planning/generate_tracking_spreadsheet.py
```

**Note:** Regenerating overwrites **Status**, **Completed Date**, and **Tracker Notes**. Back up those columns if you need to keep them, or use the CSV and only regenerate when the backlog structure changes.
