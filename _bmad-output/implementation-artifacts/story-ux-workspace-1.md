# Story: UX-WORKSPACE-1 - 工作台式布局改造

## Story 信息

| 字段 | 值 |
|------|-----|
| **Story ID** | UX-WORKSPACE-1 |
| **Epic** | 跨 Epic（影响 Epic 2-3） |
| **优先级** | 🔴 P0（高优先级，阻塞后续开发） |
| **估算工作量** | 3-4 天（8 个工作日） |
| **状态** | 📋 Ready for Dev |
| **创建日期** | 2026-02-19 |
| **负责人** | TBD（开发团队） |
| **关联文档** | [15-workspace-layout.md](../../planning-artifacts/ux-design/15-workspace-layout.md) |

---

## 用户故事

**作为** 产品负责人（Muchao）
**我希望** 将 Analysis 页面改造为工作台式三列布局
**以便** 用户可以同时看到参考图片、分析结果和可编辑模版，无需分步切换

---

## 背景和动机

### 问题陈述

当前 Analysis 页面采用**分步式布局**，存在以下问题：

| 问题 | 影响 | 用户反馈 |
|------|------|----------|
| 分步切换导致上下文丢失 | 用户需要记忆参考图细节 | "我想对比参考图和分析结果，但看不到" |
| 单列布局空间浪费 | 桌面端大屏未充分利用 | "为什么结果跑到页面下方了？" |
| 需要手动点击"开始分析" | 增加操作步骤 | "上传后不能自动分析吗？" |
| 结果跳转到新页面 | 用户体验不连贯 | "我想回到参考图还要重新滚动" |

### 业务价值

- ✅ **提升用户体验**：统一视图，无需页面跳转
- ✅ **提高操作效率**：拖拽即开始，零摩擦交互
- ✅ **增强专业感**：三列布局符合专业工具设计
- ✅ **降低认知负担**：参考图和结果同时可见，便于对比

### 影响范围

- 🔴 **高影响：** Epic 2（图片上传）和 Epic 3（AI 分析）
- 🟢 **无影响：** Epic 1（用户认证）、Epic 4（内容安全）
- 🟢 **无影响：** Epic 5-9（未来功能）

---

## 验收标准

### 场景 1: 桌面端三列布局

```gherkin
Feature: 桌面端三列工作台布局

Scenario: 显示统一专业视图
  Given 用户访问 Analysis 页面
  And 用户使用桌面端浏览器（宽度 ≥ 960px）
  When 页面加载完成
  Then 页面显示三列布局
  And 左列显示"参考图片区"
  And 中列显示"分析结果区"
  And 右列显示"可编辑模版区"
  And 三列同时可见，无需滚动即可看到所有关键信息
```

**验证清单：**
- [ ] 左列宽度占 25%（Grid xs={12} md={3}）
- [ ] 中列宽度占 45%（Grid xs={12} md={6}）
- [ ] 右列宽度占 30%（Grid xs={12} md={3}）
- [ ] 列间距为 24px（Grid spacing={3}）
- [ ] 所有列使用 Glassmorphism 样式

---

### 场景 2: 拖拽即开始分析

```gherkin
Feature: 零摩擦上传分析流程

Scenario: 拖拽图片自动开始分析
  Given 用户在 Analysis 工作台页面
  And 左列显示上传区域
  When 用户拖拽图片到上传区域
  Then 图片立即开始上传
  And 上传完成后自动开始分析（无需用户点击"开始分析"）
  And 中列显示分析进度
  And 左列显示图片预览
  And 右列显示空状态提示
```

**验证清单：**
- [ ] 拖拽图片触发上传
- [ ] 上传进度在左列显示
- [ ] 上传完成后 0.5 秒内自动开始分析
- [ ] 移除旧的"开始分析"按钮（仅在 ready 状态）
- [ ] 保留"取消分析"按钮（在分析中状态）

---

### 场景 3: 进度实时更新

