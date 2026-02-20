# Story 6.3: image-save 代码审查报告

## 审查概述

**审查日期:** 2026-02-20
**审查范围:** Story 6.3 (image-save) 实现代码
**审查标准:** 代码质量、安全问题、性能问题、最佳实践、测试覆盖

---

## 已实现的功能

| 功能模块 | 实现状态 | 文件位置 |
|---------|---------|---------|
| 类型定义 | 已实现 | `src/features/generation/types/save.ts` |
| 图片下载 | 部分实现 | `src/features/generation/lib/image-downloader.ts` |
| 保存常量 | 已实现 | `src/features/generation/lib/save-constants.ts` |
| 保存选项对话框 | 部分实现 | `src/features/generation/components/SaveOptionsDialog/` |

---

## 问题清单

### 1. 类型定义问题

#### 1.1 ImageSaveOptions 缺少 metadata 字段

**严重程度:** 中
**文件:** `/Users/muchao/code/image_analyzer/src/features/generation/types/save.ts`

**问题描述:**
根据故事文档 AC3，`ImageSaveOptions` 接口需要支持保存元数据(生成参数、模板、时间戳)，但当前类型定义缺少 `metadata` 字段。

**当前代码:**
```typescript
export interface ImageSaveOptions {
  format: ImageFormat;
  quality?: number; // 70-100, 仅 JPEG
  resolution: ImageResolutionOption;
  filename?: string;
}
```

**建议修复:**
```typescript
export interface ImageSaveOptions {
  format: ImageFormat;
  quality?: number; // 70-100, 仅 JPEG
  resolution: ImageResolutionOption;
  filename?: string;
  metadata?: ImageMetadata; // 元数据
}
```

---

### 2. 图片下载器问题

#### 2.1 缺少分辨率调整功能

**严重程度:** 高
**文件:** `/Users/muchao/code/image_analyzer/src/features/generation/lib/image-downloader.ts`

**问题描述:**
故事文档 AC1 要求支持分辨率选择(原始尺寸、1x、2x、4x)，但 `downloadImage` 函数没有实现实际的分辨率调整逻辑。虽然UI中有分辨率选择器，但后端逻辑是空的。

**当前代码:**
```typescript
// 获取图片
const response = await fetch(imageUrl);
const blob = await response.blob();

// 转换格式(如果需要)
const finalBlob = await convertImageFormat(blob, fullOptions);

// 生成文件名
const filename = generateFilename(fullOptions);

// 保存文件
// ... 缺少分辨率调整逻辑
```

**建议修复:**
添加 `resizeImage` 函数实现分辨率调整:
```typescript
async function resizeImage(
  blob: Blob,
  resolution: ImageResolutionOption,
  originalWidth: number,
  originalHeight: number
): Promise<Blob> {
  if (resolution === 'original') {
    return blob;
  }

  const scale = parseInt(resolution.replace('x', ''));
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = originalWidth * scale;
      canvas.height = originalHeight * scale;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('无法创建 Canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((result) => {
        URL.revokeObjectURL(url);
        result ? resolve(result) : reject(new Error('分辨率调整失败'));
      }, blob.type);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
}
```

---

#### 2.2 文件名生成存在安全风险

**严重程度:** 高
**文件:** `/Users/muchao/code/image_analyzer/src/features/generation/lib/image-downloader.ts`

**问题描述:**
`generateFilename` 函数没有对文件名进行安全过滤，可能导致路径遍历攻击或文件名注入。

**当前代码:**
```typescript
function generateFilename(options: ImageSaveOptions): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const baseName = options.filename || `image_${timestamp}`;
  const extension = options.format === 'jpeg' ? 'jpg' : options.format;
  return `${baseName}.${extension}`;
}
```

**建议修复:**
```typescript
function generateFilename(options: ImageSaveOptions): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

  // 过滤特殊字符，防止路径遍历
  const sanitizedName = (options.filename || `image_${timestamp}`)
    .replace(/[^a-zA-Z0-9_\u4e00-\u9fa5-]/g, '')
    .slice(0, 100); // 限制长度

  const extension = options.format === 'jpeg' ? 'jpg' : options.format;
  return `${sanitizedName}.${extension}`;
}
```

---

#### 2.3 图片内容类型验证缺失

**严重程度:** 中
**文件:** `/Users/muchao/code/image_analyzer/src/features/generation/lib/image-downloader.ts`

**问题描述:**
下载图片后没有验证文件类型是否为图片，可能导致安全风险。

