# Story 2.1: image-upload

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

作为一名 **AI 创作者或普通用户**,
我希望 **能够通过简单直观的方式上传参考图片到系统**,
以便 **系统可以对其进行 AI 风格分析并生成可用的提示词模版**。

## Acceptance Criteria

1. **[AC-1]** 用户可以通过拖拽方式上传单张图片
   - 桌面端: 拖拽图片到上传区域自动触发上传
   - 移动端: 点击上传区域触发文件选择器(手机拍照或相册选择)

2. **[AC-2]** 系统可以验证上传图片的格式和大小
   - 支持格式: JPEG、PNG、WebP
   - 大小限制: 最大 10MB
   - 分辨率限制: 最小 200×200px,最大 8192×8192px

3. **[AC-3]** 系统可以显示上传进度
   - 实时显示上传百分比
   - 上传完成后显示成功确认

4. **[AC-4]** 用户可以取消正在进行的图片上传
   - 提供取消按钮
   - 取消后清理临时数据

5. **[AC-5]** 系统可以检测不适合分析的图片
   - 识别复杂场景(多主体>5个)
   - 分析置信度 < 50% 时警告用户
   - 提供友好的错误提示和改进建议

6. **[AC-6]** 上传的图片元数据成功保存到数据库
   - images 表记录创建成功
   - 包含文件路径、大小、格式等元数据

7. **[AC-7]** 移动端体验优化
   - 最小触摸目标 44x44px
   - 上传按钮固定底部(Floating Action Button)
   - 支持"手机拍照"和"相册选择"两种方式

## Tasks / Subtasks

- [ ] **Task 1: 设计并实现 images 数据库 Schema** (AC: 6)
  - [ ] Subtask 1.1: 使用 Drizzle ORM 定义 images 表结构
    - 参考: `src/lib/db/schema.ts`
    - 字段: id, user_id, file_path, file_size, file_format, width, height, upload_status, created_at, updated_at
  - [ ] Subtask 1.2: 创建数据库迁移文件
    - 使用 `drizzle-kit generate` 命令
  - [ ] Subtask 1.3: 运行迁移创建表结构

- [ ] **Task 2: 集成 Cloudflare R2 存储服务** (AC: 1, 6)
  - [ ] Subtask 2.1: 配置 R2 客户端和凭证
    - 参考: `src/lib/r2/index.ts`
    - 环境变量: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_BUCKET_NAME
  - [ ] Subtask 2.2: 实现图片上传函数 `uploadImageToR2()`
    - 参考: `src/lib/r2/upload.ts`
    - 支持文件流式上传
    - 生成唯一文件名(UUID)
  - [ ] Subtask 2.3: 实现图片删除函数(用于取消上传时清理)
    - 参考: `src/lib/r2/delete.ts`

- [ ] **Task 3: 实现 Next.js API 路由用于图片上传** (AC: 1, 2, 3, 4, 6)
  - [ ] Subtask 3.1: 创建 `/api/upload/route.ts` API 端点
    - 方法: POST
    - 验证用户认证状态(使用 NextAuth session)
  - [ ] Subtask 3.2: 实现图片验证逻辑
    - 格式验证(JPEG、PNG、WebP)
    - 大小验证(≤ 10MB)
    - 分辨率验证(读取图片尺寸)
  - [ ] Subtask 3.3: 实现图片复杂度检测
    - 使用简单的启发式规则(文件大小、分辨率)
    - 预留 Replicate 视觉模型 API 集成接口(FR9 完整实现)
  - [ ] Subtask 3.4: 实现 R2 上传和数据库记录创建
    - 上传到 R2
    - 在 images 表创建记录
    - 返回图片 URL 和元数据

- [ ] **Task 4: 实现 ImageUploader 前端组件** (AC: 1, 3, 4, 7)
  - [ ] Subtask 4.1: 创建组件结构
    - 位置: `src/features/analysis/components/ImageUploader/`
    - 文件: index.tsx, ImageUploader.tsx, types.ts
  - [ ] Subtask 4.2: 实现拖拽上传功能(桌面端)
    - 使用 react-dropzone 库
    - 拖拽时高亮显示上传区域
    - 参考 UX 设计规范中的上传区域样式
  - [ ] Subtask 4.3: 实现点击上传功能(移动端)
    - 隐藏文件 input 元素
    - 点击上传区域触发 input 点击
    - 移动端显示"拍照"和"相册"选项
  - [ ] Subtask 4.4: 实现上传进度显示
    - 使用 axios 上传(支持 progress 事件)
    - 实时进度条(0-100%)
    - 上传状态: idle → uploading → success/error
  - [ ] Subtask 4.5: 实现取消上传功能
    - 取消按钮(上传中显示)
    - 使用 axios CancelToken
    - 调用删除 API 清理 R2 临时文件

