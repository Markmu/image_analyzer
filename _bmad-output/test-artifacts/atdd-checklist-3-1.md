# ATDD Checklist - Story 3-1: AI 风格分析

**Date:** 2026-02-12
**Author:** Murat (TEA 测试架构师)
**Primary Test Level:** E2E + API + Unit
**TDD Phase:** 🔴 RED (失败测试已生成)

---

## Story Summary

作为 **AI 创作者或普通用户**，我想要 **上传图片后能获得专业的四维度风格分析（光影、构图、色彩、艺术风格）**，以便 **理解图片的风格特征，并用于生成同风格的新图片**。

**As a** AI 创作者或普通用户
**I want** 上传图片后能获得专业的四维度风格分析（光影、构图、色彩、艺术风格）
**So that** 理解图片的风格特征，并用于生成同风格的新图片

---

## Acceptance Criteria

1. **[AC-1]** Replicate Vision API 调用 - 系统可以调用 Replicate 视觉模型 API 进行图片风格分析
   - 支持至少一个视觉模型（如 LLaVA, Qwen-VL）
   - API 调用超时设置为 60 秒
   - 错误重试机制（最多 3 次，指数退避）
   - 返回结构化的分析结果

2. **[AC-2]** 四维度特征提取 - 系统可以从图片中提取四大维度的风格特征
   - **光影维度**: 主光源方向、光影对比度、阴影特征
   - **构图维度**: 视角、画面平衡、景深
   - **色彩维度**: 主色调、色彩对比度、色温
   - **艺术风格维度**: 风格流派、艺术时期、情感基调
   - 每个维度包含 3-5 个具体特征标签

3. **[AC-3]** 结构化数据存储 - 系统可以将分析结果组织成结构化数据
   - JSON 格式存储到数据库
   - 包含每个维度的特征标签
   - 包含每个特征的置信度分数（0-1）
   - 包含整体分析置信度

4. **[AC-4]** 实时进度显示 - 系统可以显示分析的实时进度
   - 复用 Story 2-4 的进度反馈组件
   - 显示"正在分析光影特征..."等专业术语
   - 显示预计剩余时间
   - 支持取消分析（可选）

5. **[AC-5]** 低置信度处理 - 系统可以处理低置信度的分析结果
   - 如果整体置信度 < 0.6，显示警告
   - 提供"重新分析"选项
   - 标注低置信度的具体维度

6. **[AC-6]** 用户反馈收集 - 系统可以收集用户对分析结果的反馈
   - "准确" / "不准确" 二选一反馈
   - 反馈数据存储到数据库
   - 用于后续优化

7. **[AC-7]** 移动端优化和 AI 透明度标注
   - 简化分析结果显示
   - 优先显示主要风格标签
   - "在桌面端查看详细分析"引导
   - **清晰标注"AI 分析结果"**（PRD FR54）

8. **[AC-8]** 内容安全检查（PRD FR52）
   - 分析前检查图片是否包含不当内容
   - 如果检测到不当内容，拒绝分析
   - 记录审核日志

9. **[AC-9]** Credit 系统集成（PRD FR46）
   - 分析开始前检查用户 credit 余额
   - 分析成功后扣除 1 credit
   - 如果 credit 不足，返回升级提示
   - 记录 credit 交易历史

---

## Failing Tests Created (RED Phase)

### Unit Tests (47 tests)

**File:** `src/lib/analysis/__tests__/parser.spec.ts` (650 lines)

**[AC-2, AC-3] 数据解析和验证 (10 tests):**

1. ✅ **Test:** [P0] should parse valid JSON response
   - **Status:** 🔴 RED - `parseAnalysisResponse` 函数不存在
   - **Verifies:** AC-2, AC-3 - JSON 解析功能
   - **Location:** `src/lib/analysis/parser.ts`

2. ✅ **Test:** [P0] should reject invalid JSON
   - **Status:** 🔴 RED - `parseAnalysisResponse` 函数不存在
   - **Verifies:** AC-3 - 错误处理

3. ✅ **Test:** [P0] should validate required fields exist
   - **Status:** 🔴 RED - 验证逻辑未实现
   - **Verifies:** AC-3 - 数据完整性

4. ✅ **Test:** [P0] should validate confidence range (0-1)
   - **Status:** 🔴 RED - `validateConfidenceRange` 函数不存在
   - **Verifies:** AC-3 - 置信度验证

5. ✅ **Test:** [P1] should handle negative confidence
   - **Status:** 🔴 RED - 边界验证未实现
   - **Verifies:** AC-3 - 边界条件

6. ✅ **Test:** [P1] should handle boundary values (0 and 1)
   - **Status:** 🔴 RED - 边界验证未实现
   - **Verifies:** AC-3 - 边界条件

7. ✅ **Test:** [P1] should extract feature tags correctly
   - **Status:** 🔴 RED - `extractFeatures` 函数不存在
   - **Verifies:** AC-2 - 特征提取

