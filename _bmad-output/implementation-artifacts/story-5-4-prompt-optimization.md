# Story 5.4: prompt-optimization

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 创作者
I want 使用 AI 来优化和增强我编辑的提示词模版
so that 我可以获得更高质量、更专业的提示词,从而生成更好的同风格图片

## Acceptance Criteria

1. **AC1:** 系统提供"AI 优化"按钮,集成在模版编辑器中:
   - 按钮位置:编辑器操作按钮区域(与复制、导出、保存按钮并列)
   - 按钮样式:使用 Lucide Sparkles 图标,绿色主题色
   - 按钮状态:启用(有内容)/禁用(无内容)/加载中(优化进行中)

2. **AC2:** 优化功能支持两种模式:
   - **快速优化:** 轻量级优化,改善语法和流畅度(消耗 1 credit)
   - **深度优化:** 增强描述质量,添加专业术语(消耗 2 credits)
   - 用户可以在点击前选择优化模式

3. **AC3:** 优化过程提供实时反馈:
   - 显示加载动画(旋转的 Sparkles 图标)
   - 显示优化进度提示("正在优化提示词...")
   - 优化完成后显示成功提示(Toast 通知)

4. **AC4:** 优化结果支持预览和对比:
   - 优化前/优化后对比视图(并排显示)
   - 高亮显示变更的部分(绿色背景)
   - 支持"接受优化"或"保持原样"操作

5. **AC5:** 优化功能集成内容安全检查:
   - 优化后的提示词需要通过内容安全检查(复用 Story 4.1 逻辑)
   - 如果优化结果不安全,显示警告并保持原样
   - 提供重新优化选项

6. **AC6:** 优化功能支持多语言:
   - 支持中文提示词优化(输出中文)
   - 支持英文提示词优化(输出英文)
   - 自动检测输入语言并匹配优化语言

7. **AC7:** 优化功能提供可配置的优化选项:
   - 优化目标选项:"更详细"、"更简洁"、"更专业"、"更有创意"
   - 优化强度选项:"轻度"、"中度"、"重度"
   - 用户偏好保存到本地(localStorage)

8. **AC8:** 优化功能遵循 UX 设计规范:
   - 使用 Glassmorphism 对话框样式(优化结果预览)
   - 使用 Lucide 图标(Sparkles, Wand2, Check, X)
   - 支持 300ms 平滑动画过渡

## Tasks / Subtasks

- [x] **Task 1: 创建优化功能数据结构和类型定义** (AC: 1, 2, 7)
  - [x] 1.1 定义 `PromptOptimizationOptions` 接口(模式、目标、强度)
  - [x] 1.2 定义 `PromptOptimizationResult` 接口(优化前后、变更高亮)
  - [x] 1.3 定义 `OptimizationPreset` 配置(快速/深度优化的参数)
  - [x] 1.4 创建优化选项的常量配置(OPTIMIZATION_MODES, OPTIMIZATION_TARGETS)

- [x] **Task 2: 实现优化 API 客户端** (AC: 2, 6)
  - [x] 2.1 创建 `src/lib/ai/optimize-prompt.ts` API 函数
  - [x] 2.2 实现语言自动检测逻辑(中文/英文)
  - [x] 2.3 实现优化提示词构建逻辑(根据模式和目标)
  - [x] 2.4 集成 Replicate API 调用(使用文字模型)
  - [x] 2.5 实现 credit 消费逻辑(1 或 2 credits)

- [x] **Task 3: 实现 OptimzeButton 组件** (AC: 1, 3)
  - [x] 3.1 创建 `OptimizeButton` 主组件
  - [x] 3.2 实现按钮状态逻辑(启用/禁用/加载中)
  - [x] 3.3 集成 Lucide Sparkles 图标
  - [x] 3.4 实现加载动画(旋转动画)
  - [x] 3.5 实现优化模式选择对话框

- [x] **Task 4: 实现优化结果预览对话框** (AC: 4, 8)
  - [x] 4.1 创建 `OptimizationPreviewDialog` 组件
  - [x] 4.2 实现优化前/后对比视图
  - [x] 4.3 实现变更高亮显示(绿色背景)
  - [x] 4.4 实现"接受优化"和"保持原样"按钮
  - [x] 4.5 应用 Glassmorphism 样式