```gherkin
Feature: 中列进度实时反馈

Scenario: 分析进度在中列显示
  Given 图片正在分析中
  When 分析进度更新
  Then 中列显示进度条（0-100%）
  And 显示当前阶段："正在识别光影技巧..."
  And 显示预计剩余时间："预计 30 秒"
  And 显示质量承诺："正在确保分析准确性..."
  And 左列图片预览保持可见
  And 右列显示"等待分析完成..."
```

**验证清单：**
- [ ] 进度条每 1 秒更新一次
- [ ] 阶段说明准确显示
- [ ] 预计时间准确度 ± 10 秒
- [ ] 左列图片预览不消失

---

### 场景 4: 结果原地展开

```gherkin
Feature: 结果在中列原地展示

Scenario: 分析完成后结果在中列显示
  Given 分析进度达到 100%
  When 分析完成
  Then 中列显示分析结果（无页面跳转）
  And 显示整体置信度
  And 显示风格标签
  And 显示四维度卡片（光影、构图、色彩、艺术风格）
  And 右列自动生成模版
  And 左列图片预览保持可见
  And 显示"更换图片"按钮
```

**验证清单：**
- [ ] 结果在 300ms 内淡入显示
- [ ] 无页面刷新或跳转
- [ ] 左列图片预览不消失
- [ ] 右列模版自动生成

---

### 场景 5: 模版一键复制

```gherkin
Feature: 右列模版编辑和复制

Scenario: 一键复制模版到剪贴板
  Given 分析已完成
  And 右列显示"一键复制"按钮
  When 用户点击"一键复制"按钮
  Then 模版复制到剪贴板
  And 显示"已复制！"提示（1.5 秒后消失）
  And 按钮图标从"复制"变为"已复制"
```

**验证清单：**
- [ ] 复制按钮突出显示（ia-glass-card--active）
- [ ] 点击后立即显示"已复制"反馈
- [ ] 支持快捷键 Ctrl+C / Cmd+C
- [ ] 复制成功后 1.5 秒恢复原状

---

### 场景 6: 可折叠组件

```gherkin
Feature: 信息按需展开

Scenario: 折叠和展开详细信息
  Given 分析已完成
  And 中列显示四维度卡片
  When 用户点击"展开详细分析"按钮
  Then 详细分析内容展开（300ms 动画）
  And 用户偏好保存到 localStorage
  And 下次访问时恢复展开状态
```

**验证清单：**
- [ ] 折叠/展开动画流畅（300ms）
- [ ] 用户偏好记忆（localStorage）
- [ ] 默认展开的区块正确设置
- [ ] 默认折叠的区块正确设置

---

### 场景 7: 移动端单列布局

```gherkin
Feature: 移动端响应式布局

Scenario: 移动端单列垂直布局
  Given 用户使用移动端浏览器（宽度 < 960px）
  When 页面加载完成
  Then 显示单列垂直布局
  And 顺序为：参考图片 → 分析结果 → 可编辑模版
  And 每列占满宽度（100%）
  And 简化显示（隐藏社交证明、变量替换）
```

**验证清单：**
- [ ] 移动端单列布局
- [ ] 列顺序正确
- [ ] 隐藏高级功能
- [ ] 显示"在桌面端查看详细分析"提示

---

## 技术任务

### 阶段 1: 布局重构（1 天）

- [ ] **Task 1.1:** 创建三列响应式布局
  ```tsx
  <Container maxWidth="xl">
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>{/* 左列 */}</Grid>
      <Grid item xs={12} md={6}>{/* 中列 */}</Grid>
      <Grid item xs={12} md={3}>{/* 右列 */}</Grid>
    </Grid>
  </Container>
  ```

- [ ] **Task 1.2:** 创建左列组件结构
  - 文件：`src/app/analysis/page.tsx`
  - 创建 `LeftColumn` 组件（或内联 JSX）
  - 包含：ImageUploader, ImagePreview, FileInfo