8. ✅ **Test:** [P1] should handle empty feature array
   - **Status:** 🔴 RED - 空数组处理未实现
   - **Verifies:** AC-2 - 边界条件

9. ✅ **Test:** [P2] should handle large number of features
   - **Status:** 🔴 RED - 性能边界未处理
   - **Verifies:** AC-2 - 性能测试

10. ✅ **Test:** [P2] should provide clear error messages
   - **Status:** 🔴 RED - 错误消息未定义
   - **Verifies:** AC-3 - 错误处理

**[AC-2] 特征提取 (8 tests):**

11. ✅ **Test:** [P1] should calculate average confidence
   - **Status:** 🔴 RED - `calculateAverageConfidence` 函数不存在
   - **Verifies:** AC-2 - 置信度计算

12. ✅ **Test:** [P1] should handle empty array for average
   - **Status:** 🔴 RED - 空数组处理未实现
   - **Verifies:** AC-2 - 边界条件

13. ✅ **Test:** [P1] should handle single feature
   - **Status:** 🔴 RED - 单值处理未实现
   - **Verifies:** AC-2 - 边界条件

14. ✅ **Test:** [P2] should handle large feature set
   - **Status:** 🔴 RED - 性能未优化
   - **Verifies:** AC-2 - 性能测试

15. ✅ **Test:** [P2] should handle same confidence values
   - **Status:** 🔴 RED - 特殊情况未处理
   - **Verifies:** AC-2 - 数据一致性

**[AC-3] Zod Schema 验证 (15 tests):**

16. ✅ **Test:** [P0] should validate AnalysisData schema
   - **Status:** 🔴 RED - `AnalysisDataSchema` 不存在
   - **Verifies:** AC-3 - Schema 验证

17. ✅ **Test:** [P0] should reject missing dimensions
   - **Status:** 🔴 RED - Schema 未定义
   - **Verifies:** AC-3 - 数据完整性

18. ✅ **Test:** [P0] should validate overallConfidence type
   - **Status:** 🔴 RED - 类型验证未实现
   - **Verifies:** AC-3 - 类型安全

19. ✅ **Test:** [P0] should validate analysisDuration type
   - **Status:** 🔴 RED - 类型验证未实现
   - **Verifies:** AC-3 - 类型安全

20. ✅ **Test:** [P0] should validate modelUsed type
   - **Status:** 🔴 RED - 类型验证未实现
   - **Verifies:** AC-3 - 类型安全

21. ✅ **Test:** [P1] should validate StyleDimension schema
   - **Status:** 🔴 RED - `StyleDimensionSchema` 不存在
   - **Verifies:** AC-3 - 子 Schema 验证

22. ✅ **Test:** [P1] should reject dimension without name
   - **Status:** 🔴 RED - 必需字段未定义
   - **Verifies:** AC-3 - 必需字段

23. ✅ **Test:** [P1] should reject dimension without features
   - **Status:** 🔴 RED - 必需字段未定义
   - **Verifies:** AC-3 - 必需字段

24. ✅ **Test:** [P1] should reject dimension without confidence
   - **Status:** 🔴 RED - 必需字段未定义
   - **Verifies:** AC-3 - 必需字段

25. ✅ **Test:** [P1] should validate StyleFeature schema
   - **Status:** 🔴 RED - `StyleFeatureSchema` 不存在
   - **Verifies:** AC-3 - 特征 Schema

26. ✅ **Test:** [P1] should reject feature without name
   - **Status:** 🔴 RED - 必需字段未定义
   - **Verifies:** AC-3 - 必需字段

27. ✅ **Test:** [P1] should reject feature without value
   - **Status:** 🔴 RED - 必需字段未定义
   - **Verifies:** AC-3 - 必需字段

28. ✅ **Test:** [P1] should reject feature without confidence
   - **Status:** 🔴 RED - 必需字段未定义
   - **Verifies:** AC-3 - 必需字段

29. ✅ **Test:** [P1] should validate confidence is number
   - **Status:** 🔴 RED - 类型验证未实现
   - **Verifies:** AC-3 - 类型安全

**[AC-5] 低置信度检测 (4 tests):**

30. ✅ **Test:** [P1] should detect low overall confidence
   - **Status:** 🔴 RED - 检测逻辑未实现
   - **Verifies:** AC-5 - 整体低置信度 (< 0.6)

31. ✅ **Test:** [P1] should detect low dimension confidence
   - **Status:** 🔴 RED - 维度检测未实现
   - **Verifies:** AC-5 - 维度低置信度

32. ✅ **Test:** [P1] should detect low feature confidence
   - **Status:** 🔴 RED - 特征检测未实现
   - **Verifies:** AC-5 - 特征低置信度

33. ✅ **Test:** [P2] should handle mixed confidence levels
   - **Status:** 🔴 RED - 混合场景未处理
   - **Verifies:** AC-5 - 复杂场景

**[AC-3] 数据完整性 (4 tests):**

34. ✅ **Test:** [P0] should validate all four dimensions exist
   - **Status:** 🔴 RED - 完整性验证未实现
   - **Verifies:** AC-3 - 四维度完整性

