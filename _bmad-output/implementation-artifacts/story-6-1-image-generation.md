# Story 6.1: image-generation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 创作者
I want 基于分析生成的提示词模版直接创建同风格的新图片
so that 我可以快速生成大量符合特定风格的原创图片,节省手动编写提示词的时间

## Acceptance Criteria

1. **AC1:** 系统在模版编辑器中提供"生成图片"按钮:
   - 按钮位置:编辑器操作按钮区域(与复制、导出、优化按钮并列)
   - 按钮样式:使用 Lucide ImageIcon 或 Wand2 图标,紫色主题色
   - 按钮状态:启用(有有效模版)/禁用(无内容)/加载中(生成进行中)

2. **AC2:** 生成功能支持用户选择生图模型提供商:
   - 下拉选择器显示可用的生图模型提供商(从 Replicate API 获取)
   - 显示提供商名称和模型版本
   - 显示预计 credit 消耗和生成时间
   - 用户可以选择默认提供商(保存到 localStorage)

3. **AC3:** 生成过程提供实时进度反馈:
   - 显示加载动画(旋转的图标)
   - 显示生成阶段("正在初始化模型...", "正在生成图片...", "正在处理结果...")
   - 显示预计剩余时间(基于模型平均生成时间)
   - 生成完成后显示成功提示(Toast 通知)

4. **AC4:** 生成结果支持预览和操作:
   - 显示生成的图片(支持缩放查看)
   - 提供"重新生成"按钮(使用相同模版)
   - 提供"保存到本地"按钮(下载图片)
   - 提供"分享到社交媒体"按钮(集成 X/Twitter 分享)
   - 显示图片元数据(使用的模型、生成时间、分辨率)

5. **AC5:** 生成功能集成内容安全检查:
   - 生成前检查模版内容安全性(复用 Story 4.1 逻辑)
   - 如果模版不安全,显示警告并阻止生成
   - 生成后检查图片内容安全性(使用视觉模型)
   - 如果生成图片不安全,删除图片并警告用户,不消耗 credit

6. **AC6:** 生成功能支持用户订阅等级差异:
   - Free 用户:标准分辨率(512x512 或 768x768)
   - Lite 用户:标准分辨率(768x768 或 1024x1024)
   - Standard 用户:高分辨率(1024x1024 或 1536x1536) [FR82]
   - 在模型选择器中显示当前用户的分辨率选项

7. **AC7:** 生成功能支持批量生成:
   - 用户可以选择生成数量(1-4 张)
   - 显示批量生成的整体进度
   - 每张图片独立消耗 credit
   - 所有图片生成完成后提供批量下载

8. **AC8:** 生成功能遵循 UX 设计规范:
   - 使用 Glassmorphism 对话框样式(生成结果预览)
   - 使用 Lucide 图标(ImageIcon, Wand2, Download, Share2, RefreshCw)
   - 支持 300ms 平滑动画过渡
   - 响应式设计支持桌面端和移动端

## Tasks / Subtasks

- [x] **Task 1: 创建生成功能数据结构和类型定义** (AC: 1, 2, 6, 7)
  - [x] 1.1 定义 `ImageGenerationOptions` 接口(模型提供商、分辨率、数量)
  - [x] 1.2 定义 `ImageGenerationResult` 接口(图片 URL、元数据、credit 消耗)
  - [x] 1.3 定义 `GenerationProvider` 接口(提供商信息、可用模型列表)
  - [x] 1.4 定义 `ResolutionConfig` 配置(按订阅等级的分辨率选项)
  - [x] 1.5 创建生成选项的常量配置(DEFAULT_RESOLUTIONS, GENERATION_LIMITS)

- [x] **Task 2: 实现生图 API 客户端** (AC: 2, 3, 6)
  - [x] 2.1 创建 `src/lib/ai/image-generation.ts` API 函数
  - [x] 2.2 实现生图模型提供商列表获取(从 Replicate API)
  - [x] 2.3 实现基于模版的提示词构建逻辑
  - [x] 2.4 集成 Replicate API 调用(使用生图模型)
  - [x] 2.5 实现 credit 消费逻辑(根据分辨率和数量)
  - [x] 2.6 实现生成进度轮询逻辑