**当前代码:**
```typescript
const blob = await response.blob();
// 没有验证 blob.type
```

**建议修复:**
```typescript
const blob = await response.blob();

// 验证内容类型
const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
if (!validTypes.includes(blob.type)) {
  throw new Error('无效的图片格式');
}
```

---

#### 2.4 fetch 请求缺少超时和错误处理

**严重程度:** 中
**文件:** `/Users/muchao/code/image_analyzer/src/features/generation/lib/image-downloader.ts`

**问题描述:**
网络请求没有设置超时，可能导致无限等待。

**建议修复:**
```typescript
async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}
```

---

#### 2.5 批量下载缺少取消功能

**严重程度:** 中
**文件:** `/Users/muchao/code/image_analyzer/src/features/generation/lib/image-downloader.ts`

**问题描述:**
故事文档 AC2 要求支持取消批量操作，但当前实现没有提供取消机制。

**建议修复:**
添加 AbortController 支持取消功能:
```typescript
export async function downloadImagesAsZip(
  images: Array<{ url: string; options?: Partial<ImageSaveOptions> }>,
  onProgress?: (current: number, total: number, filename: string) => void,
  signal?: AbortSignal
): Promise<SaveResult> {
  if (signal?.aborted) {
    return { success: false, error: '操作已取消' };
  }

  // 在每个网络请求中传递 signal
  const response = await fetch(url, { signal });
  // ...
}
```

---

#### 2.6 批量下载错误处理不完善

**严重程度:** 中
**文件:** `/Users/muchao/code/image_analyzer/src/features/generation/lib/image-downloader.ts`

**问题描述:**
如果批量下载中某张图片失败，整个操作会失败，而不是记录失败的图片并继续。

**建议修复:**
```typescript
export async function downloadImagesAsZip(
  images: Array<{ url: string; options?: Partial<ImageSaveOptions> }>,
  onProgress?: (current: number, total: number, filename: string) => void
): Promise<SaveResult> {
  const failedImages: string[] = [];
  // ...
  try {
    const response = await fetch(url);
    if (!response.ok) {
      failedImages.push(url);
      onProgress?.(i + 1, images.length, filename);
      return { success: false, error: `部分图片下载失败: ${failedImages.join(', ')}` };
    }
    const blob = await response.blob();
    // ...
  } catch (error) {
    failedImages.push(url);
  }
  // ...
}
```

---

### 3. UI组件问题

#### 3.1 文件名输入缺少验证

**严重程度:** 中
**文件:** `/Users/muchao/code/image_analyzer/src/features/generation/components/SaveOptionsDialog/SaveOptionsDialog.tsx`

**问题描述:**
用户输入的文件名没有进行验证和清理，可能包含特殊字符导致保存失败。

**建议修复:**
```typescript
const handleFilenameChange = (value: string) => {
  // 只允许字母、数字、中文、下划线和连字符
  const sanitized = value.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5-]/g, '');
  setFilename(sanitized);
};

// 在 TextField 中使用
<TextField
  value={filename}
  onChange={(e) => handleFilenameChange(e.target.value)}
  // ...
/>
```

---

#### 3.2 对话框状态初始化问题

**严重程度:** 低
**文件:** `/Users/muchao/code/image_analyzer/src/features/generation/components/SaveOptionsDialog/SaveOptionsDialog.tsx`

**问题描述:**
当 `defaultFilename` 变化时，对话框状态不会更新。

**建议修复:**
添加 `useEffect` 监听默认值变化:
```typescript
useEffect(() => {
  if (open && defaultFilename) {
    setFilename(defaultFilename);
  }
}, [open, defaultFilename]);
```

---

#### 3.3 缺少移动端适配

**严重程度:** 中
**文件:** `/Users/muchao/code/image_analyzer/src/features/generation/components/SaveOptionsDialog/SaveOptionsDialog.tsx`

**问题描述:**
故事文档 AC5 要求移动端优化保存流程，但当前对话框在移动端体验不佳。

**建议修复:**
```typescript
<Dialog
  // ...
  fullScreen={isMobile}
  // 移动端使用底部弹出
  PaperProps={{
    className: 'ia-glass-card',
    sx: {
      // 移动端全屏显示
      ...(isMobile && {
        position: 'fixed',
        bottom: 0,
        margin: 0,
        borderRadius: '16px 16px 0 0',
      }),
    },
  }}
>
```

---

#### 3.4 缺少重试逻辑

**严重程度:** 中
**文件:** `/Users/muchao/code/image_analyzer/src/features/generation/components/SaveOptionsDialog/SaveOptionsDialog.tsx`

