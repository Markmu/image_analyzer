/**
 * 图片下载功能
 */

import { ImageSaveOptions, SaveResult } from '../types/save';
import { DEFAULT_SAVE_OPTIONS } from './save-constants';

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
    // 获取图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`);
    }

    const blob = await response.blob();

    // 转换格式(如果需要)
    const finalBlob = await convertImageFormat(blob, fullOptions);

    // 生成文件名
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
  options: ImageSaveOptions
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
      canvas.width = img.width;
      canvas.height = img.height;

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
 * 生成文件名
 */
function generateFilename(options: ImageSaveOptions): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const baseName = options.filename || `image_${timestamp}`;
  const extension = options.format === 'jpeg' ? 'jpg' : options.format;
  return `${baseName}.${extension}`;
}

/**
 * 批量下载图片为 ZIP
 */
export async function downloadImagesAsZip(
  images: Array<{ url: string; options?: Partial<ImageSaveOptions> }>,
  onProgress?: (current: number, total: number, filename: string) => void
): Promise<SaveResult> {
  try {
    // 动态导入 JSZip(减少初始加载)
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (let i = 0; i < images.length; i++) {
      const { url, options: imgOptions } = images[i];

      // 下载图片
      const response = await fetch(url);
      const blob = await response.blob();

      // 转换格式
      const finalOptions = { ...DEFAULT_SAVE_OPTIONS, ...imgOptions };
      const finalBlob = await convertImageFormat(blob, finalOptions);

      // 生成文件名
      const filename = generateFilename({ ...finalOptions, filename: `image_${i + 1}` });

      // 添加到 ZIP
      zip.file(filename, finalBlob);

      // 更新进度
      onProgress?.(i + 1, images.length, filename);
    }

    // 生成 ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // 下载 ZIP
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `images_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, filename: link.download };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}