- [x] **Task 5: 集成内容安全检查** (AC: 5)
  - [x] 5.1 调用 Story 4.1 的内容安全检查逻辑 (占位符实现)
  - [x] 5.2 实现优化结果验证流程
  - [x] 5.3 实现不安全内容的警告提示
  - [x] 5.4 提供重新优化选项

- [x] **Task 6: 实现优化选项配置** (AC: 7)
  - [x] 6.1 创建 `OptimizationOptionsPanel` 组件
  - [x] 6.2 实现优化目标选择(更详细/更简洁/更专业/更有创意)
  - [x] 6.3 实现优化强度选择(轻度/中度/重度)
  - [x] 6.4 实现用户偏好保存(localStorage)
  - [x] 6.5 实现配置预设(快速/深度优化)

- [x] **Task 7: 集成到模版编辑器** (AC: 1)
  - [x] 7.1 在 `TemplateEditor` 组件中集成 `OptimizeButton`
  - [x] 7.2 实现优化结果应用到编辑器的逻辑
  - [ ] 7.3 实现优化历史记录(可选)
  - [x] 7.4 确保与现有按钮的布局协调

- [x] **Task 8: 实现 Toast 通知和用户反馈** (AC: 3, 5)
  - [x] 8.1 实现优化开始通知(Toast)
  - [x] 8.2 实现优化成功通知(Toast)
  - [x] 8.3 实现优化失败通知(Toast + 错误信息)
  - [x] 8.4 实现内容安全警告通知

- [x] **Task 9: 单元测试**
  - [x] 9.1 测试优化选项数据结构
  - [x] 9.2 测试语言自动检测逻辑
  - [x] 9.3 测试优化提示词构建逻辑
  - [x] 9.4 测试 credit 消费计算逻辑

- [ ] **Task 10: 集成测试**
  - [ ] 10.1 测试完整优化流程(点击按钮 → 选择模式 → 预览结果 → 接受)
  - [ ] 10.2 测试优化失败场景(API 错误、网络错误)
  - [ ] 10.3 测试内容安全检查场景
  - [ ] 10.4 测试多语言优化(中文/英文)

- [ ] **Task 11: E2E 测试**
  - [ ] 11.1 测试完整用户流程(分析 → 生成模版 → AI 优化 → 生成图片)
  - [ ] 11.2 测试快速优化和深度优化模式
  - [ ] 11.3 测试优化选项配置和保存
  - [ ] 11.4 视觉回归测试(优化对话框快照)

## Dev Notes

### 业务上下文

**Epic 5 目标:** 模版生成与管理 - 用户可以获得结构化的提示词模版,支持编辑和导出

**Story 5.4 定位:** 在 Story 5.3(模版编辑器)的基础上,提供 AI 驱动的提示词优化功能,帮助用户创建更高质量的同风格图片

**用户价值:**
- 新手用户:通过 AI 优化快速学习如何编写优质提示词
- 专业用户:节省手动优化提示词的时间,获得更专业的结果
- 所有人:通过多种优化模式和选项,获得符合需求的定制化优化

**为什么这个功能重要:**
- Story 5.3 提供了强大的编辑功能,但用户可能不知道如何优化提示词
- AI 优化可以降低学习曲线,让新手用户也能创建高质量提示词
- 专业的提示词优化可以显著提升生成图片的质量
- 多种优化模式可以满足不同用户的需求

### 相关功能需求(FR)

- **FR25:** 系统可以调用文字模型提供商优化提示词
- **FR19:** 系统可以根据风格特征生成可编辑的变量模版(前置依赖)
- **FR22:** 用户可以编辑生成的模版内容(前置依赖)

### 架构约束

**技术栈:**
- 前端框架:Next.js 15+ (App Router)
- 状态管理:Zustand(UI 状态) + React Query(服务器状态)
- UI 组件:MUI + Tailwind CSS(Glassmorphism 样式)
- 图标库:Lucide React(必须使用 Sparkles, Wand2, Check, X)
- 类型检查:TypeScript
- API 集成:Replicate API(文字模型)