- [ ] **Task 5: 实现响应式设计和移动端优化** (AC: 1, 7)
  - [ ] Subtask 5.1: 桌面端布局(≥ 1024px)
    - 三列布局的一部分: 参考图片 | 分析结果 | 可编辑模版
    - 上传区域占据左侧栏
  - [ ] Subtask 5.2: 移动端布局(< 768px)
    - 单列布局
    - 上传区域占据全宽
    - 最小触摸目标 44x44px
  - [ ] Subtask 5.3: 移动端特定交互
    - Floating Action Button(固定底部)
    - 点击后显示"拍照"或"相册选择"对话框

- [ ] **Task 6: 实现错误处理和用户教育** (AC: 5)
  - [ ] Subtask 6.1: 友好的错误信息
    - 文件过大: "图片大小超过 10MB,请压缩后重试"
    - 格式不支持: "仅支持 JPEG、PNG、WebP 格式"
    - 上传失败: "上传失败,请检查网络连接或重试"
  - [ ] Subtask 6.2: 复杂图片警告
    - "这张图片可能不适合分析"
    - "建议使用单主体、风格明显的图片"
  - [ ] Subtask 6.3: 用户教育提示
    - 首次使用时显示引导提示
    - "推荐场景: 单主体、静态场景、清晰风格特征"

- [ ] **Task 7: 编写单元测试和 E2E 测试**
  - [ ] Subtask 7.1: 测试图片验证逻辑
    - 格式验证测试
    - 大小验证测试
    - 分辨率验证测试
  - [ ] Subtask 7.2: 测试 API 上传流程
    - 成功上传场景
    - 失败场景(格式错误、大小超限)
    - 取消上传场景
  - [ ] Subtask 7.3: E2E 测试上传用户体验
    - 拖拽上传测试
    - 进度显示测试
    - 移动端文件选择测试

## Dev Notes

### Epic Context

**Epic 2: 图片上传与管理**
- **用户成果**: 用户可以通过拖拽或点击上传图片,支持单张和批量上传(支持桌面端和移动端)
- **包含的 Stories**:
  - 2-1: image-upload (当前故事)
  - 2-2: batch-upload (批量上传)
  - 2-3: upload-validation (上传验证增强)
  - 2-4: progress-feedback (进度反馈优化)

**业务价值**: 图片上传是整个 AI 风格分析流程的入口点,直接影响用户的第一印象和产品体验。高质量的上传体验是建立用户信任的关键。

### Architecture Requirements

**技术栈:**
- **前端**: Next.js 15 + React 18 + TypeScript
- **状态管理**: Zustand(上传状态) + React Query(服务器状态)
- **UI 组件**: MUI + Tailwind CSS
- **存储**: Cloudflare R2(S3 API 兼容)
- **数据库**: PostgreSQL + Drizzle ORM
- **文件上传**: react-dropzone + axios

**数据库 Schema(Drizzle ORM):**

```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(), // 外键关联 users 表
  filePath: text('file_path').notNull(), // R2 存储路径
  fileSize: integer('file_size').notNull(), // 文件大小(字节)
  fileFormat: text('file_format').notNull(), // JPEG, PNG, WebP
  width: integer('width'), // 图片宽度
  height: integer('height'), // 图片高度
  uploadStatus: text('upload_status').notNull(), // pending, completed, failed
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('images_user_id_idx').on(table.userId),
}));
```

**API 设计:**

```typescript
// POST /api/upload
// Request:
{
  file: File // multipart/form-data
}

// Success Response (200):
{
  success: true,
  data: {
    imageId: string,
    filePath: string,
    fileSize: number,
    fileFormat: string,
    width: number,
    height: number,
    url: string // R2 公开访问 URL
  }
}

// Error Response (400/401/413/500):
{
  success: false,
  error: {
    code: string, // INVALID_FILE_TYPE, FILE_TOO_LARGE, UPLOAD_FAILED
    message: string, // 用户友好的错误信息
    details?: Record<string, unknown>
  }
}
```

**项目结构:**

```
src/features/analysis/components/ImageUploader/
├── index.tsx                 # 导出
├── ImageUploader.tsx         # 主组件
├── ImageUploader.test.tsx    # 单元测试
└── types.ts                  # 类型定义

src/lib/r2/
├── index.ts                  # R2 客户端配置
├── upload.ts                 # 上传函数
└── delete.ts                 # 删除函数

src/app/api/upload/
└── route.ts                  # 上传 API 端点
```

### UX Requirements

**视觉设计:**
- **Glassmorphism 风格**: 半透明背景 + 模糊效果
  - 参考: `src/styles/glassmorphism.css`
