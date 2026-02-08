# Story 2.2: batch-upload

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

作为一名 **AI 创作者或专业设计师**,
我希望 **能够一次性上传多张(最多5张)同风格图片进行批量分析**,
以便 **系统能够提取多张图片的共同风格特征,提供更准确的综合分析结果**。

## Acceptance Criteria

1. **[AC-1]** 用户可以一次性选择并上传最多 5 张图片
   - 支持拖拽多张图片
   - 支持点击选择多张文件(input multiple)
   - 超过 5 张时显示警告,只处理前 5 张

2. **[AC-2]** 系统可以检测并验证所有上传的图片
   - 每张图片独立验证(格式、大小、分辨率)
   - 显示每张图片的验证状态(✓通过 / ✗失败)
   - 失败的图片不影响其他图片的上传

3. **[AC-3]** 系统显示批量上传的整体进度
   - 显示 "已上传 X/5 张图片"
   - 显示整体百分比(每张图片 20%)
   - 预估剩余时间

4. **[AC-4]** 用户可以批量取消正在进行的上传
   - "取消全部"按钮
   - 单独取消某张图片的上传
   - 取消后清理已上传的临时文件

5. **[AC-5]** 上传完成后,所有图片的元数据保存到数据库
   - images 表创建多条记录
   - 关联到同一个 batch_id(可选)

6. **[AC-6]** 系统为批量上传的图片生成预览缩略图
   - 横向滚动缩略图列表
   - 显示上传状态图标
   - 点击缩略图查看大图

7. **[AC-7]** 移动端优化
   - 支持相册多选
   - 最小触摸目标 44x44px
   - 简化预览界面

## Tasks / Subtasks

- [ ] **Task 1: 扩展 images 表支持批量上传关联** (AC: 5)
  - [ ] Subtask 1.1: 添加 batch_id 字段(可选)
    - 类型: UUID
    - 用途: 关联同批次上传的图片
  - [ ] Subtask 1.2: 创建数据库迁移
  - [ ] Subtask 1.3: 更新 Drizzle Schema 类型定义

- [ ] **Task 2: 增强 R2 上传函数支持并发上传** (AC: 2, 3, 4)
  - [ ] Subtask 2.1: 实现并发上传控制
    - 使用 Promise.all 或 p-limit 库
    - 最多并发 3 个上传请求
  - [ ] Subtask 2.2: 实现单张图片取消功能
    - axios CancelToken
    - 清理 R2 临时文件
  - [ ] Subtask 2.3: 实现批量取消功能
    - 取消所有进行中的上传
    - 清理所有临时文件

- [ ] **Task 3: 增强 API 端点支持批量上传** (AC: 1, 2, 5)
  - [ ] Subtask 3.1: 修改 `/api/upload/route.ts` 支持多文件
    - 接收 files[] 数组
    - 验证文件数量(≤ 5)
  - [ ] Subtask 3.2: 实现批量图片验证
    - 并发验证所有图片
    - 返回每张图片的验证结果
  - [ ] Subtask 3.3: 生成 batch_id(可选)
    - 使用 UUID
    - 关联所有图片记录

- [ ] **Task 4: 实现 BatchUploader 前端组件** (AC: 1, 3, 4, 6)
  - [ ] Subtask 4.1: 创建组件结构
    - 位置: `src/features/analysis/components/BatchUploader/`
    - 复用 ImageUploader 的部分逻辑
  - [ ] Subtask 4.2: 实现多文件选择
    - `<input multiple />`
    - 拖拽支持多个文件
    - 超过 5 张时警告用户
  - [ ] Subtask 4.3: 实现缩略图预览列表
    - 横向滚动
    - 显示验证状态图标(✓/✗)
    - 显示上传进度
  - [ ] Subtask 4.4: 实现批量上传进度显示
    - 整体进度条(0-100%)
    - "已上传 X/5 张"
    - 预估剩余时间
  - [ ] Subtask 4.5: 实现取消按钮
    - "取消全部"按钮
    - 单个图片的取消按钮(悬停显示)