35. ✅ **Test:** [P0] should validate each dimension has >= 3 features
   - **Status:** 🔴 RED - 特征数量验证未实现
   - **Verifies:** AC-2 - 特征数量要求

36. ✅ **Test:** [P0] should validate all features have confidence
   - **Status:** 🔴 RED - 置信度存在性验证未实现
   - **Verifies:** AC-3 - 置信度完整性

37. ✅ **Test:** [P0] should validate all required fields present
   - **Status:** 🔴 RED - 必需字段验证未实现
   - **Verifies:** AC-3 - 数据完整性

**[AC-3] 边界条件 (6 tests):**

38. ✅ **Test:** [P2] should handle minimum confidence (0)
   - **Status:** 🔴 RED - 最小值边界未处理
   - **Verifies:** AC-3 - 边界条件

39. ✅ **Test:** [P2] should handle maximum confidence (1)
   - **Status:** 🔴 RED - 最大值边界未处理
   - **Status:** 🔴 RED - 边界条件

40. ✅ **Test:** [P2] should handle NaN
   - **Status:** 🔴 RED - NaN 处理未实现
   - **Verifies:** AC-3 - 异常值处理

41. ✅ **Test:** [P2] should handle Infinity
   - **Status:** 🔴 RED - Infinity 处理未实现
   - **Verifies:** AC-3 - 异常值处理

42. ✅ **Test:** [P2] should handle null values
   - **Status:** 🔴 RED - null 处理未实现
   - **Verifies:** AC-3 - 异常值处理

43. ✅ **Test:** [P2] should handle undefined values
   - **Status:** 🔴 RED - undefined 处理未实现
   - **Verifies:** AC-3 - 异常值处理

**错误处理 (4 tests):**

44. ✅ **Test:** [P1] should provide clear error message
   - **Status:** 🔴 RED - 错误消息未定义
   - **Verifies:** AC-3 - 错误处理

45. ✅ **Test:** [P2] should handle malformed JSON
   - **Status:** 🔴 RED - 格式错误处理未实现
   - **Verifies:** AC-3 - 错误处理

46. ✅ **Test:** [P2] should handle missing fields
   - **Status:** 🔴 RED - 缺失字段处理未实现
   - **Verifies:** AC-3 - 错误处理

47. ✅ **Test:** [P2] should handle unexpected data types
   - **Status:** 🔴 RED - 类型错误处理未实现
   - **Verifies:** AC-3 - 错误处理

---

### API Tests (25 tests)

**File:** `tests/api/analysis/analysis-api.spec.ts` (500 lines)

**[AC-1, AC-9] POST /api/analysis (6 tests):**

1. ✅ **Test:** [P0] should create analysis request successfully
   - **Status:** 🔴 RED - POST /api/analysis 端点不存在 (404)
   - **Verifies:** AC-1, AC-9 - 分析请求创建

2. ✅ **Test:** [P0] should reject insufficient credits
   - **Status:** 🔴 RED - Credit 检查未实现 (404)
   - **Verifies:** AC-9 - Credit 系统集成

3. ✅ **Test:** [P1] should reject inappropriate content
   - **Status:** 🔴 RED - 内容安全检查未实现 (404)
   - **Verifies:** AC-8 - 内容安全检查

4. ✅ **Test:** [P1] should reject invalid imageId
   - **Status:** 🔴 RED - 验证逻辑未实现 (404)
   - **Verifies:** AC-1 - 输入验证

5. ✅ **Test:** [P1] should reject unauthorized request
   - **Status:** 🔴 RED - 认证中间件未集成 (401)
   - **Verifies:** 安全 - 认证要求

6. ✅ **Test:** [P1] should validate request parameters
   - **Status:** 🔴 RED - 参数验证未实现 (404)
   - **Verifies:** AC-1 - 输入验证

**[AC-1, AC-3] GET /api/analysis/:id/status (5 tests):**

7. ✅ **Test:** [P0] should return analysis status (in progress)
   - **Status:** 🔴 RED - GET /api/analysis/:id/status 端点不存在 (404)
   - **Verifies:** AC-1, AC-4 - 状态查询

8. ✅ **Test:** [P0] should return result when completed
   - **Status:** 🔴 RED - 结果返回逻辑未实现 (404)
   - **Verifies:** AC-3 - 结构化数据返回

9. ✅ **Test:** [P1] should reject accessing others' analysis
   - **Status:** 🔴 RED - 权限验证未实现 (404)
   - **Verifies:** 安全 - 授权检查

10. ✅ **Test:** [P1] should reject non-existent analysis ID
   - **Status:** 🔴 RED - 存在性检查未实现 (404)
   - **Verifies:** AC-1 - 错误处理

11. ✅ **Test:** [P1] should validate result data structure
   - **Status:** 🔴 RED - 结构验证未实现 (404)
   - **Verifies:** AC-3 - JSON Schema 验证

**[AC-6] POST /api/analysis/:id/feedback (5 tests):**

