# Sprint 变更提案 - UX 设计规范升级

**提案编号：** SCP-2026-02-18-001
**提案日期：** 2026-02-18
**提案人：** Muchao
**状态：** 📝 待审批
**优先级：** 🟡 P0（高优先级，非阻塞）

---

## 1. 问题摘要

### 触发背景

**变更类型：** ✅ 新需求涌现（来自设计和用户体验优化）

**发现时间：** 2026-02-18

**触发来源：** UX 设计规范更新（v1.1, 2026-02-17）

**问题陈述：**

```
当前已完成的 Epic 0-4 代码实现基于旧的 UX 设计规范。
新的 UX 设计规范（v1.1）引入了三大关键更新：

1. 核心流程优化 - 简化为 3 步上传分析流程
2. Glassmorphism 视觉规范 - 统一的玻璃态设计语言
3. 图标系统规范 - 强制使用 Lucide 图标库

现有代码存在以下冲突：
• 使用 @mui/icons-material（Material Icons）- 违反新规范
• 样式系统可能未应用 Glassmorphism 规范
• 上传流程交互可能不符合 3 步优化方案
```

**影响范围：**
- ✅ 已完成的 Epic 0-4（主要影响 Epic 2 和 Epic 3）
- 🟢 未来的 Epic 5-9（不受影响，开发时直接遵循新规范）

---

## 2. 影响分析

### 2.1 Epic 影响评估

| Epic | 状态 | 影响级别 | 具体影响 |
|------|------|---------|---------|
| **Epic 0** | ✅ Done | 🔴 高 | 基础样式系统需要调整以支持 Glassmorphism |
| **Epic 1** | ✅ Done | 🟡 中 | 用户菜单 UI 可能需要图标系统更新 |
| **Epic 2** | ✅ Done | 🔴 高 | 图片上传流程需要优化，图标需要替换 |
| **Epic 3** | ✅ Done | 🔴 高 | 分析结果展示需要 Glassmorphism 样式，图标需要替换 |
| **Epic 4** | ✅ Done | 🟢 低 | 内容安全主要是后端，UI 影响较小 |
| **Epic 5-9** | 📋 Backlog | 🟢 无 | 开发时直接遵循新规范 |

### 2.2 工件冲突分析

#### PRD 冲突
- 🟢 **无冲突**
- 功能需求（FR1-82）保持不变
- MVP 范围和成功标准不受影响

#### 架构文档冲突
- 🟢 **低冲突**
- 技术栈保持不变（MUI + Tailwind）
- 需要添加依赖：`lucide-react`
- 需要移除依赖：`@mui/icons-material`（仅移除图标库，保留 MUI 组件库）

#### UI/UX 规范冲突
- 🔴 **这正是变更源头**
- 需要全面应用新的 UX 设计规范

#### 其他工件
- 🟢 **无影响**（部署脚本、CI/CD、监控等）

### 2.3 技术影响评估

**前端代码影响：**

| 影响区域 | 预估文件数 | 工作量 |
|---------|-----------|--------|
| 图标系统替换 | ~30 个组件 | 1 天 |
| Glassmorphism 样式 | ~15 个组件 | 0.5 天 |
| 上传流程优化 | ~3 个组件 | 0.5 天 |
| 测试和验证 | - | 0.5 天 |
| 文档更新 | ~3 个文档 | 0.5 天 |
| **总计** | ~50 个文件 | **2-3 天** |

**后端代码影响：**
- 🟢 **无影响** - 仅前端视觉和交互变更

---

## 3. 推荐方案

### ✅ 方案：直接调整（推荐）

**理由：**
1. ✅ 实施工作量可控（2-3 个工作日）
2. ✅ 风险低（仅视觉层面变更，不涉及核心逻辑）
3. ✅ 不影响 MVP（功能需求保持不变）
4. ✅ 向后兼容（不破坏现有功能）
5. ✅ 可增量实施（分阶段逐步完成）

**实施策略：**

**选项 A：创建专门 Story（推荐）**
- 在 Sprint 中创建新的 Story：`UX-UPGRADE-1: UX 设计规范升级`
- 优先级：P0（高优先级，但不阻塞 Epic 5-9 开发）
- 可以并行进行：
  - 继续开发 Epic 5-9（使用新规范）
  - 同步升级 Epic 0-4 代码

**选项 B：融入现有 Story**
- 将升级工作拆分到相关的 Epic 维护任务中
- 缺点：不够系统，容易遗漏

**推荐选项 A**

---

## 4. 详细变更提案

### 4.1 Story 变更：新建 UX 升级 Story

**新增 Story: UX-UPGRADE-1 - UX 设计规范升级**