- [ ] **Task 5: 实现响应式设计和移动端优化** (AC: 7)
  - [ ] Subtask 5.1: 桌面端布局
    - 缩略图列表固定在左侧
    - 主显示区域查看大图
  - [ ] Subtask 5.2: 移动端布局
    - 缩略图全屏横向滚动
    - 最小触摸目标 44x44px
  - [ ] Subtask 5.3: 移动端相册多选
    - 使用 iOS/Android 原生多选 API
    - 或使用 Web 文件多选

- [ ] **Task 6: 编写单元测试和 E2E 测试**
  - [ ] Subtask 6.1: 测试并发上传逻辑
  - [ ] Subtask 6.2: 测试批量取消功能
  - [ ] Subtask 6.3: E2E 测试批量上传流程

## Dev Notes

### Epic Context

**当前进度**: Epic 2 的第二个故事
- **前置故事**: 2-1-image-upload (单张上传)
- **后续故事**: 2-3-upload-validation, 2-4-progress-feedback

**业务价值**: 批量上传允许专业用户上传多张同风格图片,系统能够提取共同特征,提供更准确的综合分析。这是专业设计师(如 Sarah)的核心需求。

### Architecture Requirements

**复用单张上传的架构:**
- R2 存储服务: 复用 `src/lib/r2/upload.ts`
- 数据库 Schema: 扩展 images 表添加 batch_id 字段
- API 端点: 扩展 `/api/upload/route.ts` 支持多文件

**并发上传控制:**
```typescript
// 使用 p-limit 库控制并发数
import pLimit from 'p-limit';

const limit = pLimit(3); // 最多并发 3 个上传

const uploadPromises = files.map(file =>
  limit(() => uploadImageToR2(file))
);

await Promise.all(uploadPromises);
```

**数据库 Schema 扩展:**
```typescript
// src/lib/db/schema.ts
export const images = pgTable('images', {
  // ... 现有字段
  batchId: uuid('batch_id'), // 新增: 批次 ID
  uploadOrder: integer('upload_order'), // 新增: 上传顺序
}, (table) => ({
  // ... 现有索引
  batchIdIdx: index('images_batch_id_idx').on(table.batchId),
}));
```

**API 设计(批量上传):**
```typescript
// POST /api/upload/batch
// Request:
{
  files: File[] // 多个文件
}

// Success Response (200):
{
  success: true,
  data: {
    batchId: string,
    images: Array<{
      imageId: string,
      filePath: string,
      url: string,
      // ... 其他元数据
    }>
  }
}

// Error Response (400 - 超过限制):
{
  success: false,
  error: {
    code: 'TOO_MANY_FILES',
    message: '最多只能上传 5 张图片,已自动处理前 5 张',
    details: {
      totalFiles: 7,
      processedFiles: 5,
      skippedFiles: 2
    }
  }
}
```

### UX Requirements

**缩略图列表设计:**
```tsx
// 横向滚动缩略图列表
<Box
  sx={{
    display: 'flex',
    gap: 2,
    overflowX: 'auto',
    padding: 2,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  }}
>
  {images.map((image, index) => (
    <ThumbnailCard
      key={image.id}
      image={image}
      index={index}
      status={image.status}
      progress={image.progress}
      onCancel={handleCancel}
    />
  ))}
</Box>
```

**缩略图卡片设计:**
```tsx
// ThumbnailCard 组件
<Card
  sx={{
    minWidth: 100,
    width: 100,
    height: 100,
    position: 'relative',
    border: '2px solid',
    borderColor: getStatusColor(status),
  }}
>
  <CardMedia
    component="img"
    image={image.thumbnail}
    alt={`上传 ${index + 1}`}
    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
  {/* 状态图标 */}
  <StatusIcon status={status} />
  {/* 取消按钮 */}
  {status === 'uploading' && (
    <IconButton
      sx={{ position: 'absolute', top: 4, right: 4 }}
      onClick={() => onCancel(image.id)}
    >
      <CloseIcon />
    </IconButton>
  )}
  {/* 进度条 */}
  {status === 'uploading' && (
    <LinearProgress variant="determinate" value={progress} />
  )}
</Card>
```

