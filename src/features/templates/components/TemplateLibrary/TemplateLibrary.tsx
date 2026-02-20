/**
 * Template Library Component
 *
 * Epic 7 - Story 7.2: Template Library
 *
 * H3: UI 组件占位符
 *
 * 已知限制：
 * - 这是一个占位符组件，仅提供基本结构
 * - 完整的 UI 实现需要包括：
 *   - 模版列表视图（网格/列表切换）
 *   - 搜索和过滤面板
 *   - 模版卡片组件
 *   - 加载状态和错误处理
 *   - 分页组件
 *   - 收藏功能
 *   - 删除确认对话框
 * - 需要与真实的 API 集成
 * - 需要添加完整的样式和响应式设计
 */

'use client';

import React from 'react';

interface TemplateLibraryProps {
  userId: string;
}

export function TemplateLibrary({ userId }: TemplateLibraryProps) {
  return (
    <div className="template-library-container">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">模版库</h1>

        {/* 占位符：搜索和过滤面板 */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-center">
            搜索和过滤面板占位符
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            功能包括：搜索框、标签过滤、分类过滤、排序选项
          </p>
        </div>

        {/* 占位符：模版列表 */}
        <div className="mb-6 p-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-center">
            模版列表占位符
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            功能包括：网格/列表视图切换、模版卡片、加载状态
          </p>
        </div>

        {/* 占位符：分页 */}
        <div className="p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-center">
            分页组件占位符
          </p>
        </div>

        {/* 开发说明 */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">
            开发说明
          </h3>
          <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
            <li>这是模版库的占位符组件</li>
            <li>需要实现完整的 UI 和交互逻辑</li>
            <li>需要集成 API：GET /api/templates</li>
            <li>参考设计文档中的 UI 原型</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