```
Story ID: UX-UPGRADE-1
标题: UX 设计规范升级 - Glassmorphism + Lucide 图标 + 流程优化
Epic: 跨 Epic（影响 Epic 0-4）
优先级: P0（高优先级，非阻塞）
估算工作量: 2-3 天
```

**Acceptance Criteria:**

```gherkin
Feature: UX 设计规范升级

Scenario: 图标系统迁移
  Given 项目当前使用 @mui/icons-material
  When 完成图标系统迁移
  Then 所有 Material Icons 替换为 Lucide 图标
  And 图标尺寸和颜色符合 14-icon-system.md 规范
  And 无障碍 aria-label 正确设置

Scenario: Glassmorphism 样式应用
  Given 当前样式未应用 Glassmorphism 规范
  When 完成样式系统升级
  Then 所有卡片组件使用标准 Glassmorphism 样式
  And CSS 包含 backdrop-filter: blur(12px)
  And 背景透明度为 0.6
  And 边框使用 rgba(255,255,255,0.1)

Scenario: 上传流程优化
  Given 当前上传流程可能包含多余步骤
  When 完成交互优化
  Then 拖拽图片后自动开始分析（无需额外确认）
  And 显示实时进度 + 阶段说明
  And 结果页面"一键复制"按钮在首屏可见

Scenario: 开发检查清单验证
  Given 所有 UX 升级完成
  When 执行开发检查清单
  Then 通过 12-core-flow-optimization.md 所有检查项
  And 通过 13-glassmorphism-guide.md 所有检查项
  And 通过 14-icon-system.md 所有检查项
```

### 4.2 具体代码变更提案

#### 变更 1: 依赖项更新

**文件：** `package.json`

**OLD:**
```json
{
  "dependencies": {
    "@mui/icons-material": "^5.x.x",
    // ...其他依赖
  }
}
```

**NEW:**
```json
{
  "dependencies": {
    // 移除: "@mui/icons-material": "^5.x.x",
    "lucide-react": "^0.344.0", // 新增 Lucide 图标库
    // ...其他依赖
  }
}
```

**Rationale:**
- Lucide 图标库与 Glassmorphism 风格高度匹配
- 符合 14-icon-system.md 规范
- 更好的 tree-shaking 支持

---

#### 变更 2: 全局样式系统 - Glassmorphism 工具类

**文件：** `src/styles/globals.css`（或 `tailwind.config.js`）

**NEW:**
```css
/* Glassmorphism 基础工具类 */
.glass-card {
  /* 1. 半透明背景 - 必须 */
  background: rgba(15, 23, 42, 0.6);

  /* 2. 背景模糊 - 必须 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari 支持 */

  /* 3. 微妙边框 - 必须 */
  border: 1px solid rgba(255, 255, 255, 0.1);

  /* 4. 圆角 - 必须 */
  border-radius: 12px;

  /* 5. 阴影 - 必须 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  /* 6. 过渡动画 - 推荐 */
  transition: all 0.2s ease;
}

.glass-card:hover {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

/* 高亮状态（选中/激活） */
.glass-card.active {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.15),
    0 0 20px rgba(34, 197, 94, 0.2); /* 绿色光晕 */
}
```

**Rationale:**
- 提供可复用的 Glassmorphism 样式工具类
- 符合 13-glassmorphism-guide.md 规范
- 统一视觉语言

---

#### 变更 3: 分析页面 - 图标系统替换

**文件：** `src/app/analysis/page.tsx`

**OLD:**
```tsx
import { Psychology as PsychologyIcon } from '@mui/icons-material';
// ...其他导入
```

**NEW:**
```tsx
import { Brain } from 'lucide-react'; // 替换为 Lucide 图标
// ...其他导入
```

**Rationale:**
- 符合 14-icon-system.md 规范
- Lucide 图标更现代、简洁
- 与 Glassmorphism 风格匹配

---

#### 变更 4: 分析结果卡片 - Glassmorphism 样式应用

**文件：** `src/features/analysis/components/AnalysisResult/AnalysisCard.tsx`

**OLD:**
```tsx
<Card sx={{
  // 可能使用不透明背景
  backgroundColor: '#1E293B',
  // 可能缺少模糊效果
}}>
  {/* 卡片内容 */}
</Card>
```

**NEW:**
```tsx
<Card className="glass-card" sx={{
  // 移除不透明背景，使用 glass-card 类
  // backdrop-filter 由 glass-card 类提供
}}>
  {/* 卡片内容 */}
</Card>
```

**Rationale:**
- 应用标准 Glassmorphism 样式
- 符合 13-glassmorphism-guide.md 规范
- 提升视觉一致性

---

#### 变更 5: 上传组件 - 流程优化（拖拽即开始）

