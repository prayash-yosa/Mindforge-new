# Task 1.3 — Parent DB Schema & Migrations

**Sprint**: 1 — Workspace Integration & Parent Service Foundation  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Parent Backend — Data  
**App**: Parent  
**Status**: Done  
**Estimate**: 3 SP

---

## Summary

Defined and migrated `parent_accounts` and `parent_login_attempts` tables per architecture v1. Enforced uniqueness of `mobile_number` and application rule of at most two active parents per `linked_student_id`.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | parent_accounts and parent_login_attempts | **Done** | TypeORM entities with synchronize in dev |
| 2 | Uniqueness mobile_number; max 2 parents per student | **Done** | Unique index; app-level check in ParentRepository |
| 3 | Migrations integrated | **Done** | TypeORM synchronize for dev; migrations for prod |

---

## Schema

### parent_accounts

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| mobile_number | VARCHAR | UNIQUE, NOT NULL |
| mpin_hash | VARCHAR | NOT NULL |
| name | VARCHAR | NOT NULL |
| relationship | VARCHAR | FATHER/MOTHER/GUARDIAN |
| linked_student_id | UUID | NOT NULL, INDEX |
| status | VARCHAR | ACTIVE/DISABLED |
| created_by_admin_id | UUID | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### parent_login_attempts

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| parent_id | UUID | NOT NULL |
| success | BOOLEAN | NOT NULL |
| ip | VARCHAR | NULL |
| created_at | TIMESTAMP | |

---

## Dev Seed

| Field | Value |
|-------|-------|
| mobile | 9876543210 |
| MPIN | 123456 |
| name | Rajesh Kumar |
| relationship | FATHER |
| linkedStudentId | PARENT_DEV_LINKED_STUDENT_ID or placeholder |