**命名规范:**
- 组件:PascalCase(`OptimizeButton`, `OptimizationPreviewDialog`, `OptimizationOptionsPanel`)
- 函数/变量:camelCase(`optimizePrompt`, `detectLanguage`, `buildOptimizationPrompt`)
- 类型/接口:PascalCase(`PromptOptimizationOptions`, `PromptOptimizationResult`)
- 常量:UPPER_SNAKE_CASE(`OPTIMIZATION_MODES`, `OPTIMIZATION_TARGETS`)
- 文件名:kebab-case(`optimize-button.tsx`, `optimize-prompt.ts`)

**项目结构:**
```
src/features/templates/
├── components/
│   ├── OptimizeButton/
│   │   ├── index.tsx
│   │   ├── OptimizeButton.tsx  # 主按钮组件
│   │   ├── OptimizationOptionsPanel.tsx  # 选项配置面板
│   │   └── types.ts
│   ├── OptimizationPreviewDialog/
│   │   ├── index.tsx
│   │   ├── OptimizationPreviewDialog.tsx  # 预览对话框
│   │   ├── ComparisonView.tsx  # 对比视图
│   │   └── DiffHighlight.tsx  # 变更高亮
│   └── TemplateEditor/  # 已存在,需要集成
├── lib/
│   ├── optimize-prompt.ts  # API 客户端
│   ├── language-detector.ts  # 语言检测
│   └── optimization-presets.ts  # 优化预设配置
└── types/
    ├── optimization.ts  # 优化功能类型定义
    └── template.ts  # 已存在
```

### 数据结构设计

**PromptOptimizationOptions 接口:**
```typescript
interface PromptOptimizationOptions {
  mode: 'quick' | 'deep';  // 快速优化(1 credit) / 深度优化(2 credits)
  target: 'detailed' | 'concise' | 'professional' | 'creative';  // 优化目标
  intensity: 'light' | 'medium' | 'heavy';  // 优化强度
  language: 'zh' | 'en' | 'auto';  // 语言(auto = 自动检测)
}
```

**PromptOptimizationResult 接口:**
```typescript
interface PromptOptimizationResult {
  original: string;  // 原始提示词
  optimized: string;  // 优化后的提示词
  diff: Array<{  // 变更高亮数据
    type: 'added' | 'removed' | 'unchanged';
    text: string;
  }>;
  language: 'zh' | 'en';  // 检测到的语言
  mode: 'quick' | 'deep';  // 使用的优化模式
  creditsConsumed: number;  // 消耗的 credits
}
```

**OptimizationPreset 接口:**
```typescript
interface OptimizationPreset {
  mode: 'quick' | 'deep';
  target: 'detailed' | 'concise' | 'professional' | 'creative';
  intensity: 'light' | 'medium' | 'heavy';
  systemPrompt: string;  // 发送给 LLM 的系统提示词
  creditsCost: number;  // credit 消耗
}
```

### API 集成设计

**优化提示词 API:**
```typescript
// src/lib/ai/optimize-prompt.ts
import { replicate } from './replicate-client';

export async function optimizePrompt(
  template: Template,
  options: PromptOptimizationOptions
): Promise<PromptOptimizationResult> {
  // 1. 检测语言
  const language = options.language === 'auto'
    ? detectLanguage(template)
    : options.language;

  // 2. 构建完整的提示词
  const fullPrompt = buildFullPrompt(template);

  // 3. 获取优化预设
  const preset = getOptimizationPreset(options, language);

  // 4. 调用 Replicate API
  const response = await replicate.run(preset.model, {
    prompt: preset.systemPrompt,
    input: fullPrompt,
  });

  // 5. 解析优化结果
  const optimized = parseOptimizationResult(response);

  // 6. 生成变更高亮
  const diff = generateDiff(fullPrompt, optimized);

  return {
    original: fullPrompt,
    optimized,
    diff,
    language,
    mode: options.mode,
    creditsConsumed: preset.creditsCost,
  };
}
```

**语言检测逻辑:**
```typescript
// src/lib/ai/language-detector.ts
export function detectLanguage(template: Template): 'zh' | 'en' {
  const text = Object.values(template).join(' ');

  // 简单的字符集检测
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
  const englishChars = text.match(/[a-zA-Z]/g);

  if (chineseChars && chineseChars.length > (englishChars?.length || 0)) {
    return 'zh';
  }
  return 'en';
}
```

