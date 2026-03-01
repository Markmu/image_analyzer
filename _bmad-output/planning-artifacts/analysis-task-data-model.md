# Analysis Task Data Model Design

**Project:** image_analyzer  
**Date:** 2026-03-01  
**Status:** Draft for implementation

## Purpose

This document defines the task-centric data model for the new IR pipeline.

It exists to make three constraints explicit:

1. `analysis_tasks` + `analysis_stage_snapshots` are the canonical source of truth for the new pipeline.
2. Existing `analysis_results` remains compatibility-only and is not a second writable truth source.
3. Replay, support diagnostics, retry tracking, template reuse analytics, and public-result projection must all hang off the task model.

## Scope

This design covers:

- `analysis_tasks`
- `analysis_stage_snapshots`
- `analysis_retries`
- `template_reuse_events`
- related enums, indexes, and migration rules

This design does not redefine:

- `user`, `account`, `session`
- `images`
- billing / credit tables
- generation tables

## Canonical Model Rules

**Source of truth**

- New IR pipeline truth lives in:
  - `analysis_tasks`
  - `analysis_stage_snapshots`
- Final user-facing result is a projection from those records.

**Compatibility rule**

- `analysis_results` may remain for old screens, old reports, or staged migration support.
- New pipeline code must not depend on `analysis_results.analysis_data` as its primary read model.
- If compatibility write-through is temporarily needed, it must be explicitly marked as transitional and removable.

**Append-only rule**

- Stage snapshots are append-only across attempts.
- A retry creates a new snapshot row with a higher `attempt_no`.
- Old snapshots are never overwritten in place.

## Task Lifecycle Vocabulary

### Task Status

- `queued`
- `running`
- `completed`
- `failed`
- `partial`
- `canceled`

### Stage Name

- `forensic_describer`
- `style_fingerprinter`
- `prompt_compiler`
- `qa_critic`

### Stage Status

- `queued`
- `running`
- `completed`
- `failed`
- `skipped`

### Retry Trigger

- `user_retry`
- `support_retry`
- `system_retry`

## Table Design

### 1. `analysis_tasks`

One row per user-visible analysis task.

#### Purpose

- primary identity for an analysis run
- current status and current stage
- versioning anchor
- final result projection anchor
- support and replay lookup anchor

#### Proposed Columns

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | no | Primary key |
| `public_id` | `varchar(64)` | no | Public-safe reference or slug for UI / content projection |
| `user_id` | `varchar(255)` | no | FK to `user.id` |
| `image_id` | `varchar(64)` | no | FK to `images.id` |
| `status` | `varchar(32)` | no | task status enum |
| `current_stage` | `varchar(64)` | yes | current stage name |
| `target_model` | `varchar(100)` | yes | requested model or primary model family |
| `provider` | `varchar(50)` | yes | current selected provider |
| `schema_version` | `varchar(32)` | no | IR schema version |
| `prompt_version` | `varchar(32)` | yes | prompt/compiler rules version |
| `request_payload` | `jsonb` | yes | sanitized user request payload |
| `result_payload` | `jsonb` | yes | normalized final result payload for fast reads |
| `result_summary` | `jsonb` | yes | lightweight UI/public summary projection seed |
| `latest_qa_verdict` | `varchar(16)` | yes | `pass` / `warn` / `fail` |
| `latest_error_code` | `varchar(64)` | yes | last terminal or visible error code |
| `latest_error_message` | `text` | yes | user-safe or support-safe latest error |
| `attempt_count` | `integer` | no | total retry attempts, default `1` |
| `is_public` | `boolean` | no | whether task can be projected to content page |
| `public_published_at` | `timestamp` | yes | publication time if public |
| `created_at` | `timestamp` | no | default now |
| `started_at` | `timestamp` | yes | first actual execution time |
| `completed_at` | `timestamp` | yes | terminal completion time |
| `updated_at` | `timestamp` | no | default now |

#### Indexes

- PK: `id`
- unique: `public_id`
- index: `user_id, created_at desc`
- index: `status, created_at desc`
- index: `schema_version`
- index: `prompt_version`
- index: `is_public, public_published_at desc`
- index: `provider, target_model`

#### Notes

- `result_payload` exists for fast result reads, but it is still derived from stage snapshots.
- `request_payload` must be sanitized and must not contain secrets.
- `public_id` should be safe for public URLs; it should not expose internal sequencing.

### 2. `analysis_stage_snapshots`

One row per stage execution attempt.

#### Purpose

- replay
- support diagnostics
- version-aware auditing
- failure analysis
- deterministic reconstruction of final result

#### Proposed Columns

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | no | Primary key |
| `task_id` | `uuid` | no | FK to `analysis_tasks.id` |
| `stage_name` | `varchar(64)` | no | stage name enum |
| `attempt_no` | `integer` | no | append-only retry counter per stage |
| `stage_status` | `varchar(32)` | no | stage status enum |
| `provider` | `varchar(50)` | yes | provider actually used by this stage |
| `model_id` | `varchar(100)` | yes | concrete model identifier |
| `schema_version` | `varchar(32)` | no | snapshot schema version |
| `prompt_version` | `varchar(32)` | yes | compiler/prompt version where relevant |
| `input_payload` | `jsonb` | yes | sanitized input to stage |
| `output_payload` | `jsonb` | yes | stage output |
| `error_payload` | `jsonb` | yes | structured failure info |
| `metrics_payload` | `jsonb` | yes | duration, token/cost estimates, confidence, etc. |
| `started_at` | `timestamp` | yes | execution start |
| `completed_at` | `timestamp` | yes | execution end |
| `created_at` | `timestamp` | no | default now |