**批量进度显示:**
```tsx
<Box sx={{ mb: 2 }}>
  <Typography variant="body2" color="text.secondary">
    已上传 {completedCount} / {totalCount} 张图片
  </Typography>
  <LinearProgress
    variant="determinate"
    value={(completedCount / totalCount) * 100}
    sx={{ mt: 1 }}
  />
  <Typography variant="caption" color="text.secondary">
    预计剩余时间: {estimatedTime} 秒
  </Typography>
</Box>
```

**响应式设计:**
- **桌面端**: 缩略图列表固定在左侧(120px 宽度)
- **移动端**: 缩略图全屏横向滚动,占据顶部 100px
- **平板端**: 介于两者之间

### Implementation Patterns

**状态管理模式:**
```typescript
interface BatchUploadState {
  files: File[];
  images: UploadedImage[];
  batchId: string | null;
  isUploading: boolean;
  completedCount: number;
  totalCount: number;
  addFiles: (files: File[]) => void;
  removeFile: (imageId: string) => void;
  cancelAll: () => void;
}

const useBatchUploadStore = create<BatchUploadState>((set) => ({
  files: [],
  images: [],
  batchId: null,
  isUploading: false,
  completedCount: 0,
  totalCount: 0,
  addFiles: (files) => set((state) => ({
    files: [...state.files, ...files].slice(0, 5), // 最多 5 张
    totalCount: Math.min(state.files.length + files.length, 5),
  })),
  // ...
}));
```

**并发上传模式:**
```typescript
// 使用 React Query 的批量 mutation
const useBatchUpload = () => {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await fetch('/api/upload/batch', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('批量上传失败');
      }

      return response.json();
    },
    onSuccess: (data) => {
      useBatchUploadStore.getState().setBatchId(data.data.batchId);
      useBatchUploadStore.getState().setImages(data.data.images);
    },
  });
};
```

**错误处理模式:**
```typescript
// 单个图片失败不影响其他图片
const uploadSingleImage = async (file: File) => {
  try {
    const result = await uploadImageToR2(file);
    updateImageStatus(file.id, 'completed', result);
  } catch (error) {
    updateImageStatus(file.id, 'failed', error.message);
  }
};
```

### Testing Requirements

**单元测试:**
- 并发上传控制测试
- 批量取消功能测试
- 文件数量限制测试(> 5 张)

**E2E 测试:**
- 批量拖拽上传流程
- 批量选择文件上传流程
- 部分失败场景(某些图片验证失败)
- 取消全部流程

**性能测试:**
- 5 张图片并发上传性能
- 内存使用情况
- 上传速度和进度准确性

### Previous Story Intelligence

**从 2-1-image-upload 学到的经验:**
- R2 上传函数已经实现,可以复用
- 图片验证逻辑已经实现,可以批量应用
- 进度显示模式已经建立,可以扩展为批量模式

**需要注意的差异:**
- 批量上传需要并发控制(避免同时上传 5 张大文件)
- 需要整体进度和单个进度两层显示
- 需要处理部分失败的场景(某些图片成功,某些失败)

### Dependencies

**依赖的 Stories:**
- 2-1-image-upload (completed): 单张上传功能
  - 复用 R2 上传逻辑
  - 复用图片验证逻辑
  - 复用进度显示组件

**依赖的组件:**
- `src/lib/r2/upload.ts`: 上传函数
- `src/features/analysis/components/ImageUploader/`: 单张上传组件

**后续 Stories:**
- 2-3-upload-validation: 将使用批量上传进行综合分析
- 2-4-progress-feedback: 将优化批量分析的进度反馈

### References

- [Source: epics.md#Epic-2] (Epic 2 完整需求)
- [Source: ux-design-specification.md#User-Tiered-Experience] (用户分层体验)
- [Source: prd.md#Journey-2] (专业设计师 Sarah 的批量分析场景)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

(开发代理将在实施过程中填写)

### Completion Notes List

(开发代理将在完成时填写)

### File List

(开发代理将在完成时列出所有创建/修改的文件)
