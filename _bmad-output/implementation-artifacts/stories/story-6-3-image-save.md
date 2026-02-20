# Story 6.3: image-save

Status: ready-for-dev

## Story

As a 创作者
I want 保存生成的图片到本地设备和云端历史记录
so that 我可以在之后访问、管理和重新使用这些生成的图片

## Acceptance Criteria

1. **AC1:** 图片保存支持多种格式和质量选项:
   - 支持下载为 PNG(无损,默认)
   - 支持下载为 JPEG(可调质量,70-100%)
   - 支持下载为 WebP(现代格式,高压缩比)
   - 提供分辨率选择(原始尺寸、1x、2x、4x)

2. **AC2:** 图片保存支持批量操作:
   - 批量下载所有生成的图片(打包为 ZIP)
   - 批量保存到历史记录
   - 显示批量保存进度(保存进度条)
   - 支持取消批量操作

3. **AC3:** 图片保存到云端历史记录:
   - 自动保存到用户的历史记录
   - 保存元数据(生成参数、模版、时间戳)
   - 保存到用户相册分类(可自定义文件夹)
   - 支持重命名图片(默认名称:模板名_时间戳)

4. **AC4:** 图片保存提供用户友好的反馈:
   - 保存成功显示 Toast 通知
   - 保存失败显示错误提示和重试选项
   - 保存进度显示(百分比 + 预计时间)
   - 完成后提供"打开文件夹"或"查看历史"按钮

5. **AC5:** 图片保存支持移动端:
   - 移动端长按图片显示保存选项
   - 移动端支持"保存到相册"(iOS/Android 原生 API)
   - 移动端支持"分享到其他应用"
   - 移动端优化保存流程(减少步骤)

6. **AC6:** 图片保存遵循 UX 设计规范:
   - 使用 Glassmorphism 保存对话框
   - 使用 Lucide 图标(Download, Save, Image, FolderOpen, Share2)
   - 支持 300ms 平滑动画过渡
   - 响应式设计支持桌面端和移动端

## Tasks / Subtasks

- [ ] **Task 1: 创建图片保存数据结构和类型定义** (AC: 1, 2, 3)
  - [ ] 1.1 定义 `ImageSaveOptions` 接口(格式、质量、分辨率)
  - [ ] 1.2 定义 `ImageFormat` 枚举(PNG, JPEG, WebP)
  - [ ] 1.3 定义 `ImageResolution` 接口(宽度、高度、倍数)
  - [ ] 1.4 定义 `ImageMetadata` 接口(生成参数、模版、时间戳)
  - [ ] 1.5 定义 `BatchSaveProgress` 接口(批量保存进度)

- [ ] **Task 2: 实现图片下载功能** (AC: 1, 2, 4)
  - [ ] 2.1 创建 `downloadImage` 函数(单张图片下载)
  - [ ] 2.2 实现 `downloadImageAsFormat` 函数(格式转换)
  - [ ] 2.3 实现 `downloadImagesAsZip` 函数(批量下载为 ZIP)
  - [ ] 2.4 实现下载进度跟踪
  - [ ] 2.5 实现下载错误处理和重试

- [ ] **Task 3: 实现图片保存到历史记录** (AC: 3, 4)
  - [ ] 3.1 创建 `saveImageToHistory` 函数
  - [ ] 3.2 创建 `saveBatchToHistory` 函数
  - [ ] 3.3 实现元数据保存逻辑
  - [ ] 3.4 实现图片重命名功能
  - [ ] 3.5 实现文件夹分类功能

- [ ] **Task 4: 实现保存选项对话框组件** (AC: 1, 2, 6)
  - [ ] 4.1 创建 `SaveOptionsDialog` 组件
  - [ ] 4.2 实现格式选择 UI(PNG/JPEG/WebP)
  - [ ] 4.3 实现质量选择 UI(JPEG 质量 70-100%)
  - [ ] 4.4 实现分辨率选择 UI(原始/1x/2x/4x)
  - [ ] 4.5 应用 Glassmorphism 样式

- [ ] **Task 5: 实现批量保存进度组件** (AC: 2, 4, 6)
  - [ ] 5.1 创建 `BatchSaveProgressDialog` 组件
  - [ ] 5.2 实现保存进度条显示
  - [ ] 5.3 实现取消按钮
  - [ ] 5.4 实现完成后操作按钮(打开文件夹/查看历史)
  - [ ] 5.5 应用 Glassmorphism 样式