#### Constraints

- unique: `task_id + stage_name + attempt_no`
- append-only by application rule

#### Indexes

- index: `task_id, created_at`
- index: `task_id, stage_name, attempt_no desc`
- index: `stage_status, created_at`
- index: `provider, model_id`

#### Notes

- `input_payload` and `output_payload` should remain schema-valid but sanitized.
- `error_payload` should be structured, not free-form-only.
- `metrics_payload` is where stage-level observability belongs, not in ad hoc logs.

### 3. `analysis_retries`

One row per retry action.

#### Purpose

- explicit retry audit trail
- root-cause analysis
- user/support/system initiated retry separation

#### Proposed Columns

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | no | Primary key |
| `task_id` | `uuid` | no | FK to `analysis_tasks.id` |
| `stage_name` | `varchar(64)` | yes | null means whole-task retry |
| `from_attempt_no` | `integer` | yes | previous attempt |
| `to_attempt_no` | `integer` | yes | new attempt |
| `triggered_by` | `varchar(32)` | no | retry trigger enum |
| `triggered_by_user_id` | `varchar(255)` | yes | who triggered, if user/support |
| `reason_code` | `varchar(64)` | yes | machine-readable reason |
| `reason_detail` | `text` | yes | human-readable rationale |
| `created_at` | `timestamp` | no | default now |

#### Indexes

- index: `task_id, created_at desc`
- index: `triggered_by, created_at desc`
- index: `stage_name, created_at desc`

#### Notes

- Retry intent should be recorded before the next attempt starts.
- This table is audit/support oriented; it should not replace stage snapshots.

### 4. `template_reuse_events`

One row per reuse/export/adoption event.

#### Purpose

- FR29-FR32 analytics
- template reuse measurement
- adoption and export behavior tracking

#### Proposed Columns

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | no | Primary key |
| `task_id` | `uuid` | yes | originating analysis task |
| `template_id` | `integer` | yes | FK to existing `templates.id` if persisted |
| `user_id` | `varchar(255)` | no | FK to `user.id` |
| `event_type` | `varchar(32)` | no | `saved`, `reloaded`, `exported`, `copied`, `adopted`, `edited` |
| `adapter_type` | `varchar(32)` | yes | `natural_language`, `tag_stack`, `short_command` |
| `intensity` | `varchar(16)` | yes | `lite`, `standard`, `strong` |
| `event_payload` | `jsonb` | yes | structured details, e.g. export target |
| `created_at` | `timestamp` | no | default now |

#### Indexes

- index: `task_id, created_at desc`
- index: `template_id, created_at desc`
- index: `user_id, created_at desc`
- index: `event_type, created_at desc`
- index: `adapter_type, intensity`

## Suggested Drizzle Modeling Notes

- Use `uuid(...).defaultRandom()` for new task-centered tables if project conventions permit.
- Prefer `jsonb(...).$type<...>()` for typed payload columns.
- Keep status values in TypeScript schema constants and Zod enums to avoid drift.
- Add explicit unique indexes for:
  - `analysis_tasks.public_id`
  - `analysis_stage_snapshots(task_id, stage_name, attempt_no)`

## Result Projection Strategy

### Internal Replay View

Built from:

- `analysis_tasks`
- all `analysis_stage_snapshots`
- `analysis_retries`

### User Workspace Result View

Built from:

- `analysis_tasks.result_payload`
- most recent successful stage snapshots as needed

### Public Result View

Built only through allowlist projection from:

- `analysis_tasks.result_summary`
- selected safe fields from canonical result payload

Never built from:

- raw `input_payload`
- full replay object
- full QA issue/fix payloads

## Migration Strategy

### Phase 1: Additive Introduction

- add new task-centered tables
- keep existing `analysis_results`, `templates`, `analysis_history` untouched
- route only new IR pipeline writes to task-centered tables

### Phase 2: Compatibility Projection

- where old screens still need data, project from `analysis_tasks` into compatibility views or service adapters
- do not expand old `analysis_results` to fit the new IR model

### Phase 3: Progressive Read Cutover

- move analysis result screens, replay, and support tooling to read from task-centered tables
- reduce old-table dependency to legacy-only paths

### Explicit Anti-Pattern

Do not implement indefinite dual-write as a permanent architecture.

If temporary dual-write exists, document:

- exact writer
- exact reader
- decommission condition

## Open Questions

These should be resolved before schema implementation is finalized:

1. Should `result_payload` in `analysis_tasks` store the full final canonical object or only the latest normalized projection?
2. Does support tooling need a dedicated `support_access_audit` table, or can audit data live in an existing admin/audit subsystem?
3. Should `public_id` be generated at task creation time or only when a task is published?
4. Is `template_id` in `template_reuse_events` always available, or do some reuse actions happen before template persistence?

## Recommended Next Artifact

The next design artifact should be a concrete Drizzle schema proposal that maps this document into:

- table definitions
- enums/constants
- indexes
- foreign keys
- migration ordering