12. ✅ **Test:** [P1] should accept accurate feedback
   - **Status:** 🔴 RED - POST /api/analysis/:id/feedback 端点不存在 (404)
   - **Verifies:** AC-6 - 反馈提交

13. ✅ **Test:** [P1] should accept inaccurate feedback
   - **Status:** 🔴 RED - 反馈处理未实现 (404)
   - **Verifies:** AC-6 - 反馈提交

14. ✅ **Test:** [P1] should reject invalid feedback value
   - **Status:** 🔴 RED - 验证未实现 (404)
   - **Verifies:** AC-6 - 输入验证

15. ✅ **Test:** [P1] should reject duplicate feedback
   - **Status:** 🔴 RED - 重复检查未实现 (404)
   - **Verifies:** AC-6 - 业务逻辑

16. ✅ **Test:** [P1] should validate feedback parameters
   - **Status:** 🔴 RED - 参数验证未实现 (404)
   - **Verifies:** AC-6 - 输入验证

**[AC-9] Credit 系统集成 (3 tests):**

17. ✅ **Test:** [P0] should deduct credit after successful analysis
   - **Status:** 🔴 RED - Credit 扣除逻辑未实现 (404)
   - **Verifies:** AC-9 - Credit 扣除

18. ✅ **Test:** [P1] should record credit transaction history
   - **Status:** 🔴 RED - 交易记录未实现 (404)
   - **Verifies:** AC-9 - 交易历史

19. ✅ **Test:** [P1] should not deduct credit on analysis failure
   - **Status:** 🔴 RED - 失败处理未实现 (404)
   - **Verifies:** AC-9 - 错误处理

**[AC-8] 内容安全检查 (2 tests):**

20. ✅ **Test:** [P0] should check image safety
   - **Status:** 🔴 RED - 安全检查未集成 (404)
   - **Verifies:** AC-8 - 内容安全

21. ✅ **Test:** [P1] should log moderation actions
   - **Status:** 🔴 RED - 审核日志未实现 (404)
   - **Verifies:** AC-8 - 审计日志

**性能和边界 (4 tests):**

22. ✅ **Test:** [P2] should respond within 500ms
   - **Status:** 🔴 RED - 性能未优化 (404)
   - **Verifies:** NFR-PERF - API 响应时间

23. ✅ **Test:** [P2] should handle concurrent requests
   - **Status:** 🔴 RED - 并发控制未实现 (404)
   - **Verifies:** NFR-PERF - 并发处理

24. ✅ **Test:** [P2] should handle max size image
   - **Status:** 🔴 RED - 大文件处理未实现 (404)
   - **Verifies:** NFR-SCALABILITY - 文件大小限制

25. ✅ **Test:** [P2] should handle special characters in filename
   - **Status:** 🔴 RED - 文件名处理未实现 (404)
   - **Verifies:** NFR-ROBUSTNESS - 特殊字符处理

---

### E2E Tests (12 tests)

**File:** `tests/e2e/story-3-1-style-analysis.spec.ts` (650 lines)

**[AC-1] Replicate Vision API 调用 (3 tests):**

1. ✅ **Test:** [P0] should successfully call Vision API
   - **Status:** 🔴 RED - data-testid="analyze-button" 不存在
   - **Verifies:** AC-1 - API 调用成功
   - **Missing Elements:**
     - `[data-testid="analyze-button"]`
     - `[data-testid="analysis-status"]`
     - `[data-testid="progress-display"]`
     - `[data-testid="analysis-result"]`

2. ✅ **Test:** [P1] should handle API timeout
   - **Status:** 🔴 RED - 超时处理未实现
   - **Verifies:** AC-1 - 60 秒超时
   - **Missing Elements:**
     - `[data-testid="timeout-error"]`

3. ✅ **Test:** [P1] should retry on Rate Limiting
   - **Status:** 🔴 RED - 重试逻辑未实现
   - **Verifies:** AC-1 - 错误重试机制
   - **Missing Elements:**
     - `[data-testid="retry-message"]`

**[AC-2] 四维度特征提取 (5 tests):**

4. ✅ **Test:** [P1] should extract lighting features
   - **Status:** 🔴 RED - data-testid="dimension-lighting" 不存在
   - **Verifies:** AC-2 - 光影维度
   - **Missing Elements:**
     - `[data-testid="dimension-lighting"]`
     - `[data-testid="dimension-name"]`
     - `[data-testid="feature-tag"]`
     - `[data-testid="dimension-confidence"]`

5. ✅ **Test:** [P1] should extract composition features
   - **Status:** 🔴 RED - data-testid="dimension-composition" 不存在
   - **Verifies:** AC-2 - 构图维度
   - **Missing Elements:**
     - `[data-testid="dimension-composition"]`

6. ✅ **Test:** [P1] should extract color features
   - **Status:** 🔴 RED - data-testid="dimension-color" 不存在
   - **Verifies:** AC-2 - 色彩维度
   - **Missing Elements:**
     - `[data-testid="dimension-color"]`