- [ ] **Task 6: 实现移动端保存功能** (AC: 5)
  - [ ] 6.1 实现长按图片显示保存菜单
  - [ ] 6.2 集成 iOS 原生保存 API(如果可用)
  - [ ] 6.3 集成 Android 原生保存 API(如果可用)
  - [ ] 6.4 实现"分享到其他应用"功能
  - [ ] 6.5 优化移动端保存流程

- [ ] **Task 7: 集成保存功能到生成预览** (AC: 1, 2, 3)
  - [ ] 7.1 修改 `GenerationPreviewDialog` 添加保存按钮
  - [ ] 7.2 实现单个图片保存快捷操作
  - [ ] 7.3 实现批量保存快捷操作
  - [ ] 7.4 添加保存历史记录快捷访问

- [ ] **Task 8: 实现保存错误处理和重试** (AC: 4)
  - [ ] 8.1 实现保存失败错误检测
  - [ ] 8.2 实现友好错误提示
  - [ ] 8.3 实现自动重试逻辑(最多3次)
  - [ ] 8.4 实现手动重试按钮

- [ ] **Task 9: 单元测试**
  - [ ] 9.1 测试图片下载功能
  - [ ] 9.2 测试格式转换功能
  - [ ] 9.3 测试批量下载功能
  - [ ] 9.4 测试历史记录保存功能

- [ ] **Task 10: 集成测试**
  - [ ] 10.1 测试完整保存流程(选择选项 → 下载 → 成功通知)
  - [ ] 10.2 测试批量保存流程
  - [ ] 10.3 测试保存失败和重试场景
  - [ ] 10.4 测试移动端保存功能

- [ ] **Task 11: E2E 测试**
  - [ ] 11.1 测试完整用户流程(生成 → 预览 → 保存 → 查看历史)
  - [ ] 11.2 测试批量保存流程
  - [ ] 11.3 视觉回归测试(保存对话框快照)

## Dev Notes

### 业务上下文

**Epic 6 目标:** AI 图片生成 - 用户可以使用模版直接生成同风格新图片,并分享到社交媒体

**Story 6.3 定位:** Epic 6 的第三个故事,专注于图片保存功能。在 Story 6.1 和 6.2 完成生成和进度显示后,本故事解决用户保存和管理生成图片的需求。

**用户价值:**
- 创作者:可以保存和重用生成的图片
- 设计师:可以批量导出不同格式用于不同场景
- 营销人员:可以快速获取高质量图片用于营销
- 所有人:方便地管理生成历史,避免丢失作品

**为什么这个功能重要:**
- 生成的图片需要保存到本地才能在其他地方使用
- 批量保存提升效率(一次生成多张,一次保存全部)
- 历史记录保存让用户可以找回之前的生成
- 多格式支持满足不同使用场景(高质量/小体积)

### 相关功能需求(FR)

- **FR32:** 系统可以支持将生成的图片导出为 PNG/JPEG/WebP 格式
- **FR33:** 系统可以支持批量导出图片
- **FR34:** 系统可以将生成的图片保存到云端
- **FR35:** 系统可以为保存的图片添加元数据
- **FR36:** 系统可以为保存的图片创建分类
- **FR37:** 系统可以为保存的图片重命名

**前置依赖:**
- **Story 6.1:** 图片生成(生成结果需要保存)
- **Story 6.2:** 生成进度(生成完成后触发保存)
- **Epic 7:** 历史记录管理(保存到历史记录)

### 架构约束

**技术栈:**
- 前端框架:Next.js 15+ (App Router)
- 状态管理:Zustand(UI 状态) + React Query(服务器状态)
- UI 组件:MUI + Tailwind CSS(Glassmorphism 样式)
- 图标库:Lucide React(Download, Save, Image, FolderOpen, Share2)
- 类型检查:TypeScript
- 文件处理:JSZip(批量打包下载)
- 文件保存:FileSaver.js(跨浏览器保存)

**命名规范:**
- 组件:PascalCase(`SaveOptionsDialog`, `BatchSaveProgressDialog`)
- 函数/变量:camelCase(`downloadImage`, `saveToHistory`)
- 类型/接口:PascalCase(`ImageSaveOptions`, `ImageFormat`)
- 常量:UPPER_SNAKE_CASE(`SUPPORTED_FORMATS`, `DEFAULT_QUALITY`)
- 文件名:kebab-case(`save-options-dialog.tsx`, `image-downloader.ts`)