**文件：** `src/features/analysis/components/ImageUploader/index.tsx`

**OLD:**
```tsx
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    setImageFile(file);
    // 可能需要用户点击"开始分析"按钮
  }
};
```

**NEW:**
```tsx
const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    // 立即显示上传进度
    showUploadProgress();
    // 上传完成后自动开始分析（无需用户再次确认）
    await uploadImage(file);
    onStartAnalysis(); // 自动触发分析
  }
};
```

**Rationale:**
- 符合 12-core-flow-optimization.md "拖拽即开始" 规范
- 减少用户点击次数
- 提升用户体验

---

#### 变更 6: 四维度分析图标 - Lucide 图标替换

**文件：** `src/features/analysis/components/AnalysisResult/DimensionCard.tsx`（假设存在）

**OLD:**
```tsx
// 可能使用 Material Icons
import { WbSunny, GridOn, Palette, AutoAwesome } from '@mui/icons-material';
```

**NEW:**
```tsx
import { Sun, Grid3X3, Palette, Sparkles } from 'lucide-react';

const dimensionIcons = {
  lighting: <Sun className="w-6 h-6 text-yellow-500" />,
  composition: <Grid3X3 className="w-6 h-6 text-blue-500" />,
  color: <Palette className="w-6 h-6 text-purple-500" />,
  artisticStyle: <Sparkles className="w-6 h-6 text-pink-500" />,
};
```

**Rationale:**
- 符合 14-icon-system.md 图标映射规范
- Lucide 图标语义与功能匹配
- 统一尺寸和颜色规范

---

### 4.3 开发检查清单

#### 核心流程优化（12-core-flow-optimization.md）

```markdown
- [ ] 拖拽上传在整个页面区域都可用（不只是上传框内）
- [ ] 上传进度在 1 秒内显示
- [ ] 上传完成后自动开始分析（无需用户点击"开始分析"）
- [ ] 分析进度每 1 秒更新一次
- [ ] 预计时间准确度 ± 10 秒
- [ ] "取消"按钮始终可用
- [ ] 结果页面"一键复制"按钮在首屏可见（无需滚动）
- [ ] 展开收起动画流畅（300ms）
- [ ] 移动端不显示桌面端的高级功能
```

#### Glassmorphism 实施指南（13-glassmorphism-guide.md）

```markdown
- [ ] 背景使用半透明颜色（`rgba` 或 `/60` 透明度）
- [ ] 添加 `backdrop-filter: blur(12px)` 和 `-webkit-backdrop-filter`
- [ ] 边框颜色使用 `rgba(255, 255, 255, 0.1)` 或 `border-white/10`
- [ ] 圆角统一使用 `12px` 或 `rounded-xl`
- [ ] 阴影使用 `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15)`
- [ ] 悬停状态有平滑过渡（`transition: all 0.2s ease`）
- [ ] 在深色背景上测试可见性
- [ ] Safari 浏览器测试（需要 `-webkit-backdrop-filter`）
```

#### 图标系统规范（14-icon-system.md）

```markdown
- [ ] 图标来自 `lucide-react` 包
- [ ] 图标尺寸符合标准规范（16/20/24/32px）
- [ ] 图标颜色使用主题色（green-500/slate-400/等）
- [ ] 按钮内图标与文字间距为 `mr-2` 或 `gap-2`
- [ ] 图标粗细统一（`stroke-width: 2`）
- [ ] 无障碍：图标按钮有 `aria-label`
- [ ] 图标语义与功能匹配（如复制用 `Copy`，而非 `Download`）
- [ ] 无 @mui/icons-material 导入
```

---

## 5. 实施移交计划

### 5.1 变更范围分类

**🔴 范围级别：** **Minor（次要变更）**

**理由：**
- ✅ 可以由开发团队直接实施
- ✅ 不需要 PO/SM 大规模重新规划
- ✅ 不需要 PM/Architect 战略级介入
- ✅ 可以并行进行，不阻塞其他开发工作

### 5.2 移交接收方

**主要责任人：** 💻 开发团队（Developer Agent）

**协作方：**
- 🏃 Scrum Master - 创建 Story 和跟踪进度
- 🎨 UX Designer（如有） - 验证视觉实现符合规范

### 5.3 实施步骤

**阶段 1: 准备工作（0.5 天）**
1. 创建 Story: `UX-UPGRADE-1`
2. 安装依赖：`npm install lucide-react`
3. 移除依赖：`npm uninstall @mui/icons-material`
4. 创建 Glassmorphism CSS 工具类

