/**
 * 生成图片画廊组件
 * Story 7-3: 模版使用分析和统计 - 查看生成图片历史
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Clock, Download } from 'lucide-react';

interface Generation {
  id: number;
  imageUrl: string;
  createdAt: Date;
}

interface GenerationGalleryProps {
  generations: Generation[];
  templateTitle?: string;
}

export function GenerationGallery({ generations, templateTitle }: GenerationGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (generations.length === 0) {
    return (
      <div className="ia-glass-card rounded-lg p-6">
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <p>暂无生成图片</p>
          <p className="text-sm mt-2">使用此模版生成图片后，这里将显示所有历史记录</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="ia-glass-card rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          生成图片历史 {templateTitle && `(${templateTitle})`}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {generations.map((generation) => (
            <div
              key={generation.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
              onClick={() => setSelectedImage(generation.imageUrl)}
            >
              <Image
                src={generation.imageUrl}
                alt={`Generation ${generation.id}`}
                fill
                className="object-cover transition-transform group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                  <Clock size={16} className="mx-auto mb-1" />
                  <p className="text-xs">{formatRelativeTime(generation.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          共 {generations.length} 张图片
        </p>
      </div>

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            <a
              href={selectedImage}
              download
              className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={20} />
            </a>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} 天前`;
  if (hours > 0) return `${hours} 小时前`;
  if (minutes > 0) return `${minutes} 分钟前`;
  return '刚刚';
}