**项目结构:**
```
src/features/generation/
├── components/
│   ├── SaveOptionsDialog/
│   │   ├── index.tsx
│   │   ├── SaveOptionsDialog.tsx  # 保存选项对话框
│   │   ├── FormatSelector.tsx  # 格式选择器
│   │   ├── QualitySelector.tsx  # 质量选择器
│   │   └── ResolutionSelector.tsx  # 分辨率选择器
│   ├── BatchSaveProgressDialog/
│   │   ├── index.tsx
│   │   └── BatchSaveProgressDialog.tsx  # 批量保存进度对话框
│   └── MobileSaveMenu/
│       ├── index.tsx
│       └── MobileSaveMenu.tsx  # 移动端保存菜单
├── lib/
│   ├── image-downloader.ts  # 图片下载逻辑
│   ├── format-converter.ts  # 格式转换
│   ├── batch-saver.ts  # 批量保存
│   ├── history-saver.ts  # 历史记录保存
│   └── save-constants.ts  # 保存相关常量
└── stores/
    └── image-save.store.ts  # 保存状态管理
```

### 数据结构设计

**ImageFormat 枚举:**
```typescript
enum ImageFormat {
  PNG = 'png',  // 无损格式
  JPEG = 'jpeg',  // 有损格式
  WebP = 'webp',  // 现代格式
}
```

**ImageSaveOptions 接口:**
```typescript
interface ImageSaveOptions {
  format: ImageFormat;  // 图片格式
  quality?: number;  // JPEG 质量 (70-100, 仅 JPEG)
  resolution: 'original' | '1x' | '2x' | '4x';  // 分辨率选项
  filename?: string;  // 自定义文件名
  metadata?: ImageMetadata;  // 元数据
}
```

**ImageMetadata 接口:**
```typescript
interface ImageMetadata {
  templateId: string;  # 模板 ID
  templateName: string;  # 模板名称
  generationParams: Record<string, any>;  # 生成参数
  createdAt: Date;  # 生成时间
  generatedBy: string;  # 生成者(用户 ID)
}
```

**BatchSaveProgress 接口:**
```typescript
interface BatchSaveProgress {
  totalItems: number;  # 总数量
  completedItems: number;  # 已完成数量
  failedItems: number;  # 失败数量
  currentFile?: string;  # 当前文件名
  percentage: number;  # 完成百分比
}
```

### API 集成设计

**图片下载 API:**
```typescript
// src/features/generation/lib/image-downloader.ts
export async function downloadImage(
  imageUrl: string,
  options: ImageSaveOptions
): Promise<void> {
  // 1. 获取图片
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  // 2. 转换格式(如果需要)
  const convertedBlob = await convertFormat(blob, options);

  // 3. 调整分辨率(如果需要)
  const resizedBlob = await resizeImage(convertedBlob, options.resolution);

  // 4. 生成文件名
  const filename = generateFilename(options);

  // 5. 保存文件
  saveAs(resizedBlob, filename);
}

export async function downloadImagesAsZip(
  images: Array<{ url: string; options: ImageSaveOptions }>,
  onProgress?: (progress: BatchSaveProgress) => void
): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < images.length; i++) {
    const { url, options } = images[i];

    // 下载图片
    const blob = await fetch(url).then(r => r.blob());
    const converted = await convertFormat(blob, options);

    // 添加到 ZIP
    const filename = generateFilename(options, i);
    zip.file(filename, converted);

    // 更新进度
    onProgress?.({
      totalItems: images.length,
      completedItems: i + 1,
      failedItems: 0,
      currentFile: filename,
      percentage: ((i + 1) / images.length) * 100,
    });
  }

  // 生成 ZIP 并下载
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'images.zip');
}
```

**历史记录保存 API:**
```typescript
// src/features/generation/lib/history-saver.ts
export async function saveImageToHistory(
  imageUrl: string,
  metadata: ImageMetadata
): Promise<void> {
  const response = await fetch('/api/history/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: imageUrl,
      metadata,
    }),
  });

  if (!response.ok) {
    throw new Error('保存失败');
  }
}
```