- [x] **Task 3: 实现 GenerateButton 组件** (AC: 1, 3)
  - [x] 3.1 创建 `GenerateButton` 主组件
  - [x] 3.2 实现按钮状态逻辑(启用/禁用/加载中)
  - [x] 3.3 集成 Lucide ImageIcon 或 Wand2 图标
  - [x] 3.4 实现加载动画(旋转动画)
  - [x] 3.5 实现生成选项选择对话框(模型、分辨率、数量)

- [x] **Task 4: 实现生成结果预览对话框** (AC: 4, 8)
  - [x] 4.1 创建 `GenerationPreviewDialog` 组件
  - [x] 4.2 实现图片预览视图(支持缩放)
  - [x] 4.3 实现图片元数据显示(模型、时间、分辨率)
  - [x] 4.4 实现"重新生成"、"保存"、"分享"按钮
  - [x] 4.5 应用 Glassmorphism 样式

- [x] **Task 5: 集成内容安全检查** (AC: 5)
  - [x] 5.1 调用 Story 4.1 的内容安全检查逻辑(模版验证)
  - [x] 5.2 调用视觉模型进行生成图片内容审核
  - [x] 5.3 实现不安全内容的警告和阻止逻辑
  - [x] 5.4 实现不安全图片的删除和 credit 退款

- [x] **Task 6: 实现分辨率和订阅等级配置** (AC: 6)
  - [x] 6.1 创建 `ResolutionSelector` 组件
  - [x] 6.2 实现按订阅等级的分辨率选项逻辑
  - [x] 6.3 实现用户订阅状态检查
  - [x] 6.4 显示升级提示(当用户选择更高分辨率选项时)

- [x] **Task 7: 实现批量生成功能** (AC: 7)
  - [x] 7.1 实现批量生成逻辑(并发 API 调用)
  - [x] 7.2 实现批量进度显示(已完成/总数)
  - [x] 7.3 实现批量图片预览(网格布局)
  - [x] 7.4 实现批量下载功能(打包为 ZIP)

- [x] **Task 8: 实现图片保存和分享功能** (AC: 4)
  - [x] 8.1 实现图片保存到本地功能(下载)
  - [x] 8.2 集成 X/Twitter 分享 API
  - [x] 8.3 实现分享链接生成(包含分享追踪)
  - [x] 8.4 实现分享奖励机制(credit 奖励,占位符实现)

- [x] **Task 9: 集成到模版编辑器** (AC: 1)
  - [x] 9.1 在 `TemplateEditor` 组件中集成 `GenerateButton`
  - [x] 9.2 实现生成结果与模版的关联
  - [x] 9.3 确保与现有按钮的布局协调
  - [x] 9.4 实现生成历史记录(可选,链接到 Epic 7)

- [x] **Task 10: 实现 Toast 通知和用户反馈** (AC: 3, 5)
  - [x] 10.1 实现生成开始通知(Toast)
  - [x] 10.2 实现生成成功通知(Toast)
  - [x] 10.3 实现生成失败通知(Toast + 错误信息)
  - [x] 10.4 实现内容安全警告通知

- [x] **Task 11: 单元测试**
  - [x] 11.1 测试生成选项数据结构
  - [x] 11.2 测试分辨率配置逻辑
  - [x] 11.3 测试提示词构建逻辑
  - [x] 11.4 测试 credit 消费计算逻辑

- [x] **Task 12: 集成测试**
  - [x] 12.1 测试完整生成流程(点击按钮 → 选择选项 → 预览结果 → 保存)
  - [x] 12.2 测试生成失败场景(API 错误、网络错误)
  - [x] 12.3 测试内容安全检查场景
  - [x] 12.4 测试不同订阅等级的分辨率选项

- [x] **Task 13: E2E 测试**
  - [x] 13.1 测试完整用户流程(分析 → 生成模版 → 生成图片 → 保存)
  - [x] 13.2 测试批量生成功能
  - [x] 13.3 测试图片分享功能
  - [x] 13.4 视觉回归测试(生成对话框快照)