**阶段 2: 图标系统迁移（1 天）**
1. 全局搜索 `@mui/icons-material` 导入
2. 逐一替换为 Lucide 图标（参考 14-icon-system.md 映射表）
3. 调整图标尺寸和颜色
4. 添加无障碍 aria-label

**阶段 3: Glassmorphism 样式应用（0.5 天）**
1. 应用 `glass-card` 类到所有卡片组件
2. 验证样式在深色背景上可见
3. 测试 Safari 兼容性

**阶段 4: 上传流程优化（0.5 天）**
1. 实现拖拽即开始功能
2. 优化进度反馈
3. 调整结果页面布局（一键复制首屏可见）

**阶段 5: 测试和验证（0.5 天）**
1. 执行开发检查清单
2. 视觉回归测试
3. 跨浏览器测试（Chrome, Safari, Firefox）
4. 移动端测试

**阶段 6: 文档更新（0.5 天）**
1. 更新开发指南
2. 更新组件文档
3. 记录技术决策

### 5.4 成功标准

**验收标准：**
- ✅ 通过所有 3 个开发检查清单（12/13/14 文档）
- ✅ 无 Material Icons 残留
- ✅ 所有卡片组件使用 Glassmorphism 样式
- ✅ 上传流程符合 3 步优化方案
- ✅ 跨浏览器兼容性验证通过
- ✅ 移动端适配验证通过

**质量指标：**
- 🎯 视觉回归测试通过率 > 95%
- 🎯 无障碍测试通过率 100%
- 🎯 用户体验测试满意度 > 4.5/5

### 5.5 时间线

| 阶段 | 开始日期 | 结束日期 | 负责人 |
|------|---------|---------|--------|
| 准备工作 | 2026-02-19 | 2026-02-19 | 开发团队 |
| 图标系统迁移 | 2026-02-20 | 2026-02-20 | 开发团队 |
| Glassmorphism 样式 | 2026-02-21（上午） | 2026-02-21（下午） | 开发团队 |
| 上传流程优化 | 2026-02-22（上午） | 2026-02-22（下午） | 开发团队 |
| 测试和验证 | 2026-02-23（上午） | 2026-02-23（下午） | QA + 开发 |
| 文档更新 | 2026-02-24（上午） | 2026-02-24（下午） | 开发团队 |

**总工期：** 5 个工作日（2026-02-19 - 2026-02-24）

### 5.6 风险和缓解措施

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|-------|------|---------|
| Safari 兼容性问题 | 🟡 中 | 🟡 中 | 使用 `-webkit-backdrop-filter` 前缀，提前测试 |
| 图标语义不匹配 | 🟢 低 | 🟢 低 | 参考 14-icon-system.md 映射表，逐一核对 |
| 视觉回归 Bug | 🟡 中 | 🟡 中 | 增量提交，每阶段验证，视觉回归测试 |
| 影响其他开发工作 | 🟢 低 | 🟢 低 | 并行开发，不阻塞 Epic 5-9 |

---

## 6. 附录

### 6.1 相关文档

- [12-core-flow-optimization.md](../_bmad-output/planning-artifacts/ux-design/12-core-flow-optimization.md) - 核心流程优化方案
- [13-glassmorphism-guide.md](../_bmad-output/planning-artifacts/ux-design/13-glassmorphism-guide.md) - Glassmorphism 实施指南
- [14-icon-system.md](../_bmad-output/planning-artifacts/ux-design/14-icon-system.md) - 图标系统规范
- [epics.md](../_bmad-output/planning-artifacts/epics.md) - Epic 和 Story 规划
- [architecture.md](../_bmad-output/planning-artifacts/architecture.md) - 架构设计文档
- [prd.md](../_bmad-output/planning-artifacts/prd.md) - 产品需求文档

### 6.2 决策日志

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-02-18 | 选择"直接调整"方案 | 工作量可控、风险低、不影响 MVP |
| 2026-02-18 | 创建专门 Story（UX-UPGRADE-1） | 系统化升级、易于跟踪 |
| 2026-02-18 | 使用 Lucide 图标库 | 符合新规范、与 Glassmorphism 匹配 |
| 2026-02-18 | 使用 CSS 工具类实现 Glassmorphism | 可复用、易维护 |

---

## 7. 审批

**提案状态：** 📝 待审批

**审批流程：**
1. 产品负责人（Muchao）审查提案
2. 确认实施优先级和时间线
3. 批准后创建 Story（UX-UPGRADE-1）
4. 分配给开发团队实施

**审批决策：**
- [ ] ✅ 批准 - 按提案实施
- [ ] ✅ 批准 - 需要调整（附调整意见）
- [ ] ❌ 拒绝 - 理由：___________

**审批人签字：** _______________
**审批日期：** _______________

---

**END OF DOCUMENT**
