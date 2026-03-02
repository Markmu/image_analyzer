# Story 5.0: 组装最终分析结果并返回统一 JSON 契约

Status: ready-for-dev

## Story

As a 用户或下游系统,
I want 获得包含各阶段产物和版本信息的统一 JSON 最终结果,
so that 我可以稳定消费可信输出，而不必自行拼装各阶段数据。

## Acceptance Criteria

1. 返回统一 JSON 契约对象，至少包含 `task_id`、`status`、五类阶段产物、`schema_version`、`prompt_version`。
2. 响应使用统一 `{ success, data|error }` 包装，并可被历史复用、公开投影和支持回放直接消费。
3. 不允许绕过统一编译与 QA 门禁直接返回下游可消费结果。

## Tasks / Subtasks

- [ ] 定义最终结果 view model 和 schema。
- [ ] 实现结果组装 service，统一读取各阶段快照并返回稳定对象。
- [ ] 在 `GET /api/analysis/[id]` 输出规范化结果。
- [ ] 为下游复用、公开投影留出稳定字段边界。
- [ ] 补齐 schema、service、API 测试。

## Dev Notes

### Technical Requirements

- Route Handler 不能直接拼装多阶段数据，必须经由 service 层。
- 统一使用 `snake_case` 字段命名，不做 camelCase 二次映射。
- 结果对象是历史、公开内容与支持回放的共同基础 read model。

### Architecture Compliance

- Service 建议放在 `src/lib/analysis-tasks/result-service.ts`。
- Route Handler 为 `src/app/api/analysis/[id]/route.ts`。
- 只从 `analysis_tasks` 和 `analysis_stage_snapshots` 读取主数据。

### Library / Framework Requirements

- Zod 4 校验最终结果 shape。
- Route Handlers 保持统一响应包装。

### File Structure Requirements

- Service: `src/lib/analysis-tasks/result-service.ts`
- Schema: `src/lib/analysis-ir/schemas/final-result.ts`
- API: `src/app/api/analysis/[id]/route.ts`

### Testing Requirements

- 覆盖正常结果、缺阶段数据、QA 未通过、权限校验等场景。
- 回归测试确保其他消费方无需自行再拼结构。

### Previous Story Intelligence

- Epic 1-4 的输出字段稳定性直接决定本 story 复杂度；这里不应补偿上游随意命名。

### Git Intelligence Summary

- 当前 API 基础设施与统一响应工具已存在，可直接复用。

### Latest Tech Information

- Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Zod 4 docs: https://zod.dev/

### Project Structure Notes

- 当前 `src/app/api/analysis` 目录已存在，适合平滑落新结果查询。

### References

- Epics: `_bmad-output/planning-artifacts/epics.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Existing code: `src/lib/api/response.ts`, `src/app/api/analysis`, `src/lib/db/schema.ts`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 待实现

### Completion Notes List

- Story context generated in YOLO mode from epics, architecture, sprint status, codebase scan, and latest official docs.

### File List

- `_bmad-output/implementation-artifacts/5-0-组装最终分析结果并返回统一-json-契约.md`