**优化预设配置:**
```typescript
// src/lib/ai/optimization-presets.ts
export const OPTIMIZATION_PRESETS: Record<PromptOptimizationOptions['mode'], OptimizationPreset> = {
  quick: {
    mode: 'quick',
    target: 'professional',
    intensity: 'light',
    systemPrompt: '你是一个专业的提示词优化助手。请改善以下提示词的语法和流畅度,保持原意不变。',
    creditsCost: 1,
  },
  deep: {
    mode: 'deep',
    target: 'professional',
    intensity: 'medium',
    systemPrompt: '你是一个专业的提示词优化助手。请优化以下提示词,添加专业术语,增强描述质量,使其更适合生成高质量图片。',
    creditsCost: 2,
  },
};
```

### UI/UX 设计规范

**Glassmorphism 样式:**
- 优化按钮使用 `ia-glass-card` 类
- 选项配置面板使用 `ia-glass-card` 类
- 预览对话框使用 `ia-glass-card` 类(更深背景)

**图标系统:**
- 优化图标:`<Sparkles size={16} className="text-green-500" />`
- 魔棒图标:`<Wand2 size={16} className="text-purple-500" />`
- 接受图标:`<Check size={16} className="text-green-500" />`
- 取消图标:`<X size={16} className="text-red-500" />`

**按钮状态:**
- 启用状态:绿色背景,Sparkles 图标
- 禁用状态:灰色背景,不可点击
- 加载状态:旋转的 Sparkles 图标,显示"优化中..."