7. ✅ **Test:** [P1] should extract artistic style features
   - **Status:** 🔴 RED - data-testid="dimension-artistic-style" 不存在
   - **Verifies:** AC-2 - 艺术风格维度
   - **Missing Elements:**
     - `[data-testid="dimension-artistic-style"]`

8. ✅ **Test:** [P0] should validate four dimensions completeness
   - **Status:** 🔴 RED - 四维度组件未实现
   - **Verifies:** AC-2 - 完整性检查
   - **Missing Elements:**
     - 所有 4 个维度卡片
     - 至少 3 个特征标签/维度

**[AC-4] 实时进度显示 (2 tests):**

9. ✅ **Test:** [P0] should display analysis progress
   - **Status:** 🔴 RED - 进度组件未集成
   - **Verifies:** AC-4 - 进度显示
   - **Missing Elements:**
     - `[data-testid="progress-display"]`
     - `[data-testid="current-step-text"]`
     - `[data-testid="estimated-time"]`

10. ✅ **Test:** [P2] should support canceling analysis
   - **Status:** 🔴 RED - 取消功能未实现
   - **Verifies:** AC-4 - 取消分析
   - **Missing Elements:**
     - `[data-testid="cancel-analysis-button"]`
     - `[data-testid="cancel-confirm-dialog"]`

**[AC-5] 低置信度处理 (2 tests):**

11. ✅ **Test:** [P1] should show low confidence warning
   - **Status:** 🔴 RED - 警告 UI 未实现
   - **Verifies:** AC-5 - 低置信度警告 (< 0.6)
   - **Missing Elements:**
     - `[data-testid="confidence-warning"]`
     - `[data-testid="reanalyze-button"]`

12. ✅ **Test:** [P2] should highlight low confidence dimensions
   - **Status:** 🔴 RED - 维度警告未实现
   - **Verifies:** AC-5 - 维度级别警告
   - **Missing Elements:**
     - `[data-testid="dimension-warning-icon"]`
     - `[data-testid="dimension-warning-text"]`

**[AC-6] 用户反馈收集 (已包含在综合测试中):**

**[AC-7] 移动端优化 + AI 透明度 (2 tests):**

13. ✅ **Test:** [P1] should simplify display on mobile
   - **Status:** 🔴 RED - 移动端布局未实现
   - **Verifies:** AC-7 - 移动端优化
   - **Missing Elements:**
     - `[data-testid="dimensions-grid"][data-columns="1"]`
     - `[data-testid="main-style-tags"]`
     - `[data-testid="view-desktop-link"]`

14. ✅ **Test:** [P0] should display AI transparency badge
   - **Status:** 🔴 RED - AI 标注未实现
   - **Verifies:** AC-7 - AI 透明度（合规要求）
   - **Missing Elements:**
     - `[data-testid="ai-result-badge"]`
     - `[data-testid="analysis-header"]`

**[AC-8] 内容安全检查 (1 test):**

15. ✅ **Test:** [P0] should reject inappropriate content
   - **Status:** 🔴 RED - 安全检查 UI 未实现
   - **Verifies:** AC-8 - 内容安全
   - **Missing Elements:**
     - `[data-testid="analysis-error"]`

**[AC-9] Credit 系统集成 (2 tests):**

16. ✅ **Test:** [P0] should deduct credit
   - **Status:** 🔴 RED - Credit 扣除 UI 未实现
   - **Verifies:** AC-9 - Credit 扣除
   - **Missing Elements:**
     - `[data-testid="user-credit-balance"]`

17. ✅ **Test:** [P1] should handle insufficient credits
   - **Status:** 🔴 RED - Credit 不足 UI 未实现
   - **Verifies:** AC-9 - Credit 不足处理
   - **Missing Elements:**
     - `[data-testid="credit-insufficient-error"]`
     - `[data-testid="upgrade-button"]`

**综合测试场景:**

18. ✅ **Test:** [P0] complete analysis workflow
   - **Status:** 🔴 RED - 端到端流程未实现
   - **Verifies:** 所有 AC - 完整用户流程
   - **Workflow:**
     1. 上传图片 ✅ (Story 2-1)
     2. 点击分析按钮 🔴
     3. 查看进度显示 🔴
     4. 查看四维度结果 🔴
     5. 验证 AI 标注 🔴
     6. 提交反馈 🔴
     7. 验证 Credit 扣除 🔴

---

## Implementation Checklist

### **Phase 1: 基础设施和数据库 (AC-3)**

#### Task 1.1: 创建数据库 Schema
**File:** `src/lib/db/schema.ts`
**AC:** AC-3
**Estimated Time:** 30 minutes

**Subtasks:**
- [ ] 1.1.1 添加 `analysis_results` 表定义
  ```typescript
  export const analysisResults = pgTable('analysis_results', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    imageId: integer('image_id').notNull().references(() => images.id),
    analysisData: jsonb('analysis_data').notNull().$type<AnalysisData>(),
    confidenceScore: real('confidence_score').notNull(),
    feedback: text('feedback'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  ```
