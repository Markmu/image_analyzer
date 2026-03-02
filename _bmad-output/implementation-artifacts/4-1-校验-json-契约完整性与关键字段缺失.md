# Story 4.1: 校验 JSON 契约完整性与关键字段缺失

Status: ready-for-dev

## Story

As a 用户,
I want 系统校验候选结果是否符合统一 JSON 契约并指出缺失字段,
so that 我知道当前结果是否结构完整、可继续使用。

## Acceptance Criteria

1. QA 阶段校验最终结果是否符合统一 JSON 契约，并在失败时返回机器可读错误。
2. 所有目标模型输出都必须经过统一编译与质量门禁后才能继续返回。
3. 契约校验结果可用于固定样本回归，并验证 `schema_version`、`prompt_version` 一致性。

## Tasks / Subtasks

- [ ] 建立最终结果的统一 Zod schema。
- [ ] 在 QA Critic 中增加缺失字段、非法字段、结构不一致检查。
- [ ] 产出可机器消费的 QA issues 结构。
- [ ] 为固定样本回归预留校验入口。
- [ ] 补齐 QA 校验与 API 展示测试。

## Dev Notes

### Technical Requirements

- QA Critic 只报告问题，不直接修正前置阶段产物。
- 契约错误要包含字段路径、错误类型、是否可修复等信息。
- `schema_version` 与 `prompt_version` 是强制校验字段。

### Architecture Compliance

- QA 逻辑建议放在 `src/lib/analysis-ir/stages/qa-critic.ts`。
- 最终 schema 与 stage schemas 要共享基础类型，避免手写漂移。
- API 结果与工作区都消费统一 `qa_report`。

### Library / Framework Requirements

- Zod 4 是唯一运行时契约引擎。
- 回归样本可用 Vitest 参数化测试维护。

### File Structure Requirements

- QA stage: `src/lib/analysis-ir/stages/qa-critic.ts`
- Schemas: `src/lib/analysis-ir/schemas/final-result.ts`
- Tests: `src/lib/analysis-ir/__tests__/qa-critic.test.ts`

### Testing Requirements

- 覆盖缺失字段、非法值、结构漂移、版本缺失场景。
- API/UI 测试验证 QA 报告被正确呈现。

### Previous Story Intelligence

- 上游 stories 的字段命名必须稳定，QA 不应承担兼容多套旧字段的责任。

### Git Intelligence Summary

- 仓库已使用 Zod；本 story 应把零散校验收束为统一 schema。

### Latest Tech Information

- Zod 4 docs: https://zod.dev/

### Project Structure Notes

- 当前 `src/lib/api/errors.ts` 可作为错误包装参考，但 QA issues 需要独立业务结构。

### References

- Epics: `_bmad-output/planning-artifacts/epics.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Existing code: `src/lib/api/errors.ts`, `src/features/templates/lib/validation-schemas.ts`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 待实现

### Completion Notes List

- Story context generated in YOLO mode from epics, architecture, sprint status, codebase scan, and latest official docs.

### File List

- `_bmad-output/implementation-artifacts/4-1-校验-json-契约完整性与关键字段缺失.md`