- [ ] **Task 1.3:** 创建中列组件结构
  - 文件：`src/app/analysis/page.tsx`
  - 创建 `MiddleColumn` 组件（或内联 JSX）
  - 包含：EmptyState, ProgressDisplay, AnalysisCard

- [ ] **Task 1.4:** 创建右列组件结构
  - 文件：`src/app/analysis/page.tsx`
  - 创建 `RightColumn` 组件（或内联 JSX）
  - 包含：TemplateEditor, QualityBadge, SocialProofGallery

---

### 阶段 2: 核心组件开发（1.5 天）

- [ ] **Task 2.1:** 创建 CollapsibleSection 组件
  - 文件：`src/components/shared/CollapsibleSection.tsx`
  - 功能：折叠/展开动画、用户偏好记忆
  - 使用 MUI Collapse 组件（timeout={300}）

- [ ] **Task 2.2:** 创建 ImagePreview 组件
  - 文件：`src/features/analysis/components/ImagePreview.tsx`
  - 功能：显示已上传图片、文件信息
  - 使用 Next.js Image 组件

- [ ] **Task 2.3:** 创建 EmptyState 组件
  - 文件：`src/components/shared/EmptyState.tsx`
  - 功能：显示空状态提示、图标、文案
  - 可复用组件

- [ ] **Task 2.4:** 创建 TemplatePreview 组件
  - 文件：`src/features/analysis/components/TemplatePreview.tsx`
  - 功能：模版内容预览、语法高亮
  - 可选：使用 react-syntax-highlighter

- [ ] **Task 2.5:** 创建 VariableReplacer 组件
  - 文件：`src/features/analysis/components/VariableReplacer.tsx`
  - 功能：变量输入框、实时预览
  - 支持模版中的 `[变量名]` 替换

---

### 阶段 3: 状态管理优化（0.5 天）

- [ ] **Task 3.1:** 重构 AnalysisState
  - 文件：`src/app/analysis/page.tsx`
  - 拆分为：`imageState`, `analysisState`, `templateState`
  - 简化状态流转逻辑

- [ ] **Task 3.2:** 实现自动开始分析
  - 移除"开始分析"按钮（ready 状态）
  - 在 `handleAutoStartAnalysis` 中立即调用分析 API
  - 保留手动开始逻辑（仅在未自动触发时）

- [ ] **Task 3.3:** 列间状态同步
  - 左列上传完成 → 触发中列分析
  - 中列分析完成 → 触发右列模版生成
  - 使用 useEffect 监听状态变化

---

### 阶段 4: 交互优化（0.5 天）

- [ ] **Task 4.1:** 一键复制优化
  - 突出显示复制按钮（ia-glass-card--active）
  - 添加快捷键支持（Ctrl+C / Cmd+C）
  - 优化复制反馈动画

- [ ] **Task 4.2:** 折叠/展开动画
  - 使用 MUI Collapse 组件
  - 设置动画时长 300ms
  - 添加箭头图标旋转动画

- [ ] **Task 4.3:** 用户偏好记忆
  - 使用 localStorage 保存展开/折叠状态
  - 恢复用户上次的选择
  - 实现键名：`workspace-collapsed-{section-name}`

---

### 阶段 5: 响应式适配（0.5 天）

- [ ] **Task 5.1:** 桌面端三列布局验证
  - 测试 Chrome/Safari/Firefox
  - 验证列宽比例
  - 验证列间距

- [ ] **Task 5.2:** 移动端单列布局
  - 测试 iOS Safari/Android Chrome
  - 验证列顺序
  - 隐藏高级功能

- [ ] **Task 5.3:** 平板端两列布局（可选）
  - 测试 iPad/Android Tablet
  - 左列 40% + 右侧 60%（中列+右列堆叠）

---

### 阶段 6: 测试和文档（0.5 天）

- [ ] **Task 6.1:** 单元测试
  - 测试 CollapsibleSection 组件
  - 测试状态管理逻辑
  - 测试用户偏好记忆

- [ ] **Task 6.2:** 集成测试
  - 测试完整工作流程（上传→分析→复制）
  - 测试移动端布局
  - 测试状态切换

