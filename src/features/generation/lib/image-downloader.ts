/**
 * 图片下载功能
 */

import { ImageFormat, ImageSaveOptions, SaveResult } from '../types/save';
import { DEFAULT_SAVE_OPTIONS } from './save-constants';

// 允许的图片类型
const VALID_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// 超时时间（毫秒）
const FETCH_TIMEOUT = 10000;

/**
 * 带超时的 fetch 封装
 */
async function fetchWithTimeout(
  url: string,
  timeout: number = FETCH_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * 下载单张图片
 */
export async function downloadImage(
  imageUrl: string,
  options: Partial<ImageSaveOptions> = {}
): Promise<SaveResult> {
  const fullOptions: ImageSaveOptions = {
    ...DEFAULT_SAVE_OPTIONS,
    ...options,
  };

  try {
    // 获取图片（带超时）
    const response = await fetchWithTimeout(imageUrl);
    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`);
    }

    const blob = await response.blob();

    // 验证图片内容类型
    if (!VALID_IMAGE_TYPES.includes(blob.type)) {
      throw new Error('无效的图片格式，仅支持 PNG、JPEG、WebP');
    }

    // 获取原始尺寸用于分辨率调整
    const dimensions = await getImageDimensions(blob);

    // 转换格式并调整分辨率
    const convertedBlob = await convertImageFormat(blob, fullOptions, dimensions);
    const finalBlob = await resizeImage(convertedBlob, fullOptions.resolution);

    // 生成安全的文件名
    const filename = generateFilename(fullOptions);

    // 保存文件
    const url = URL.createObjectURL(finalBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (error) {
    // 处理取消错误
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: '下载超时，请检查网络连接' };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 转换图片格式
 */
async function convertImageFormat(
  blob: Blob,
  options: ImageSaveOptions,
  dimensions: { width: number; height: number }
): Promise<Blob> {
  // 如果是 PNG 且不需要转换,直接返回
  if (options.format === 'png' && blob.type === 'image/png') {
    return blob;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('无法创建 Canvas'));
        return;
      }

      // 设置画布尺寸
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // 绘制图片
      ctx.drawImage(img, 0, 0);

      // 转换为指定格式
      canvas.toBlob(
        (resultBlob) => {
          URL.revokeObjectURL(url);
          if (resultBlob) {
            resolve(resultBlob);
          } else {
            reject(new Error('格式转换失败'));
          }
        },
        `image/${options.format}`,
        options.quality ? options.quality / 100 : undefined
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
}

/**
 * 获取图片尺寸
 */
async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法获取图片尺寸'));
    };

    img.src = url;
  });
}

/**
 * 调整图片分辨率
 */
async function resizeImage(
  blob: Blob,
  resolution: ImageSaveOptions['resolution']
): Promise<Blob> {
  if (resolution === 'original') {
    return blob;
  }

  const scaleMap: Record<string, number> = {
    '1x': 1,
    '2x': 2,
    '4x': 4,
  };

  const scale = scaleMap[resolution];
  if (!scale) {
    return blob;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('无法创建 Canvas'));
        return;
      }

      // 计算新的尺寸
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // 使用高质量插值
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (result) => {
          URL.revokeObjectURL(url);
          if (result) {
            resolve(result);
          } else {
            reject(new Error('分辨率调整失败'));
          }
        },
        blob.type
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
}

/**
 * 生成安全的文件名
 */
function generateFilename(options: ImageSaveOptions): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

  // 过滤特殊字符，防止路径遍历和注入
  // 只允许字母、数字、中文、下划线和连字符
  const sanitizedName = (options.filename || `image_${timestamp}`)
    .replace(/[^a-zA-Z0-9_\u4e00-\u9fa5-]/g, '')
    .slice(0, 100); // 限制文件名长度

  // 确保文件名不为空
  const finalName = sanitizedName || `image_${timestamp}`;

  const extension = options.format === 'jpeg' ? 'jpg' : options.format;
  return `${finalName}.${extension}`;
}

/**
 * 批量下载图片为 ZIP
 * 支持取消操作和错误处理
 */
export async function downloadImagesAsZip(
  images: Array<{ url: string; options?: Partial<ImageSaveOptions> }>,
  onProgress?: (current: number, total: number, filename: string) => void,
  signal?: AbortSignal
): Promise<SaveResult> {
  // 检查是否已取消
  if (signal?.aborted) {
    return { success: false, error: '操作已取消' };
  }

  const failedImages: string[] = [];

  try {
    // 动态导入 JSZip(减少初始加载)
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (let i = 0; i < images.length; i++) {
      // 检查是否已取消
      if (signal?.aborted) {
        return {
          success: false,
          error: '操作已取消',
          // 返回部分成功信息
          failedCount: failedImages.length,
          successCount: i - failedImages.length,
        };
      }

      const { url, options: imgOptions } = images[i];

      try {
        // 下载图片（带超时）
        const response = await fetchWithTimeout(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();

        // 验证图片内容类型
        if (!VALID_IMAGE_TYPES.includes(blob.type)) {
          throw new Error('无效的图片格式');
        }

        // 获取尺寸
        const dimensions = await getImageDimensions(blob);

        // 转换格式和调整分辨率
        const finalOptions = { ...DEFAULT_SAVE_OPTIONS, ...imgOptions };
        const convertedBlob = await convertImageFormat(blob, finalOptions, dimensions);
        const resizedBlob = await resizeImage(convertedBlob, finalOptions.resolution);

        // 生成文件名
        const filename = generateFilename({ ...finalOptions, filename: `image_${i + 1}` });

        // 添加到 ZIP
        zip.file(filename, resizedBlob);
      } catch (error) {
        // 记录失败图片但继续处理
        failedImages.push(url);
        console.warn(`图片下载失败: ${url}`, error);
      }

      // 更新进度
      onProgress?.(i + 1, images.length, `image_${i + 1}`);
    }

    // 如果所有图片都失败
    if (failedImages.length === images.length) {
      return {
        success: false,
        error: '所有图片下载失败',
        failedCount: failedImages.length,
      };
    }

    // 生成 ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // 生成安全的ZIP文件名
    const zipFilename = generateFilename({
      format: ImageFormat.PNG, // 使用默认格式
      resolution: 'original',
      filename: `images_${Date.now()}`,
    }).replace(/\.[^.]+$/, '.zip');

    // 下载 ZIP
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 返回结果，包含部分成功信息
    const successCount = images.length - failedImages.length;
    return {
      success: true,
      filename: zipFilename,
      successCount,
      failedCount: failedImages.length,
      failedImages: failedImages.length > 0 ? failedImages : undefined,
    };
  } catch (error) {
    // 处理取消错误
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: '下载超时，请检查网络连接',
        successCount: images.length - failedImages.length,
        failedCount: failedImages.length,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      successCount: images.length - failedImages.length,
      failedCount: failedImages.length,
    };
  }
}