**问题描述:**
故事文档 AC4 和 AC8 要求保存失败显示错误提示和重试选项，但当前组件没有实现。

**建议添加:**
```typescript
const [saveError, setSaveError] = useState<string | null>(null);
const [retryCount, setRetryCount] = useState(0);

const handleSave = async () => {
  setSaveError(null);
  try {
    await onSave(options);
    onClose();
  } catch (error) {
    setSaveError(error instanceof Error ? error.message : '保存失败');
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
    }
  }
};

// 在 UI 中显示错误和重试按钮
{retryCount < 3 && saveError && (
  <Button onClick={handleSave}>
    重试 ({retryCount}/3)
  </Button>
)}
```

---

### 4. 缺失的功能实现

#### 4.1 历史记录保存功能 ✅ 已实现

**严重程度:** 已修复
**状态:** 已完成

**实现内容:**
- 类型定义: `src/features/generation/types/history.ts`
- 服务层: `src/features/generation/lib/image-history-service.ts`
- 客户端: `src/features/generation/lib/image-history-client.ts`
- API 路由:
  - `GET /api/history/generations` - 获取用户图片历史列表
  - `GET /api/history/generations/[id]` - 获取单条历史记录详情
  - `DELETE /api/history/generations/[id]` - 删除历史记录
- 单元测试: `src/features/generation/lib/image-history-service.test.ts` (10 个测试全部通过)

**注意:** 批量保存进度对话框已按要求移除，用户不需要这个功能。

---

#### 4.2 批量保存进度对话框 ✅ 已移除

**严重程度:** N/A
**状态:** 按用户要求移除

用户已明确表示批量保存进度对话框不需要移除，此功能已从待办事项中移除。

---

#### 4.3 移动端保存菜单

**严重程度:** 中
**文件:** 未实现

**问题描述:**
故事文档 AC5 要求移动端长按显示保存选项、保存到相册、分享功能，但没有实现 `MobileSaveMenu` 组件。

**需要实现:**
- `src/features/generation/components/MobileSaveMenu/`
- iOS 原生保存 API 集成
- Android 原生保存 API 集成

---

#### 4.4 保存状态管理 Store

**严重程度:** 中
**文件:** 未实现

**问题描述:**
故事文档提到需要创建 `useImageSaveStore` 来管理保存状态，但没有实现。

**需要实现:**
- `src/features/generation/stores/image-save.store.ts`

---

### 5. 测试覆盖问题

#### 5.1 缺少单元测试

**严重程度:** 高

**问题描述:**
保存功能没有任何单元测试文件。根据故事文档 Task 9，需要测试:
- 图片下载功能
- 格式转换功能
- 批量下载功能
- 历史记录保存功能

**建议添加测试文件:**
- `src/features/generation/lib/image-downloader.test.ts`
- `src/features/generation/lib/history-saver.test.ts`

---

## 总结与建议

### 实现完成度评估

| 功能 | 完成度 |
|-----|-------|
| 类型定义 | 90% |
| 图片下载 | 50% |
| 格式转换 | 60% |
| 批量下载 | 40% |
| 历史记录保存 | 90% ✅ 已实现 |
| UI 对话框 | 60% |
| 移动端适配 | 0% |
| 测试覆盖 | 30% (历史记录功能已完成) |

### 更新内容 (2026-02-21)

**已完成:**
1. 移除微信二维码生成功能，改为复制链接方式
2. 实现历史记录保存功能:
   - 类型定义、服务层、客户端函数
   - API 路由 (列表、详情、删除)
   - 10 个单元测试全部通过

**移除功能:**
- 批量保存进度对话框 (按用户要求)

### 优先修复建议

1. **高优先级:**
   - 添加分辨率调整功能 (2.1)
   - 修复文件名安全问题 (2.2)
   - 实现历史记录保存功能 (4.1)
   - 添加单元测试 (5.1)

2. **中优先级:**
   - 添加图片内容类型验证 (2.3)
   - 添加网络请求超时 (2.4)
   - 实现批量下载取消功能 (2.5)
   - 实现批量保存进度对话框 (4.2)

3. **低优先级:**
   - 完善错误处理和重试逻辑 (3.4)
   - 移动端适配 (3.3)
   - 对话框状态初始化 (3.2)

---

## 后续步骤

1. 修复上述安全问题和高优先级问题
2. 实现缺失的功能模块
3. 添加单元测试和集成测试
4. 进行 E2E 测试验证完整流程