- [ ] **Task 6.3:** 更新文档
  - 更新 `development-guide.md`
  - 添加工作台布局使用说明
  - 记录技术决策

---

## 技术规范

### 布局配置

```tsx
// 桌面端三列布局
<Container maxWidth="xl">
  <Grid container spacing={3}>
    <Grid item xs={12} md={3}>{/* 左列 25% */}</Grid>
    <Grid item xs={12} md={6}>{/* 中列 45% */}</Grid>
    <Grid item xs={12} md={3}>{/* 右列 30% */}</Grid>
  </Grid>
</Container>
```

### CollapsibleSection 组件接口

```tsx
interface CollapsibleSectionProps {
  title: string;
  defaultExpanded: boolean;
  children: React.ReactNode;
  onToggle?: (expanded: boolean) => void;
  storageKey?: string; // 用于记忆用户偏好
}
```

### 状态管理

```tsx
interface WorkspaceState {
  image: {
    data: ImageData | null;
    status: 'idle' | 'uploading' | 'ready';
  };
  analysis: {
    data: AnalysisData | null;
    status: 'idle' | 'analyzing' | 'completed' | 'error';
    progress: number;
    stage: string;
  };
  template: {
    content: string | null;
    copied: boolean;
  };
}
```

---

## 依赖关系

**前置依赖：**
- ✅ Epic 0-4 已完成
- ✅ UX-UPGRADE-1 已完成（Glassmorphism + 图标系统）

**后置依赖：**
- 🟢 无阻塞依赖
- ✅ 后续功能（Epic 5-9）可基于工作台布局开发

**外部依赖：**
- 无

---

## 风险和缓解措施

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|-------|------|---------|
| 移动端布局体验差 | 🟡 中 | 🟡 中 | 简化移动端功能，引导到桌面端 |
| 状态管理复杂度增加 | 🟡 中 | 🟡 中 | 拆分状态，使用自定义 hook |
| 用户偏好记忆失效 | 🟢 低 | 🟢 低 | 提供 localStorage 降级方案 |
| 性能问题（三列同时渲染） | 🟢 低 | 🟡 中 | 使用虚拟化、懒加载 |

---

## 验收测试

### 功能测试
- [ ] 拖拽上传功能正常
- [ ] 自动开始分析功能正常
- [ ] 进度实时更新功能正常
- [ ] 结果原地展示功能正常
- [ ] 一键复制功能正常
- [ ] 折叠/展开功能正常
- [ ] 用户偏好记忆功能正常

### 响应式测试
- [ ] 桌面端三列布局正常
- [ ] 移动端单列布局正常
- [ ] 列顺序正确
- [ ] 列宽比例正确

### 性能测试
- [ ] 页面加载时间 < 2 秒
- [ ] 状态切换流畅（< 300ms）
- [ ] 折叠/展开动画流畅（60fps）
- [ ] 无内存泄漏

---

## 完成标准

**必须满足以下所有标准才能标记为 Done：**

1. ✅ 所有验收标准通过
2. ✅ 所有技术任务完成
3. ✅ 桌面端三列布局验证通过
4. ✅ 移动端单列布局验证通过
5. ✅ 跨浏览器测试通过
6. ✅ 无 P0/P1 Bug
7. ✅ 代码审查通过
8. ✅ 文档更新完成

---

## 备注

**相关文档：**
- [15-workspace-layout.md](../../planning-artifacts/ux-design/15-workspace-layout.md)
- [12-core-flow-optimization.md](../../planning-artifacts/ux-design/12-core-flow-optimization.md)
- [09-component-strategy.md](../../planning-artifacts/ux-design/09-component-strategy.md)

**参考资源：**
- MUI Grid 文档：https://mui.com/material-ui/react-grid/
- MUI Collapse 文档：https://mui.com/material-ui/transitions/#collapse

---

**Story 创建人：** Claude (AI Assistant)
**创建日期：** 2026-02-19
**最后更新：** 2026-02-19