- [ ] 1.1.2 运行 `npm run db:generate`
- [ ] 1.1.3 运行 `npm run db:migrate`
- [ ] 1.1.4 验证表结构（使用 Drizzle Studio）

**Tests to Pass:**
- ✅ Unit Test #16-29: Zod Schema 验证测试

---

#### Task 1.2: 创建类型定义
**File:** `src/types/analysis.ts`
**AC:** AC-2, AC-3
**Estimated Time:** 15 minutes

**Subtasks:**
- [ ] 1.2.1 定义 `AnalysisData` 类型
- [ ] 1.2.2 定义 `StyleDimension` 类型
- [ ] 1.2.3 定义 `StyleFeature` 类型

**Tests to Pass:**
- ✅ Unit Test #16-29: Schema 类型验证

---

### **Phase 2: Replicate Vision 集成 (AC-1)**

#### Task 2.1: 扩展 Vision 客户端
**File:** `src/lib/replicate/vision.ts` (扩展现有文件)
**AC:** AC-1
**Estimated Time:** 2 hours

**Subtasks:**
- [ ] 2.1.1 添加 `analyzeImageStyle` 函数
  ```typescript
  export async function analyzeImageStyle(
    imageUrl: string
  ): Promise<AnalysisData> {
    // 实现
  }
  ```
- [ ] 2.1.2 实现超时控制（60 秒）
- [ ] 2.1.3 实现重试机制（最多 3 次，指数退避）
- [ ] 2.1.4 设计 Prompt 模板
- [ ] 2.1.5 添加错误处理

**Tests to Pass:**
- ✅ Unit Test #1-6: 解析和验证测试
- ✅ API Test #1-3: API 调用测试
- ✅ E2E Test #1-3: API 集成测试

---

#### Task 2.2: 内容安全检查集成
**File:** `src/lib/replicate/vision.ts`
**AC:** AC-8
**Estimated Time:** 1 hour

**Subtasks:**
- [ ] 2.2.1 复用现有 `validateImageComplexity` 函数
- [ ] 2.2.2 集成到分析流程
- [ ] 2.2.3 记录审核日志

**Tests to Pass:**
- ✅ API Test #3, 20-21: 内容安全测试
- ✅ E2E Test #15: 不当内容拒绝测试

---

### **Phase 3: 分析结果解析 (AC-2, AC-3, AC-5)**

#### Task 3.1: 实现解析器
**File:** `src/lib/analysis/parser.ts` (新建)
**AC:** AC-2, AC-3
**Estimated Time:** 1.5 hours

**Subtasks:**
- [ ] 3.1.1 实现 `parseAnalysisResponse` 函数
- [ ] 3.1.2 实现 `extractFeatures` 函数
- [ ] 3.1.3 实现 `calculateAverageConfidence` 函数
- [ ] 3.1.4 实现 `validateConfidenceRange` 函数
- [ ] 3.1.5 定义 Zod Schemas

**Tests to Pass:**
- ✅ Unit Test #1-15: 解析和提取测试
- ✅ Unit Test #30-33: 低置信度检测测试

---

#### Task 3.2: 实现低置信度检测
**File:** `src/lib/analysis/detector.ts` (新建)
**AC:** AC-5
**Estimated Time:** 1 hour

**Subtasks:**
- [ ] 3.2.1 实现 `detectLowConfidence` 函数
- [ ] 3.2.2 实现 `detectLowConfidenceDimensions` 函数
- [ ] 3.2.3 实现警告级别判断逻辑

**Tests to Pass:**
- ✅ Unit Test #30-33: 低置信度检测
- ✅ E2E Test #11-12: 警告 UI 测试

---

### **Phase 4: API 端点实现 (AC-1, AC-3, AC-4, AC-6, AC-9)**

#### Task 4.1: POST /api/analysis
**File:** `src/app/api/analysis/route.ts` (新建)
**AC:** AC-1, AC-8, AC-9
**Estimated Time:** 2 hours

**Subtasks:**
- [ ] 4.1.1 验证用户认证
- [ ] 4.1.2 验证 imageId 参数
- [ ] 4.1.3 **检查 credit 余额**（AC-9）
- [ ] 4.1.4 **内容安全检查**（AC-8）
- [ ] 4.1.5 创建 analysis 记录
- [ ] 4.1.6 触发后台分析任务
- [ ] 4.1.7 返回 analysisId 和 status

**Tests to Pass:**
- ✅ API Test #1-6: 创建分析测试
- ✅ API Test #17-19: Credit 集成测试
- ✅ API Test #20-21: 内容安全测试

---

#### Task 4.2: GET /api/analysis/[id]/status
**File:** `src/app/api/analysis/[id]/status/route.ts` (扩展现有)
**AC:** AC-1, AC-3, AC-4
**Estimated Time:** 1 hour

**Subtasks:**
- [ ] 4.2.1 验证用户权限
- [ ] 4.2.2 查询 analysis 状态
- [ ] 4.2.3 **在 completed 时返回分析结果**（AC-3）
- [ ] 4.2.4 返回进度和专业术语（AC-4）