### UI/UX 设计规范

**Glassmorphism 样式:**
- 保存对话框使用 `ia-glass-card` 类
- 格式选择器使用单选按钮组
- 质量滑块使用渐变色(低质量红色 → 高质量绿色)

**图标系统:**
- 下载图标: `<Download size={20} className="text-blue-500" />`
- 保存图标: `<Save size={20} className="text-green-500" />`
- 图片图标: `<Image size={20} className="text-purple-500" />`
- 文件夹图标: `<FolderOpen size={20} className="text-yellow-500" />`
- 分享图标: `<Share2 size={20} className="text-pink-500" />`

**保存选项对话框样式:**
```
┌─────────────────────────────────────────────────────────┐
│  保存选项                                    [X]         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 格式: ⦿ PNG ○ JPEG ○ WebP                       │  │
│  │ 质量: ████████░░ 80%                             │  │
│  │ 分辨率: ○ 原始 ⦿ 2x ○ 1x ○ 4x                   │  │
│  │ 文件名: [模板名_20250220_143000]                 │  │
│  └───────────────────────────────────────────────────┘  │
│  [保存到历史] [下载] [取消]                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  批量保存进度                              [X]         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ████████████████████░░░░░░░ 60%                  │  │
│  │ 正在保存: 模板名_3.png                            │  │
│  │ 已完成: 3/5 张                                    │  │
│  └───────────────────────────────────────────────────┘  │
│  [取消保存]                                            │
└─────────────────────────────────────────────────────────┘
```

**响应式设计:**
- 桌面端(≥ 1024px):完整保存选项对话框
- 平板端(768-1024px):简化保存选项
- 移动端(< 768px):底部弹出保存菜单

### 性能要求

- 单张图片下载:< 5 秒(正常网络)
- 批量下载(10张):< 30 秒
- 格式转换延迟:< 1 秒
- UI 响应延迟:< 100ms

### 安全考虑

- **用户权限:** 用户只能保存自己生成的图片
- **文件名安全:** 过滤特殊字符,防止路径遍历
- **内容安全:** 验证图片类型,防止恶意文件
- **API 安全:** 历史记录保存需要认证

### 依赖关系

**前置依赖:**
- ✅ Story 6.1: 图片生成(生成结果)
- ✅ Story 6.2: 生成进度(生成完成触发)
- ✅ UX-UPGRADE-1: UX 设计规范升级

**后置依赖:**
- 🟡 Story 6.4: 社交分享(分享前可先保存)
- 🟡 Story 6.5: 分享奖励(保存也算奖励)
- 🟡 Epic 7: 模版库与历史记录(历史记录管理)

### Previous Story Intelligence

从 Story 6.1 和 6.2 学到的经验:

1. **图片处理:** Story 6.1 已经处理了图片 URL 和 Blob 转换
2. **批量操作:** Story 6.2 实现了批量进度跟踪,可以复用
3. **Zustand store:** 可以创建类似的 `useImageSaveStore`
4. **Toast 反馈:** 复用现有 Toast 机制
5. **Glassmorphism 样式:** 复用 `ia-glass-card` 样式

**需要注意的变更:**
- 图片下载需要处理跨域问题
- 格式转换需要在客户端完成(Canvas API)
- 批量下载需要打包为 ZIP
- 移动端保存需要特殊处理(权限限制)

### Project Context Reference

**项目位置:** `/Users/muchao/code/image_analyzer`

**相关文档:**
- PRD: `/Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/prd.md`
- Story 6.1: `/Users/muchao/code/image_analyzer/_bmad-output/implementation-artifacts/stories/story-6-1-image-generation.md`
- Story 6.2: `/Users/muchao/code/image_analyzer/_bmad-output/implementation-artifacts/stories/story-6-2-generation-progress.md`

**关键依赖:**
- Story 6.1: 图片生成(`src/features/generation/lib/image-generation.ts`)
- Story 6.2: 进度跟踪(`src/features/generation/stores/generation-progress.store.ts`)

**下一步工作:**
- Story 6.4: 社交分享
- Story 6.5: 分享奖励

## Dev Agent Record

### Agent Model Used

_Claude Sonnet 4.6 (claude-sonnet-4-6)_

### Debug Log References

_待开发时填写_

### Completion Notes List

_待开发时填写_

### File List

_待开发时填写_