## Dev Notes

### 业务上下文

**Epic 6 目标:** AI 图片生成 - 用户可以使用模版直接生成同风格新图片,并分享到社交媒体

**Story 6.1 定位:** Epic 6 的第一个故事,实现核心的图片生成功能,让用户能够基于分析生成的模版创建新图片

**用户价值:**
- 创作者:快速生成大量符合特定风格的原创图片,节省时间
- 设计师:快速尝试不同风格变体,提高创作效率
- 营销人员:批量生成一致风格的品牌素材
- 所有人:通过简单的模版操作,无需专业提示词工程知识

**为什么这个功能重要:**
- 这是产品的核心价值主张之一:从分析到生成的完整闭环
- 用户上传图片分析的最终目的是生成同风格新图片
- 这是主要的 credit 消费场景,直接影响收入
- 分享功能可以带来网络效应和病毒式传播

### 相关功能需求(FR)

- **FR26:** 用户可以基于编辑后的模版直接生成同风格图片
- **FR27:** 系统可以调用至少一个生图模型提供商生成图片
- **FR28:** 用户可以手动选择生图模型提供商
- **FR29:** 用户可以查看生成的图片结果
- **FR30:** 用户可以保存生成的图片到本地设备
- **FR31:** 系统可以展示图片生成的进度状态
- **FR32:** 用户可以将生成的图片分享到 X (Twitter)
- **FR72:** 用户首次分享生成的图片到社交媒体可获得 6 credit 奖励
- **FR73:** 用户后续分享生成的图片到社交媒体每次可获得 2 credit 奖励
- **FR82:** Standard 订阅用户可以享受更高的图片生成分辨率

**前置依赖:**
- **FR19-25:** 模版生成与管理(Epic 5,已完成)
- **FR50-56:** 内容安全与合规(Epic 4,已完成)

### 架构约束

**技术栈:**
- 前端框架:Next.js 15+ (App Router)
- 状态管理:Zustand(UI 状态) + React Query(服务器状态)
- UI 组件:MUI + Tailwind CSS(Glassmorphism 样式)
- 图标库:Lucide React(必须使用 ImageIcon, Wand2, Download, Share2, RefreshCw)
- 类型检查:TypeScript
- API 集成:Replicate API(生图模型)

**命名规范:**
- 组件:PascalCase(`GenerateButton`, `GenerationPreviewDialog`, `ResolutionSelector`)
- 函数/变量:camelCase(`generateImage`, `buildGenerationPrompt`, `calculateCredits`)
- 类型/接口:PascalCase(`ImageGenerationOptions`, `ImageGenerationResult`)
- 常量:UPPER_SNAKE_CASE(`DEFAULT_RESOLUTIONS`, `GENERATION_LIMITS`)
- 文件名:kebab-case(`generate-button.tsx`, `image-generation.ts`)

**项目结构:**
```
src/features/generation/
├── components/
│   ├── GenerateButton/
│   │   ├── index.tsx
│   │   ├── GenerateButton.tsx  # 主按钮组件
│   │   ├── GenerationOptionsDialog.tsx  # 选项配置对话框
│   │   └── types.ts
│   ├── GenerationPreviewDialog/
│   │   ├── index.tsx
│   │   ├── GenerationPreviewDialog.tsx  # 预览对话框
│   │   ├── ImageView.tsx  # 图片预览
│   │   └── ImageMetadata.tsx  # 图片元数据
│   ├── ResolutionSelector/
│   │   ├── index.tsx
│   │   └── ResolutionSelector.tsx  # 分辨率选择器
│   └── BatchGeneration/
│       ├── index.tsx
│       ├── BatchGenerationView.tsx  # 批量生成视图
│       └── BatchDownload.tsx  # 批量下载
├── lib/
│   ├── image-generation.ts  # API 客户端
│   ├── generation-presets.ts  # 生成预设配置
│   ├── resolution-config.ts  # 分辨率配置
│   └── share-handler.ts  # 分享功能
└── types/
    └── generation.ts  # 生成功能类型定义
```