**Tests to Pass:**
- ✅ API Test #7-11: 状态查询测试
- ✅ E2E Test #9: 进度显示测试

---

#### Task 4.3: POST /api/analysis/[id]/feedback
**File:** `src/app/api/analysis/[id]/feedback/route.ts` (新建)
**AC:** AC-6
**Estimated Time:** 1 hour

**Subtasks:**
- [ ] 4.3.1 验证用户权限
- [ ] 4.3.2 验证 feedback 值（accurate/inaccurate）
- [ ] 4.3.3 检查是否已提交过反馈
- [ ] 4.3.4 更新 `analysis_results.feedback` 字段
- [ ] 4.3.5 返回成功消息

**Tests to Pass:**
- ✅ API Test #12-16: 反馈提交测试
- ✅ E2E Test: 反馈 UI 测试（综合测试）

---

### **Phase 5: 前端组件实现 (AC-4, AC-5, AC-6, AC-7)**

#### Task 5.1: 分析结果卡片组件
**File:** `src/features/analysis/components/AnalysisResult/AnalysisCard.tsx`
**AC:** AC-2, AC-3
**Estimated Time:** 2 hours

**Subtasks:**
- [ ] 5.1.1 创建 `AnalysisCard` 组件
- [ ] 5.1.2 创建 `DimensionCard` 组件（4 个维度）
- [ ] 5.1.3 创建 `FeatureTag` 组件
- [ ] 5.1.4 添加 `data-testid` 属性
- [ ] 5.1.5 实现 2x2 网格布局

**Tests to Pass:**
- ✅ E2E Test #4-8: 四维度显示测试

---

#### Task 5.2: 置信度可视化
**File:** `src/features/analysis/components/AnalysisResult/ConfidenceBadge.tsx`
**AC:** AC-5
**Estimated Time:** 1 hour

**Subtasks:**
- [ ] 5.2.1 创建 `ConfidenceBadge` 组件
- [ ] 5.2.2 实现颜色逻辑：
  - ≥ 0.8: 绿色
  - 0.6-0.8: 黄色
  - < 0.6: 红色 + 警告
- [ ] 5.2.3 添加"重新分析"按钮（低置信度）
- [ ] 5.2.4 添加维度警告图标

**Tests to Pass:**
- ✅ E2E Test #11-12: 低置信度警告测试

---

#### Task 5.3: 用户反馈收集
**File:** `src/features/analysis/components/AnalysisResult/FeedbackCollector.tsx`
**AC:** AC-6
**Estimated Time:** 1 hour

**Subtasks:**
- [ ] 5.3.1 创建反馈按钮组件
- [ ] 5.3.2 实现"准确"/"不准确"按钮
- [ ] 5.3.3 实现感谢消息显示
- [ ] 5.3.4 集成反馈 API

**Tests to Pass:**
- ✅ E2E Test: 反馈提交测试（综合测试）

---

#### Task 5.4: AI 透明度标注
**File:** `src/features/analysis/components/AnalysisResult/AIBadge.tsx`
**AC:** AC-7
**Estimated Time:** 30 minutes

**Subtasks:**
- [ ] 5.4.1 创建 `AIResultBadge` 组件
- [ ] 5.4.2 使用红色/橙色样式
- [ ] 5.4.3 添加到结果页面顶部
- [ ] 5.4.4 确保移动端也显示

**Tests to Pass:**
- ✅ E2E Test #14: AI 透明度标注测试

---

#### Task 5.5: 移动端优化
**File:** `src/features/analysis/components/AnalysisResult/ResponsiveGrid.tsx`
**AC:** AC-7
**Estimated Time:** 1 hour

**Subtasks:**
- [ ] 5.5.1 实现响应式网格：
  - 移动端 (< 768px): 1 列
  - 平板/桌面 (≥ 768px): 2 列
- [ ] 5.5.2 简化移动端信息显示
- [ ] 5.5.3 添加"在桌面端查看详细分析"链接
- [ ] 5.5.4 优化字体大小和间距

**Tests to Pass:**
- ✅ E2E Test #13: 移动端优化测试

---

#### Task 5.6: 进度反馈集成
**File:** `src/features/analysis/components/ProgressDisplay/` (复用 Story 2-4)
**AC:** AC-4
**Estimated Time:** 30 minutes

**Subtasks:**
- [ ] 5.6.1 复用 `ProgressDisplay` 组件
- [ ] 5.6.2 更新专业术语常量：
  - "正在分析光影特征..."
  - "正在识别构图方法..."
  - "正在提取色彩信息..."
  - "正在识别艺术风格..."
- [ ] 5.6.3 集成轮询机制（2 秒间隔）

**Tests to Pass:**
- ✅ E2E Test #9: 进度显示测试

---

### **Phase 6: Credit 系统集成 (AC-9)**

#### Task 6.1: Credit 检查和扣除
**File:** `src/lib/credit/manager.ts` (扩展)
**AC:** AC-9
**Estimated Time:** 1.5 hours

