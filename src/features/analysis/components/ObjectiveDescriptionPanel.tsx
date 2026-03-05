'use client';

/**
 * Objective Description Panel
 *
 * Story 1.3: 生成完整结构化客观描述结果
 *
 * 职责：
 * - 展示客观描述结果
 * - 明确区分确定字段与 unknown 字段
 * - 满足 WCAG 2.1 AA 可读性要求
 */

import React from 'react';
import type { ObjectiveDescription } from '@/lib/analysis-ir/schemas/objective-description';

/**
 * 组件属性
 */
export interface ObjectiveDescriptionPanelProps {
  /** 客观描述数据 */
  data: ObjectiveDescription;
  /** 是否显示详细的不确定信息 */
  showUncertaintyDetails?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 不确定字段标记组件
 */
function UncertaintyBadge({
  fieldPath,
  reason,
  confidence,
}: {
  fieldPath: string;
  reason: string;
  confidence: number;
}) {
  return (
    <li
      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 py-1"
      role="listitem"
    >
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
        aria-label={`不确定字段: ${fieldPath}`}
      >
        <span aria-hidden="true">⚠️</span>
        <span className="sr-only">不确定:</span>
        {fieldPath}
      </span>
      <span className="flex-1">{reason}</span>
      <span
        className="text-xs text-gray-500 dark:text-gray-500"
        aria-label={`置信度: ${Math.round(confidence * 100)}%`}
      >
        ({Math.round(confidence * 100)}% 置信)
      </span>
    </li>
  );
}

/**
 * 可见内容展示组件
 */
function VisibleContentSection({
  visible_content,
  uncertainty_fields,
}: {
  visible_content: ObjectiveDescription['visible_content'];
  uncertainty_fields: ObjectiveDescription['uncertainty_fields'];
}) {
  // 检查字段是否不确定
  const isUncertain = (fieldPath: string) =>
    uncertainty_fields.some((uf) => uf.field_path === fieldPath);

  return (
    <section aria-labelledby="visible-content-heading" className="space-y-4">
      <h2
        id="visible-content-heading"
        className="text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        可见内容
      </h2>

      {/* 主要主体 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          主要主体
        </h3>
        <ul
          className="flex flex-wrap gap-2"
          role="list"
          aria-label="图片中的主要对象"
        >
          {visible_content.primary_subjects.map((subject, index) => (
            <li
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-medium"
            >
              {subject}
            </li>
          ))}
        </ul>
      </div>

      {/* 次要元素 */}
      {visible_content.secondary_elements &&
        visible_content.secondary_elements.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              次要元素
            </h3>
            <ul
              className="flex flex-wrap gap-2"
              role="list"
              aria-label="图片中的次要对象"
            >
              {visible_content.secondary_elements.map((element, index) => (
                <li
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm"
                >
                  {element}
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* 场景设置 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          场景设置
        </h3>
        <p className="text-gray-900 dark:text-gray-100">{visible_content.setting}</p>
      </div>

      {/* 动作/活动 */}
      {visible_content.actions && visible_content.actions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            动作/活动
          </h3>
          <ul
            className="space-y-1"
            role="list"
            aria-label="检测到的动作或活动"
          >
            {visible_content.actions.map((action, index) => (
              <li
                key={index}
                className="text-gray-900 dark:text-gray-100 flex items-center gap-2"
              >
                <span aria-hidden="true">→</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 文本内容 */}
      {visible_content.text_content && visible_content.text_content.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            文本内容
          </h3>
          <ul
            className="space-y-1"
            role="list"
            aria-label="图片中检测到的文本"
          >
            {visible_content.text_content.map((text, index) => (
              <li
                key={index}
                className="text-gray-900 dark:text-gray-100 italic"
              >
                &quot;{text}&quot;
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/**
 * 成像特征展示组件
 */
function ImagingFeaturesSection({
  imaging_features,
  uncertainty_fields,
}: {
  imaging_features: ObjectiveDescription['imaging_features'];
  uncertainty_fields: ObjectiveDescription['uncertainty_fields'];
}) {
  return (
    <section aria-labelledby="imaging-features-heading" className="space-y-4">
      <h2
        id="imaging-features-heading"
        className="text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        摄影/成像特征
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 成像技术 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            成像技术
          </h3>
          <p className="text-gray-900 dark:text-gray-100">
            {imaging_features.technique}
          </p>
        </div>

        {/* 光照类型 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            光照类型
          </h3>
          <p className="text-gray-900 dark:text-gray-100">
            {imaging_features.lighting}
          </p>
        </div>

        {/* 构图方式 */}
        {imaging_features.composition && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              构图方式
            </h3>
            <p className="text-gray-900 dark:text-gray-100">
              {imaging_features.composition}
            </p>
          </div>
        )}

        {/* 视角 */}
        {imaging_features.perspective && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              视角
            </h3>
            <p className="text-gray-900 dark:text-gray-100">
              {imaging_features.perspective}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * 不确定字段展示组件
 */
function UncertaintyFieldsSection({
  uncertainty_fields,
}: {
  uncertainty_fields: ObjectiveDescription['uncertainty_fields'];
}) {
  if (uncertainty_fields.length === 0) {
    return (
      <section
        aria-labelledby="uncertainty-heading"
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
      >
        <h2
          id="uncertainty-heading"
          className="text-sm font-medium text-green-900 dark:text-green-100 mb-2"
        >
          ✅ 高置信度分析
        </h2>
        <p className="text-sm text-green-800 dark:text-green-200">
          所有字段均已可靠识别，未发现不确定项。
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="uncertainty-heading"
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
    >
      <h2
        id="uncertainty-heading"
        className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-3"
      >
        ⚠️ 不确定字段 ({uncertainty_fields.length})
      </h2>
      <ul
        role="list"
        className="space-y-1"
        aria-label="不确定字段列表"
      >
        {uncertainty_fields.map((field, index) => (
          <UncertaintyBadge
            key={index}
            fieldPath={field.field_path}
            reason={field.reason}
            confidence={field.confidence}
          />
        ))}
      </ul>
    </section>
  );
}

/**
 * Objective Description Panel 主组件
 */
export function ObjectiveDescriptionPanel({
  data,
  showUncertaintyDetails = true,
  className = '',
}: ObjectiveDescriptionPanelProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      role="region"
      aria-label="客观描述结果"
    >
      {/* 整体置信度 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            客观描述结果
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            基于可见事实的图像分析
          </p>
        </div>
        <div
          className="text-right"
          aria-label={`整体置信度: ${Math.round(data.overall_confidence * 100)}%`}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            整体置信度
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Math.round(data.overall_confidence * 100)}%
          </div>
        </div>
      </div>

      {/* 可见内容 */}
      <VisibleContentSection
        visible_content={data.visible_content}
        uncertainty_fields={data.uncertainty_fields}
      />

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      {/* 成像特征 */}
      <ImagingFeaturesSection
        imaging_features={data.imaging_features}
        uncertainty_fields={data.uncertainty_fields}
      />

      {/* 不确定字段 */}
      {showUncertaintyDetails && (
        <>
          <hr className="my-6 border-gray-200 dark:border-gray-700" />
          <UncertaintyFieldsSection uncertainty_fields={data.uncertainty_fields} />
        </>
      )}
    </div>
  );
}

/**
 * 默认导出
 */
export default ObjectiveDescriptionPanel;