### 数据结构设计

**ImageGenerationOptions 接口:**
```typescript
interface ImageGenerationOptions {
  provider: string;  // 生图模型提供商(如 "stability-ai", "midjourney")
  model: string;  // 具体模型版本
  resolution: ResolutionPreset;  // 分辨率预设
  quantity: number;  // 生成数量(1-4)
  template: Template;  // 使用的模版
}
```

**ImageGenerationResult 接口:**
```typescript
interface ImageGenerationResult {
  id: string;  // 生成记录 ID
  images: GeneratedImage[];  // 生成的图片列表
  provider: string;  // 使用的提供商
  model: string;  // 使用的模型
  resolution: ResolutionPreset;  // 使用的分辨率
  templateId: string;  // 使用的模版 ID
  creditsConsumed: number;  // 消耗的 credits
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;  // 创建时间
  completedAt?: Date;  // 完成时间
}
```

**GeneratedImage 接口:**
```typescript
interface GeneratedImage {
  id: string;  // 图片 ID
  url: string;  // 图片 URL
  thumbnailUrl?: string;  // 缩略图 URL
  metadata: {
    width: number;  // 图片宽度
    height: number;  // 图片高度
    format: string;  // 图片格式(如 "png", "jpg")
    size: number;  // 文件大小(字节)
  };
  safetyCheck: {
    passed: boolean;  // 是否通过安全检查
    score?: number;  // 安全评分
    reason?: string;  // 不安全原因
  };
}
```

**ResolutionPreset 接口:**
```typescript
interface ResolutionPreset {
  name: string;  // 分辨率名称(如 "标准", "高清")
  width: number;  // 宽度
  height: number;  // 高度
  creditCost: number;  // credit 消耗
  minSubscriptionTier?: 'free' | 'lite' | 'standard';  // 最低订阅等级
}
```

### API 集成设计

**生成图片 API:**
```typescript
// src/lib/ai/image-generation.ts
import { replicate } from './replicate-client';

export async function generateImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  // 1. 内容安全检查(模版)
  await checkTemplateSafety(options.template);

  // 2. 构建生图提示词
  const prompt = buildGenerationPrompt(options.template);

  // 3. 确定分辨率
  const resolution = getResolutionForUser(
    options.resolution,
    userSubscriptionTier
  );

  // 4. 调用 Replicate API
  const response = await replicate.run(options.model, {
    prompt,
    width: resolution.width,
    height: resolution.height,
    num_outputs: options.quantity,
  });

  // 5. 轮询生成进度
  const result = await pollGenerationProgress(response.id);

  // 6. 内容安全检查(生成图片)
  const safeImages = await checkGeneratedImages(result.images);

  // 7. 保存生成记录
  const generationResult = await saveGenerationRecord({
    ...result,
    images: safeImages,
    creditsConsumed: calculateCredits(options),
  });

  return generationResult;
}
```

**生图提示词构建逻辑:**
```typescript
function buildGenerationPrompt(template: Template): string {
  // 组合模版的所有字段
  const parts = [
    template.style,
    template.lighting,
    template.composition,
    template.colorPalette,
    template.artisticStyle,
    template.additionalNotes,
  ].filter(Boolean);

  return parts.join(', ');
}
```

**分辨率配置:**
```typescript
// src/lib/ai/resolution-config.ts
export const RESOLUTION_PRESETS: Record<SubscriptionTier, ResolutionPreset[]> = {
  free: [
    {
      name: '标准 (512x512)',
      width: 512,
      height: 512,
      creditCost: 2,
      minSubscriptionTier: 'free',
    },
    {
      name: '标准 (768x768)',
      width: 768,
      height: 768,
      creditCost: 3,
      minSubscriptionTier: 'free',
    },
  ],
  lite: [
    {
      name: '标准 (768x768)',
      width: 768,
      height: 768,
      creditCost: 3,
      minSubscriptionTier: 'free',
    },
    {
      name: '高清 (1024x1024)',
      width: 1024,
      height: 1024,
      creditCost: 4,
      minSubscriptionTier: 'lite',
    },
  ],
  standard: [
    {
      name: '高清 (1024x1024)',
      width: 1024,
      height: 1024,
      creditCost: 4,
      minSubscriptionTier: 'lite',
    },
    {
      name: '超清 (1536x1536)',
      width: 1536,
      height: 1536,
      creditCost: 6,
      minSubscriptionTier: 'standard',  // FR82: Standard 专属
    },
  ],
};
```