**Subtasks:**
- [ ] 6.1.1 实现 `checkCreditBalance` 函数
- [ ] 6.1.2 实现 `deductAnalysisCredit` 函数
- [ ] 6.1.3 实现 `recordCreditTransaction` 函数
- [ ] 6.1.4 集成到分析 API

**Tests to Pass:**
- ✅ API Test #17-19: Credit 系统测试
- ✅ E2E Test #16-17: Credit UI 测试

---

### **Phase 7: 测试数据准备**

#### Task 7.1: 创建测试图片
**Location:** `tests/fixtures/images/analysis/`
**Estimated Time:** 1 hour

**Subtasks:**
- [ ] 7.1.1 准备光影测试图片 (`portrait-lighting.jpg`)
- [ ] 7.1.2 准备构图测试图片 (`landscape-composition.jpg`)
- [ ] 7.1.3 准备色彩测试图片 (`colorful-palette.jpg`)
- [ ] 7.1.4 准备艺术风格测试图片 (`impressionist-art.jpg`)
- [ ] 7.1.5 准备低质量图片 (`low-quality.jpg`)
- [ ] 7.1.6 准备不当内容图片（需特殊处理）

---

## Test Execution Status

### Unit Tests (47 tests)
- **Status:** 🔴 RED - 所有测试失败（函数不存在）
- **Command:** `npm run test:unit`
- **Next:** 实现解析器和验证函数

### API Tests (25 tests)
- **Status:** 🔴 RED - 所有测试失败（端点不存在）
- **Command:** `npm run test:api`
- **Next:** 实现 API 端点

### E2E Tests (12 tests)
- **Status:** 🔴 RED - 所有测试失败（UI 不存在）
- **Command:** `npm run test:e2e -- project=story-3-1`
- **Next:** 实现前端组件

---

## Implementation Order (Recommended)

### Iteration 1: 核心功能 (P0)
1. Task 1.1-1.2: 数据库和类型定义
2. Task 2.1: Replicate Vision 集成
3. Task 3.1: 分析结果解析
4. Task 4.1-4.2: 核心 API 端点
5. Task 5.1-5.2: 核心前端组件

**Target Tests:** 15 个 P0 测试通过

### Iteration 2: 错误处理 (P1)
6. Task 2.2: 内容安全检查
7. Task 3.2: 低置信度检测
8. Task 4.3: 反馈 API
9. Task 5.3-5.4: 反馈和 AI 标注 UI
10. Task 5.6: 进度反馈集成

**Target Tests:** 20 个 P1 测试通过

### Iteration 3: 优化和完善 (P2)
11. Task 5.5: 移动端优化
12. Task 6.1: Credit 系统完善
13. Task 7.1: 测试数据准备

**Target Tests:** 所有 84 个测试通过

---

## Dependencies and Blockers

### External Dependencies
- ✅ Replicate API (已配置)
- ✅ PostgreSQL 数据库（已设置）
- ⏳ 测试图片文件（需准备）

### Internal Dependencies
- ✅ Story 2-1: 图片上传功能
- ✅ Story 2-4: 进度反馈组件
- ✅ `src/lib/replicate/vision.ts` (已存在)

### Blocking Stories
- Story 3-2: 批量分析（依赖本 Story）

---

## Notes

### Critical Path
1. 数据库 Schema → 类型定义 → 解析器
2. Replicate Vision → 分析 API → 前端集成
3. Credit 系统 → 分析流程集成

### Risk Areas
- **Replicate API 稳定性**: 超时和重试机制必须健壮
- **内容安全检查**: 需要准确识别不当内容
- **AI 透明度**: 合规要求，必须正确实现

### Test Data Strategy
- 使用 Mock 响应以避免依赖真实 API
- 准备多样化的测试图片覆盖不同场景
- 测试用户数据包含不同 Credit 余额场景

---

## Summary Checklist

**Test Status:** 🔴 RED (所有测试失败，这是正常的 - TDD 第一步)

**Total Failing Tests:** 84
- Unit Tests: 47 🔴
- API Tests: 25 🔴
- E2E Tests: 12 🔴

**Acceptance Criteria Coverage:** 100%
- ✅ AC-1: Replicate Vision API 调用
- ✅ AC-2: 四维度特征提取
- ✅ AC-3: 结构化数据存储
- ✅ AC-4: 实时进度显示
- ✅ AC-5: 低置信度处理
- ✅ AC-6: 用户反馈收集
- ✅ AC-7: 移动端优化 + AI 透明度
- ✅ AC-8: 内容安全检查
- ✅ AC-9: Credit 系统集成

**Next Steps:**
1. ✅ 失败测试已生成
2. ✅ Implementation checklist created
3. ⏳ 开始实施：从 Phase 1 Task 1.1 开始
4. ⏳ 逐个通过测试，从 P0 开始

**Estimated Implementation Time:** 12-16 hours
**Target Completion:** 所有 84 个测试通过 (🟢 GREEN)
