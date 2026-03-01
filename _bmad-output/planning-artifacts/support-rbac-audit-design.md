# Support RBAC and Audit Design

**Project:** image_analyzer  
**Date:** 2026-03-01  
**Status:** Draft for implementation

## Purpose

This document defines the minimum RBAC and audit model for support access to analysis replay and diagnostics data.

It operationalizes ADR-02 from the architecture document:

- end users can only access their own tasks
- support access is controlled and read-first
- support actions must be auditable

## Scope

This design applies to:

- replay access
- support search access
- support-triggered retry actions
- audit logging for support operations

This design does not redefine:

- public content access
- billing admin access
- platform-wide super-admin policy

## Principles

1. Least privilege by default
2. Read-first support access
3. Summary-first result retrieval
4. Explicit reason capture for support actions
5. Auditable access to sensitive task-chain data

## Role Model

### 1. `end_user`

#### Allowed

- read own task list
- read own task result
- read own task status
- read own template/history data
- trigger own retry when product rules allow

#### Denied

- read other users' tasks
- access replay endpoint
- access support search endpoint
- view internal audit metadata

### 2. `support_readonly`

#### Allowed

- search tasks by support-safe dimensions:
  - `task_id`
  - date range
  - task status
  - stage status
  - error code
  - provider
  - schema version
  - prompt version
- open replay detail for a specific task
- view:
  - task metadata
  - stage execution history
  - structured error payloads
  - QA verdict and issue summaries
  - version markers

#### Denied

- modify task records
- modify stage snapshots
- write manual overrides into outputs
- trigger retries
- edit template or public visibility state

### 3. `support_operator`

This role is optional. Introduce only if the product truly needs support-triggered retry.

#### Allowed

- everything in `support_readonly`
- trigger controlled retry actions

#### Denied

- direct stage output editing
- direct replay mutation
- bypassing audit log requirements

## Access Matrix

| Capability | end_user | support_readonly | support_operator |
|-----------|----------|------------------|------------------|
| Read own task result | yes | yes | yes |
| Read other user's task result | no | summary + replay detail as authorized | summary + replay detail as authorized |
| Access replay endpoint | no | yes | yes |
| Access support search endpoint | no | yes | yes |
| Trigger retry | own task only if allowed | no | yes |
| Edit stored output payloads | no | no | no |
| Read audit logs | no | limited if needed | limited if needed |

## Endpoint Policy

### `/api/analysis/[id]`

#### User intent

- end-user result access

#### Policy

- `end_user`: can access only if `task.user_id === session.user.id`
- support roles: may access for investigation, but this endpoint should still return the normal user-safe result projection

### `/api/analysis/replay/[id]`

#### User intent

- internal replay and debugging view

#### Policy

- `end_user`: denied
- `support_readonly`: allowed
- `support_operator`: allowed

#### Data shape

- returns internal replay projection
- should include stage sequence, statuses, error summaries, version info, and sanitized payload details
- should not include secrets or privileged infrastructure credentials

### `/api/analysis/support/search`

#### User intent

- support-oriented diagnostics search

#### Policy

- `end_user`: denied
- `support_readonly`: allowed
- `support_operator`: allowed

#### Response strategy

- summary-first only
- do not return full stage payloads in list search
- full replay detail requires opening an individual task

### Support-triggered retry endpoint

Suggested shape:

- `/api/analysis/support/[id]/retry`

#### Policy

- `end_user`: denied
- `support_readonly`: denied
- `support_operator`: allowed

#### Preconditions

- explicit reason required
- action must be auditable
- retry must create new attempt records, never mutate old ones

## Field Visibility Rules

### User-safe fields

Allowed for normal user result/status views:

- `task_id` / public reference
- task status
- current stage
- final normalized result
- user-facing error message
- retryable flag
- template and reuse actions that belong to the user

### Support-visible fields

Allowed for support replay/search detail:

- internal task status history
- stage timing
- provider and model identifiers
- `schema_version`
- `prompt_version`
- structured `error_payload`
- QA verdict
- issue summary
- retry history

### Restricted fields

Never expose through support tooling unless there is a separate stronger policy:

- raw secrets
- auth tokens
- signed URLs beyond immediate operational need
- internal platform credentials
- unsanitized input artifacts if they include protected data

## Audit Requirements

Every support operation must create an audit record.

### Audit Event Types

- `support_search`
- `support_replay_view`
- `support_retry_triggered`
- `support_export_attempted`

### Minimum Audit Fields

| Field | Description |
|-------|-------------|
| `id` | audit event id |
| `actor_id` | support user id |
| `actor_role` | support role at time of action |
| `task_id` | affected task id if any |
| `action` | machine-readable action name |
| `reason` | support-supplied reason or ticket reference |
| `metadata` | structured details such as filters used |
| `created_at` | audit timestamp |

### Audit Rules

- support actions without `reason` must be rejected
- search filters should be captured in structured form where feasible
- audit writes must happen even if the support action returns no matching result
- retry actions must log both intent and execution outcome

## Summary-First Search Design

Support search responses should default to summary rows:

| Field | Notes |
|-------|-------|
| `task_id` | internal reference |
| `public_id` | if useful |
| `user_id` or masked reference | only if policy permits |
| `status` | current task status |
| `current_stage` | current or terminal stage |
| `latest_error_code` | machine-readable issue |
| `provider` | current provider |
| `schema_version` | current schema version |
| `prompt_version` | current prompt version |
| `created_at` | task create time |
| `completed_at` | terminal time if present |

Search should not return full:

- `input_payload`
- `output_payload`
- `error_payload`
- QA issue arrays
- full replay history

Those belong in the replay detail endpoint.

## Retry Governance

If `support_operator` exists, retry behavior must obey:

1. support-triggered retry requires explicit `reason`
2. retry action writes audit log first
3. retry creates a new retry record
4. retry creates new stage attempts
5. old stage snapshots remain intact

## Suggested Persistence

If no suitable audit table exists, add:

### `support_access_audit_logs`

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | no | Primary key |
| `actor_id` | `varchar(255)` | no | FK to `user.id` or support identity source |
| `actor_role` | `varchar(64)` | no | role at execution time |
| `task_id` | `uuid` | yes | nullable for broad searches |
| `action` | `varchar(64)` | no | audit event type |
| `reason` | `text` | no | why this action occurred |
| `metadata` | `jsonb` | yes | filters, endpoint, counts, etc. |
| `created_at` | `timestamp` | no | default now |

#### Indexes

- index: `actor_id, created_at desc`
- index: `task_id, created_at desc`
- index: `action, created_at desc`

## Implementation Constraints

- Support access checks must live in service or policy layer, not only in UI
- Replay and support search must not reuse end-user authorization assumptions
- Audit logging is mandatory for support actions
- Summary-first search is the default; full payloads require task-level replay access

## Open Questions

1. Are support users stored in the same `user` table or sourced from a separate identity system?
2. Do we need masked user identity in support search results, or can support see raw user IDs?
3. Should support-triggered retry be part of MVP, or stay deferred until replay stabilizes?

## Recommended Next Artifact

After this document, the next architecture artifact should be:

- `public-result-projector` allowlist specification