**布局结构:**
```
┌─────────────────────────────────────────────────────────┐
│  模版编辑器                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │ 字段编辑区域   │  │ 实时预览区域   │  │ 操作按钮    │ │
│  │               │  │               │  │ [复制]      │ │
│  │ ...           │  │ ...           │  │ [导出]      │ │
│  │               │  │               │  │ [AI 优化]   │ │ ← 新增
│  └───────────────┘  └───────────────┘  │ [保存到库]  │ │
│                                          └─────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  优化选项配置                                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 优化模式:  ○ 快速优化 (1 credit)  ● 深度优化 (2)  │  │
│  │ 优化目标:  ● 更详细  ○ 更简洁  ○ 更专业  ○ 有创意│  │
│  │ 优化强度:  ○ 轻度  ● 中度  ○ 重度               │  │
│  │                                    [开始优化]      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  优化结果预览                              [X]           │
│  ┌───────────────┐  ┌───────────────┐                 │
│  │ 原始提示词     │  │ 优化后提示词   │                 │
│  │ ┌───────────┐ │  │ ┌───────────┐ │                 │
│  │ │一位美女   │ │  │ │一位优雅的  │ │                 │
│  │ │肖像,     │ │  │ │女性肖像,  │ │                 │
│  │ │居中构图  │ │  │ │居中构图,  │ │                 │
│  │ └───────────┘ │  │ │黄金时刻照明│ │                 │
│  └───────────────┘  │ └───────────┘ │                 │
│  ┌───────────────────────────────────────────────────┐ │
│  │         [保持原样]  [接受优化]                    │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**动画和过渡:**
- 对话框打开/关闭:300ms 平滑过渡
- 按钮加载动画:旋转的 Sparkles 图标
- 变更高亮:绿色背景淡入效果

**响应式设计:**
- 桌面端(≥ 1024px):并排对比视图
- 平板端(768-1024px):上下对比视图
- 移动端(< 768px):标签切换对比视图

### 性能要求

- 优化 API 响应时间:< 10 秒(快速优化),< 20 秒(深度优化)
- 语言检测延迟:< 100ms
- UI 响应延迟:< 50ms(按钮点击,对话框打开)
- 变更高亮计算:< 500ms

### 安全考虑

- **内容安全:** 优化后的提示词需要通过内容安全检查(复用 Story 4.1)
- **用户权限:** 用户只能优化自己创建的模版
- **Credit 验证:** 优化前验证用户是否有足够的 credits
- **API 安全:** Replicate API 调用需要通过后端代理,不暴露 API key

- **提示词注入防护:** 优化系统提示词需要固定,防止用户注入恶意指令

### 依赖关系

**前置依赖:**
- ✅ Story 5.1: 模版生成(已完成 `Template` 接口和字段定义)
- ✅ Story 5.2: JSON 导出(已完成导出功能)
- ✅ Story 5.3: 模版编辑器(已完成编辑器组件和状态管理)
- ✅ Story 4.1: 内容审核(已完成内容安全检查逻辑)
- ✅ Story 3.4: 视觉模型集成(已完成 Replicate API 集成)
- ✅ UX-UPGRADE-1: UX 设计规范升级(Glassmorphism + Lucide 图标)

**后置依赖:**
- 🟡 Epic 6: AI 图片生成(使用优化后的提示词生成图片)
- 🟡 Epic 8: 订阅与支付系统(credit 消费和计费)

### Credit 消费规则

- **快速优化:** 消耗 1 credit(轻量级优化,改善语法和流畅度)
- **深度优化:** 消耗 2 credits(增强描述质量,添加专业术语)
- **优化失败:** 如果 API 调用失败或内容不安全,不消耗 credit
- **Practice Mode:** 新用户首次使用可获得练习 credit(不消耗正式额度)

### 风险和缓解措施

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|-------|------|---------|
| API 调用失败率高 | 🟡 中 | 🟡 中 | 实现重试机制,提供友好的错误提示 |
| 优化质量不稳定 | 🟡 中 | 🟡 中 | 提供预览和对比功能,用户可选择接受或拒绝 |
| Credit 消费争议 | 🟢 低 | 🟡 中 | 优化前显示 credit 消耗,优化失败不扣费 |
| 语言检测不准确 | 🟢 低 | 🟢 低 | 提供手动语言选择选项 |
| 提示词注入攻击 | 🟢 低 | 🔴 高 | 固定系统提示词,验证用户输入 |

### 验收测试检查清单

**功能测试:**
- [ ] 优化按钮显示正确(所有状态)
- [ ] 优化模式选择功能正常
- [ ] 优化选项配置功能正常
- [ ] 快速优化功能正常(1 credit)
- [ ] 深度优化功能正常(2 credits)
- [ ] 语言自动检测功能正常
- [ ] 优化结果预览功能正常
- [ ] 变更高亮显示正常
- [ ] 接受/保持原样功能正常
- [ ] 内容安全检查功能正常

**视觉测试:**
- [ ] Glassmorphism 样式应用正确
- [ ] Lucide 图标显示正确(所有图标)
- [ ] 加载动画流畅(旋转的 Sparkles)
- [ ] 对话框动画流畅(300ms)
- [ ] 响应式布局正确(桌面/平板/移动)

**兼容性测试:**
- [ ] Chrome 优化功能测试通过
- [ ] Safari 优化功能测试通过
- [ ] Firefox 优化功能测试通过
- [ ] 移动端优化功能测试通过

**性能测试:**
- [ ] 快速优化响应时间 < 10 秒
- [ ] 深度优化响应时间 < 20 秒
- [ ] 语言检测延迟 < 100ms
- [ ] UI 响应延迟 < 50ms

**安全测试:**
- [ ] 内容安全检查正确拦截不当内容
- [ ] 用户只能优化自己的模版
- [ ] Credit 验证正常工作
- [ ] API 调用通过后端代理
- [ ] 提示词注入防护正常工作

**用户体验测试:**
- [ ] 优化流程流畅(点击 → 选择 → 预览 → 接受)
- [ ] 错误情况有友好提示
- [ ] 移动端体验良好
- [ ] Credit 消费提示清晰

### Previous Story Intelligence

从 Story 5.1(模版生成)、5.2(JSON 导出)和 5.3(模版编辑器)学到的经验:

1. **模版数据结构:** Story 5.1 已经定义了 `Template` 接口和 6 个核心字段,可以直接用于优化
2. **UI 组件模式:** 参考 `CopyButton` 和 `ExportButton` 的实现,保持一致的代码风格
3. **Glassmorphism 样式:** Story 5.1 和 5.3 已经广泛应用了 `ia-glass-card` 样式,可以复用
4. **Lucide 图标系统:** 项目已经建立了 Lucide 图标系统,需要使用 Sparkles, Wand2, Check, X 等图标
5. **Zustand 状态管理:** Story 5.3 创建了 `useTemplateEditorStore`,可以扩展用于优化功能
6. **Replicate API 集成:** Story 3.4 已经完成了 Replicate API 集成,可以复用客户端代码

**需要注意的变更:**
- 优化功能需要调用文字模型(不同于视觉模型和生图模型)
- 优化功能需要消耗 credits(需要集成计费逻辑)
- 优化功能需要提供预览和对比(不同于直接应用)
- 优化功能需要内容安全检查(复用 Story 4.1 逻辑)

### Git Intelligence

最近的提交记录显示:
- `ace3833`: 修复了 Aliyun 图片上传的 base64 编码问题
- `94c1ab0`: 为 Paper 组件应用了 Glassmorphism 背景
- `dbeeb63`: 默认展开分析详情和质量信息

**相关代码模式:**
- Glassmorphism 样式已经在项目中广泛应用(`ia-glass-card`)
- Lucide 图标系统已经建立(参考 `Copy`, `Download` 图标的使用)
- Zustand store 模式已经在项目中使用(参考 `useTemplateEditorStore`)
- Toast 反馈机制已经存在(复用现有实现)
- Replicate API 客户端已经存在(参考 Story 3.4 的实现)

### Project Context Reference

**项目位置:** `/Users/muchao/code/image_analyzer`

**相关文档:**
- PRD: `/Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/prd.md`
- Architecture: `/Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/architecture.md`
- UX Design: `/Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/ux-design-specification.md`
- Story 5.1: `/Users/muchao/code/image_analyzer/_bmad-output/implementation-artifacts/story-5-1-template-generation.md`
- Story 5.2: `/Users/muchao/code/image_analyzer/_bmad-output/implementation-artifacts/story-5-2-json-export.md`
- Story 5.3: `/Users/muchao/code/image_analyzer/_bmad-output/implementation-artifacts/story-5-3-template-editor.md`

**关键依赖:**
- Story 5.3: 模版编辑器(`src/features/templates/components/TemplateEditor/`)
- Story 4.1: 内容审核逻辑(`src/lib/content-moderation.ts`)
- Story 3.4: Replicate API 客户端(`src/lib/ai/replicate-client.ts`)
- UX-UPGRADE-1: Glassmorphism 样式(`src/app/globals.css`)

## Dev Agent Record

### Agent Model Used

_Claude Sonnet 4.6 (claude-sonnet-4-6)_

### Debug Log References

_待开发时填写_

### Completion Notes List

_待开发时填写_

### File List

**组件文件 (Components):**
- `/src/features/templates/components/OptimizeButton/OptimizeButton.tsx` - 优化按钮主组件
- `/src/features/templates/components/OptimizeButton/OptimizationOptionsPanel.tsx` - 优化选项配置面板
- `/src/features/templates/components/OptimizeButton/index.ts` - 导出
- `/src/features/templates/components/OptimizationPreviewDialog/OptimizationPreviewDialog.tsx` - 优化结果预览对话框
- `/src/features/templates/components/OptimizationPreviewDialog/index.ts` - 导出
- `/src/features/templates/components/TemplateEditor/TemplateEditor.tsx` - 集成优化功能的模版编辑器

**库文件 (Library):**
- `/src/features/templates/lib/optimize-prompt.ts` - 优化 API 客户端 (含内容安全检查占位符)
- `/src/features/templates/lib/language-detector.ts` - 语言检测
- `/src/features/templates/lib/diff-generator.ts` - Diff 生成
- `/src/features/templates/lib/optimization-presets.ts` - 优化预设配置
- `/src/features/templates/lib/optimization-constants.ts` - 优化常量和 localStorage 工具

**类型定义 (Types):**
- `/src/features/templates/types/optimization.ts` - 优化功能类型定义

**Hooks:**
- `/src/features/templates/hooks/useToast.ts` - Toast 通知 Hook (占位符实现)

**测试文件 (Tests):**
- `/src/features/templates/lib/language-detector.test.ts` - 语言检测测试
- `/src/features/templates/lib/diff-generator.test.ts` - Diff 生成测试
- `/src/features/templates/lib/optimization-constants.test.ts` - 常量和偏好测试

**总计:** 16 个文件 (9 个实现文件 + 3 个测试文件 + 4 个导出/配置文件)