### UI/UX 设计规范

**Glassmorphism 样式:**
- 生成按钮使用 `ia-glass-card` 类
- 选项配置对话框使用 `ia-glass-card` 类
- 预览对话框使用 `ia-glass-card` 类(更深背景)

**图标系统:**
- 生成图标:`<ImageIcon size={16} className="text-purple-500" />` 或 `<Wand2 size={16} className="text-purple-500" />`
- 下载图标:`<Download size={16} className="text-green-500" />`
- 分享图标:`<Share2 size={16} className="text-blue-500" />`
- 重新生成图标:`<RefreshCw size={16} className="text-purple-500" />`

**按钮状态:**
- 启用状态:紫色背景,ImageIcon 或 Wand2 图标
- 禁用状态:灰色背景,不可点击
- 加载状态:旋转的图标,显示"生成中..."

**布局结构:**
```
┌─────────────────────────────────────────────────────────┐
│  模版编辑器                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │ 字段编辑区域   │  │ 实时预览区域   │  │ 操作按钮    │ │
│  │               │  │               │  │ [复制]      │ │
│  │ ...           │  │ ...           │  │ [导出]      │ │
│  │               │  │               │  │ [AI 优化]   │ │
│  └───────────────┘  └───────────────┘  │ [生成图片]  │ │ ← 新增
│                                          └─────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  生成选项配置                                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 模型提供商: [Stability AI ▼]                     │  │
│  │ 分辨率:     ○ 标准 (512x512, 2 credits)         │  │
│  │             ● 高清 (1024x1024, 4 credits)        │  │
│  │             ○ 超清 (1536x1536, 6 credits) ⭐      │  │
│  │ 生成数量:   ● 1 张  ○ 2 张  ○ 3 张  ○ 4 张      │  │
│  │                                    [开始生成]      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  生成结果预览                              [X]           │
│  ┌───────────────┐  ┌───────────────┐                 │
│  │               │  │               │                 │
│  │   生成的图片   │  │   生成的图片   │                 │
│  │               │  │   (缩放查看)   │                 │
│  │               │  │               │                 │
│  └───────────────┘  └───────────────┘                 │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 模型: Stable Diffusion XL | 分辨率: 1024x1024    │ │
│  │ 生成时间: 12.5 秒              Credit: 4          │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │    [重新生成]  [保存到本地]  [分享到 Twitter]    │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**动画和过渡:**
- 对话框打开/关闭:300ms 平滑过渡
- 按钮加载动画:旋转的图标
- 图片加载动画:淡入效果
- 生成进度动画:平滑的进度条

**响应式设计:**
- 桌面端(≥ 1024px):网格布局显示多张图片
- 平板端(768-1024px):单列布局
- 移动端(< 768px):单列布局,全屏预览

### 性能要求

- 生成 API 响应时间:< 30 秒(标准分辨率),< 60 秒(高分辨率)
- 进度轮询频率:每 2 秒一次
- UI 响应延迟:< 50ms(按钮点击,对话框打开)
- 图片加载延迟:< 3 秒(缩略图),< 5 秒(完整图片)

### 安全考虑

- **内容安全:** 生成前检查模版内容(复用 Story 4.1),生成后检查图片内容
- **用户权限:** 用户只能生成基于自己模版的图片
- **Credit 验证:** 生成前验证用户是否有足够的 credits
- **API 安全:** Replicate API 调用需要通过后端代理,不暴露 API key
- **图片存储:** 生成的图片存储到 Cloudflare R2,设置合适的过期时间

### 依赖关系

**前置依赖:**
- ✅ Story 5.1: 模版生成(已完成 `Template` 接口和字段定义)
- ✅ Story 5.2: JSON 导出(已完成模版数据结构)
- ✅ Story 5.3: 模版编辑器(已完成编辑器组件)
- ✅ Story 5.4: 提示词优化(已完成优化功能,可选)
- ✅ Story 4.1: 内容审核(已完成内容安全检查逻辑)
- ✅ Story 3.4: 视觉模型集成(已完成 Replicate API 集成)
- ✅ UX-UPGRADE-1: UX 设计规范升级(Glassmorphism + Lucide 图标)

**后置依赖:**
- 🟡 Story 6.2: 生成进度显示(可能需要扩展进度反馈)
- 🟡 Story 6.3: 图片保存(扩展保存功能)
- 🟡 Story 6.4: 社交分享(扩展分享功能)
- 🟡 Story 6.5: 分享奖励(实现奖励机制)
- 🟡 Epic 7: 模版库与历史记录(生成历史记录)
- 🟡 Epic 8: 订阅与支付系统(credit 消费和计费)

### Credit 消费规则

- **标准分辨率 (512x512):** 消耗 2 credits
- **标准分辨率 (768x768):** 消耗 3 credits
- **高分辨率 (1024x1024):** 消耗 4 credits
- **超分辨率 (1536x1536):** 消耗 6 credits(Standard 专属,FR82)
- **批量生成:** 每张图片独立消耗 credit
- **生成失败:** 如果 API 调用失败或内容不安全,不消耗 credit
- **Practice Mode:** 新用户首次使用可获得练习 credit(不消耗正式额度)

### 风险和缓解措施

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|-------|------|---------|
| API 调用失败率高 | 🟡 中 | 🟡 中 | 实现重试机制,提供友好的错误提示 |
| 生成质量不稳定 | 🟡 中 | 🔴 高 | 提供重新生成选项,支持用户调整提示词 |
| 生成时间过长 | 🟡 中 | 🟡 中 | 显示实时进度,提供预计完成时间 |
| Credit 消费争议 | 🟢 低 | 🟡 中 | 生成前显示 credit 消耗,生成失败不扣费 |
| 内容安全误判 | 🟢 低 | 🟡 中 | 提供申诉机制,人工审核 |
| 生成成本过高 | 🟡 中 | 🔴 高 | 实施配额限制,优化提示词长度 |
| 存储成本过高 | 🟢 低 | 🟡 中 | 按订阅等级设置图片保留期限 |

### 验收测试检查清单

**功能测试:**
- [ ] 生成按钮显示正确(所有状态)
- [ ] 模型选择器功能正常
- [ ] 分辨率选择器功能正常(按订阅等级)
- [ ] 批量生成功能正常(1-4 张)
- [ ] 生成进度显示正常
- [ ] 生成结果预览功能正常
- [ ] 图片保存功能正常
- [ ] 图片分享功能正常
- [ ] 重新生成功能正常
- [ ] 内容安全检查功能正常

**视觉测试:**
- [ ] Glassmorphism 样式应用正确
- [ ] Lucide 图标显示正确(所有图标)
- [ ] 加载动画流畅(旋转的图标)
- [ ] 对话框动画流畅(300ms)
- [ ] 响应式布局正确(桌面/平板/移动)

**兼容性测试:**
- [ ] Chrome 生成功能测试通过
- [ ] Safari 生成功能测试通过
- [ ] Firefox 生成功能测试通过
- [ ] 移动端生成功能测试通过

**性能测试:**
- [ ] 标准分辨率生成时间 < 30 秒
- [ ] 高分辨率生成时间 < 60 秒
- [ ] 进度轮询频率正常(每 2 秒)
- [ ] UI 响应延迟 < 50ms

**安全测试:**
- [ ] 内容安全检查正确拦截不当内容
- [ ] 用户只能生成基于自己模版的图片
- [ ] Credit 验证正常工作
- [ ] API 调用通过后端代理
- [ ] 图片存储安全(R2 私有 bucket)

**用户体验测试:**
- [ ] 生成流程流畅(点击 → 选择 → 预览 → 保存)
- [ ] 错误情况有友好提示
- [ ] 移动端体验良好
- [ ] Credit 消费提示清晰

### Previous Story Intelligence

从 Epic 5(模版生成与管理)学到的经验:

1. **模版数据结构:** Story 5.1 已经定义了完整的 `Template` 接口,可以直接用于构建生图提示词
2. **UI 组件模式:** 参考 `CopyButton`、`ExportButton` 和 `OptimizeButton` 的实现,保持一致的代码风格
3. **Glassmorphism 样式:** Epic 5 已经广泛应用了 `ia-glass-card` 样式,可以复用
4. **Lucide 图标系统:** 项目已经建立了 Lucide 图标系统,需要使用 ImageIcon, Wand2, Download, Share2 等
5. **Zustand 状态管理:** Story 5.3 创建了 `useTemplateEditorStore`,可以扩展用于生成功能
6. **Replicate API 集成:** Story 3.4 已经完成了 Replicate API 集成,可以复用客户端代码和轮询逻辑

从 Epic 4(内容安全与合规)学到的经验:

1. **内容安全检查:** Story 4.1 已经实现了内容审核逻辑,需要在生成前后都进行检查
2. **安全评分机制:** 复用安全评分和阈值配置

从 Epic 3(AI 风格分析)学到的经验:

1. **进度轮询:** Story 3.1 实现了分析进度轮询,可以复用类似机制用于生成进度
2. **实时反馈:** Story 3.1 实现了实时进度显示,可以参考类似实现

**需要注意的变更:**
- 生图模型不同于视觉模型和文字模型,需要新的 API 集成
- 生成功能需要处理多个输出(批量生成)
- 生成功能需要更长的等待时间,需要更好的进度反馈
- 生成功能需要更高的 credit 消耗,需要明确的用户确认

### Git Intelligence

最近的提交记录显示:
- `c320118`: 更新 Epic 5 故事状态为完成
- `7848495`: 完成 story 5.4 提示词优化功能
- `acaf0f5`: 完成 story 5.3 模版编辑器
- `7b62248`: 完成 story 5.2 JSON 导出功能
- `11129ae`: 完成 story 5.1 模版生成功能

**相关代码模式:**
- Glassmorphism 样式已经在项目中广泛应用(`ia-glass-card`)
- Lucide 图标系统已经建立(参考 `Copy`, `Download`, `Sparkles` 图标的使用)
- Zustand store 模式已经在项目中使用(参考 `useTemplateEditorStore`)
- Toast 反馈机制已经存在(复用现有实现)
- Replicate API 客户端已经存在(参考 Story 3.4 的实现)
- 进度轮询机制已经存在(参考 Story 3.1 的实现)

### Project Context Reference

**项目位置:** `/Users/muchao/code/image_analyzer`

**相关文档:**
- PRD: `/Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/prd.md`
- Architecture: `/Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/architecture.md`
- UX Design: `/Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/ux-design-specification.md`
- Epics: `/Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/epics.md`
- Story 5.1: `/Users/muchao/code/image_analyzer/_bmad-output/implementation-artifacts/story-5-1-template-generation.md`
- Story 5.2: `/Users/muchao/code/image_analyzer/_bmad-output/implementation-artifacts/story-5-2-json-export.md`
- Story 5.3: `/Users/muchao/code/image_analyzer/_bmad-output/implementation-artifacts/story-5-3-template-editor.md`
- Story 5.4: `/Users/muchao/code/image_analyzer/_bmad-output/implementation-artifacts/story-5-4-prompt-optimization.md`
- Story 4.1: `/Users/muchao/code/image_analyzer/_bmad-output/implementation-artifacts/story-4-1-content-moderation.md`
- Story 3.4: `/Users/muchao/code/image_analyzer/_bmad-output/implementation-artifacts/story-3-4-vision-model-integration.md`

**关键依赖:**
- Story 5.3: 模版编辑器(`src/features/templates/components/TemplateEditor/`)
- Story 4.1: 内容审核逻辑(`src/lib/content-moderation.ts`)
- Story 3.4: Replicate API 客户端(`src/lib/ai/replicate-client.ts`)
- Story 3.1: 进度轮询逻辑(`src/features/analysis/lib/polling.ts`)
- UX-UPGRADE-1: Glassmorphism 样式(`src/app/globals.css`)

**数据库表 (在 Story 6.1 创建):**
- `generations` 表:AI 生成图片记录
  - `id`: 主键
  - `user_id`: 用户 ID(外键到 users 表)
  - `template_id`: 使用的模版 ID(外键到 templates 表)
  - `provider`: 生图模型提供商
  - `model`: 具体模型版本
  - `resolution`: 分辨率(JSON 格式)
  - `quantity`: 生成数量
  - `status`: 状态(pending, processing, completed, failed)
  - `credits_consumed`: 消耗的 credits
  - `created_at`: 创建时间
  - `completed_at`: 完成时间

**下一步工作:**
- Story 6.2: 生成进度显示(扩展进度反馈)
- Story 6.3: 图片保存(扩展保存功能)
- Story 6.4: 社交分享(扩展分享功能)
- Story 6.5: 分享奖励(实现奖励机制)

## Dev Agent Record

### Agent Model Used

_Claude Sonnet 4.6 (claude-sonnet-4-6)_

### Debug Log References

_待开发时填写_

### Completion Notes List

_待开发时填写_

### File List

**组件文件 (Components):**
- `/src/features/generation/components/GenerateButton/GenerateButton.tsx` - 生成按钮主组件
- `/src/features/generation/components/GenerateButton/GenerationOptionsDialog.tsx` - 生成选项配置对话框
- `/src/features/generation/components/GenerateButton/index.ts` - 导出
- `/src/features/generation/components/GenerationPreviewDialog/GenerationPreviewDialog.tsx` - 生成结果预览对话框
- `/src/features/generation/components/GenerationPreviewDialog/ImageView.tsx` - 图片预览组件
- `/src/features/generation/components/GenerationPreviewDialog/ImageMetadata.tsx` - 图片元数据组件
- `/src/features/generation/components/GenerationPreviewDialog/index.ts` - 导出
- `/src/features/generation/components/ResolutionSelector/ResolutionSelector.tsx` - 分辨率选择器
- `/src/features/generation/components/ResolutionSelector/index.ts` - 导出
- `/src/features/generation/components/BatchGeneration/BatchGenerationView.tsx` - 批量生成视图
- `/src/features/generation/components/BatchGeneration/BatchDownload.tsx` - 批量下载功能
- `/src/features/generation/components/BatchGeneration/index.ts` - 导出

**库文件 (Library):**
- `/src/features/generation/lib/image-generation.ts` - 生图 API 客户端
- `/src/features/generation/lib/generation-presets.ts` - 生成预设配置
- `/src/features/generation/lib/resolution-config.ts` - 分辨率配置
- `/src/features/generation/lib/share-handler.ts` - 分享功能处理
- `/src/features/generation/lib/prompt-builder.ts` - 提示词构建逻辑
- `/src/features/generation/lib/progress-poller.ts` - 生成进度轮询

**类型定义 (Types):**
- `/src/features/generation/types/generation.ts` - 生成功能类型定义

**数据库 (Database):**
- `/src/db/schema/generations.ts` - generations 表 Schema 定义

**Hooks:**
- `/src/features/generation/hooks/useGeneration.ts` - 生成功能 Hook
- `/src/features/generation/hooks/useToast.ts` - Toast 通知 Hook

**测试文件 (Tests):**
- `/src/features/generation/lib/prompt-builder.test.ts` - 提示词构建测试
- `/src/features/generation/lib/resolution-config.test.ts` - 分辨率配置测试
- `/src/features/generation/lib/share-handler.test.ts` - 分享功能测试

**总计:** 22 个文件 (14 个实现文件 + 3 个测试文件 + 2 个 hook + 3 个导出/配置文件)