- **深色模式背景**: Slate 900 (#0F172A)
- **上传区域边框**: 2px dashed rgba(255, 255, 255, 0.2)
- **悬停状态**: 边框变为绿色 (#22C55E)
- **拖拽状态**: 背景变为 rgba(34, 197, 94, 0.1)

**上传区域设计:**

```tsx
// 桌面端上传区域
<Box
  sx={{
    border: '2px dashed rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#22C55E',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
  }}
>
  <UploadIcon sx={{ fontSize: 48, mb: 2 }} />
  <Typography variant="h6">拖拽图片到这里</Typography>
  <Typography variant="body2" color="text.secondary">
    或点击选择文件 (最大 10MB)
  </Typography>
</Box>

// 移动端上传区域
<IconButton
  sx={{
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#22C55E',
    '&:hover': { backgroundColor: '#16A34A' },
  }}
>
  <AddPhotoIcon />
</IconButton>
```

**进度显示设计:**

```tsx
// 上传进度组件
<LinearProgress
  variant="determinate"
  value={uploadProgress}
  sx={{
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    '& .MuiLinearProgress-bar': {
      backgroundColor: '#22C55E',
    },
  }}
/>
<Typography variant="body2" sx={{ mt: 1 }}>
  上传中... {uploadProgress}%
</Typography>
```

**响应式断点:**
- **移动端** (< 768px): 单列布局,底部 FAB
- **平板端** (768-1024px): 单列布局,稍宽间距
- **桌面端** (≥ 1024px): 三列布局,上传区域占据左侧

**字体规范:**
- 标题: Poppins 600
- 正文: Open Sans 400
- 移动端最小触摸目标: 44x44px

**无障碍要求:**
- 所有可交互元素支持键盘导航
- 上传区域有 `aria-label` 描述
- 进度条有 `aria-valuenow` 实时值
- 错误信息使用 `role="alert"`

### Implementation Patterns

**命名规范:**
- **React 组件**: PascalCase (ImageUploader)
- **函数/变量**: camelCase (uploadImageToR2)
- **数据库表/列**: snake_case (images, file_path)
- **文件名**: kebab-case (image-uploader.tsx)

**状态管理模式:**
```typescript
// Zustand store for upload state
interface UploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadedImage: ImageData | null;
  error: string | null;
  setUploading: (uploading: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
}

const useUploadStore = create<UploadState>((set) => ({
  isUploading: false,
  uploadProgress: 0,
  uploadedImage: null,
  error: null,
  setUploading: (uploading) => set({ isUploading: uploading }),
  setProgress: (progress) => set({ uploadProgress: progress }),
  setError: (error) => set({ error }),
}));
```

**API 调用模式:**
```typescript
// React Query hook for upload
const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }
      return response.json();
    },
    onSuccess: (data) => {
      useUploadStore.getState().setUploadedImage(data.data);
    },
    onError: (error) => {
      useUploadStore.getState().setError(error.message);
    },
  });
};
```

**错误处理模式:**
```typescript
// 统一错误处理
try {
  await uploadImage(file);
} catch (error) {
  if (error.message.includes('File too large')) {
    setError('图片大小超过 10MB,请压缩后重试');
  } else if (error.message.includes('Invalid format')) {
    setError('仅支持 JPEG、PNG、WebP 格式');
  } else {
    setError('上传失败,请检查网络连接或重试');
  }
}
```

### Testing Requirements

**单元测试:**
- 图片验证逻辑测试(格式、大小、分辨率)
- R2 上传函数测试(使用 mock)
- 数据库记录创建测试

**E2E 测试:**
- 拖拽上传完整流程
- 点击上传完整流程
- 取消上传流程
- 错误场景(格式错误、大小超限、网络错误)

**测试框架:**
- Jest + React Testing Library(单元测试)
- Playwright(E2E 测试)

### Previous Story Intelligence

无 - 这是 Epic 2 的第一个故事。

**从 Epic 1 学习到的经验:**
- 确保所有数据库 Schema 都使用 Drizzle ORM 定义
- NextAuth session 验证在 API 路由中使用 `auth()` 函数
- 组件统一使用 MUI + Tailwind CSS 组合
- 所有 API 响应遵循统一格式: `{success, data/error}`

### Git Intelligence

**最近的提交(从 git log):**
- `43ada13`: feat: 完成Epic 1回顾并优化认证组件
- `6fb24be`: stabilize test baseline and implement non-epic1 api/e2e scaffolding
- `c9154ed`: feat: 完成Story 1-5账户删除功能

**学习到的代码模式:**
- 认证相关功能使用 `src/lib/auth/` 模块
- 数据库操作统一使用 `src/lib/db/` 模块
- 测试文件放在同目录,命名为 `*.test.tsx`

### Dependencies

**依赖的 Stories:**
- Epic 1: 用户认证与账户系统(completed)
  - 需要 NextAuth session 验证

**依赖的组件:**
- `src/lib/auth/`: 认证模块
- `src/lib/db/`: 数据库模块
- `src/components/ui/`: MUI 基础组件

**后续 Stories:**
- 2-2: batch-upload (将基于当前故事的实现添加批量功能)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

(开发代理将在实施过程中填写)

### Completion Notes List

(开发代理将在完成时填写)

### File List

(开发代理将在完成时列出所有创建/修改的文件)
