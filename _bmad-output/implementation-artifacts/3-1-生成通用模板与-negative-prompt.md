# Story 3.1: 生成通用模板与 negative prompt

Status: ready-for-dev

## Story

As a 用户,
I want 基于风格模板获得通用模板和可选 negative prompt,
so that 我能先拿到模型无关的候选提示结构作为后续适配输出基础。

## Acceptance Criteria

1. 输出与统一 IR 一致的 `universal_template_en`，并在适用时返回 `universal_negative`。
2. Prompt Compiler 以独立阶段运行，不绕过结构化 IR 直接拼最终展示对象。
3. 编译结果可被后续适配表达与导出流程直接消费。

## Tasks / Subtasks

- [ ] 定义 `prompt_outputs` 的通用模板 schema。
- [ ] 实现 Prompt Compiler，将 `style_fingerprint` + `controls` 编译为模型无关模板。
- [ ] 设计 negative prompt 生成规则与适用条件。
- [ ] 将产物持久化为阶段快照并输出标准视图模型。
- [ ] 补齐 compiler、schema 与集成测试。

## Dev Notes

### Technical Requirements

- 只生成模型无关模板与 negative prompt，不提前展开三类 adapter。
- 必须保证输入来自前置结构化阶段，而不是直接读取原始图像或 HTTP payload。

### Architecture Compliance

- 建议新增 `src/lib/analysis-ir/stages/prompt-compiler.ts`。
- Route Handler 只读取 compiler 结果，不在 handler 中自行组装模板。
- 继续遵守 `provider` 和 `adapter_type` 分离原则。

### Library / Framework Requirements

- Zod 4 作为 `prompt_outputs` 契约。
- 如果需要 provider 特定规则，也应在 compiler 内部显式隔离，不污染通用模板 shape。

### File Structure Requirements

- Compiler: `src/lib/analysis-ir/stages/prompt-compiler.ts`
- Schema: `src/lib/analysis-ir/schemas/prompt-outputs.ts`
- Tests: `src/lib/analysis-ir/__tests__/prompt-compiler.test.ts`

### Testing Requirements

- 覆盖 universal template 成功生成、negative prompt 可选输出、非法输入拒绝。
- 回归测试确保下游 adapter 可以直接消费编译结果。

### Previous Story Intelligence

- 上游 `controls` 结构必须稳定；本阶段不应该重新解释用户变量含义。

### Git Intelligence Summary

- `features/templates/lib/template-generator.ts` 可提供文案拼接经验，但新 compiler 需面向统一 IR 重做。

### Latest Tech Information

- Zod 4 docs: https://zod.dev/

### Project Structure Notes

- 仓库已有模板生成与导出能力，可逐步迁移到新 `prompt_outputs` 契约。

### References

- Epics: `_bmad-output/planning-artifacts/epics.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Existing code: `src/features/templates/lib/template-generator.ts`, `src/features/templates/lib/template-exporter.ts`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 待实现

### Completion Notes List

- Story context generated in YOLO mode from epics, architecture, sprint status, codebase scan, and latest official docs.

### File List

- `_bmad-output/implementation-artifacts/3-1-生成通用模板与-negative-prompt.md`
