'use client';

/**
 * 批量分析结果对比视图
 *
 * AC-5: 结果对比视图
 * AC-8: 错误处理 UI
 */

import React from 'react';

interface StyleFeature {
  name: string;
  value: string;
  confidence: number;
}

interface StyleDimension {
  name: string;
  features: StyleFeature[];
  confidence: number;
}

interface AnalysisData {
  dimensions: {
    lighting: StyleDimension;
    composition: StyleDimension;
    color: StyleDimension;
    artisticStyle: StyleDimension;
  };
  overallConfidence: number;
  modelUsed: string;
  analysisDuration: number;
}

interface ImageAnalysisResult {
  imageId: string;
  imageUrl?: string;
  status: 'completed' | 'failed' | 'skipped';
  analysisData?: AnalysisData;
  error?: string;
}

interface CommonFeature {
  dimension: string;
  features: StyleFeature[];
  confidence: number;
}

interface UniqueFeature {
  dimension: string;
  features: { feature: StyleFeature; sourceImages: string[] }[];
}

interface ComprehensiveAnalysis {
  commonFeatures: CommonFeature[];
  uniqueFeatures: UniqueFeature[];
  overallConfidence: number;
}

interface BatchAnalysisResultProps {
  results: ImageAnalysisResult[];
  commonFeatures?: ComprehensiveAnalysis;
  onRetry?: (failedImageIds: string[]) => void;
}

export function BatchAnalysisResult({
  results,
  commonFeatures,
  onRetry,
}: BatchAnalysisResultProps) {
  // 分离成功、失败和跳过的结果
  const completedResults = results.filter((r) => r.status === 'completed');
  const failedResults = results.filter((r) => r.status === 'failed');
  const skippedResults = results.filter((r) => r.status === 'skipped');

  // 处理重试
  const handleRetry = () => {
    const failedImageIds = failedResults.map((r) => r.imageId);
    onRetry?.(failedImageIds);
  };

  // 获取维度显示名称
  const getDimensionLabel = (dimension: string): string => {
    const labels: Record<string, string> = {
      lighting: '光影',
      composition: '构图',
      color: '色彩',
      artisticStyle: '艺术风格',
    };
    return labels[dimension] || dimension;
  };

  return (
    <div className="batch-analysis-result" data-testid="batch-analysis-result">
      {/* 结果摘要 */}
      <div className="result-summary">
        <div className="summary-item success">
          <span className="summary-count">{completedResults.length}</span>
          <span className="summary-label">成功</span>
        </div>
        {failedResults.length > 0 && (
          <div className="summary-item failed">
            <span className="summary-count">{failedResults.length}</span>
            <span className="summary-label">失败</span>
          </div>
        )}
        {skippedResults.length > 0 && (
          <div className="summary-item skipped">
            <span className="summary-count">{skippedResults.length}</span>
            <span className="summary-label">跳过</span>
          </div>
        )}
      </div>

      {/* 每张图片的分析结果卡片 */}
      <div className="result-cards" data-testid="analysis-result-cards">
        {completedResults.map((result, index) => (
          <div key={result.imageId} className="result-card" data-testid={`analysis-result-card-${index}`}>
            <div className="card-header">
              <h4>图片 {index + 1}</h4>
              {result.analysisData && (
                <span className="confidence-badge">
                  {Math.round(result.analysisData.overallConfidence * 100)}%
                </span>
              )}
            </div>

            {result.analysisData && (
              <div className="card-content">
                {Object.entries(result.analysisData.dimensions).map(([key, dimension]) => {
                  const isCommon = commonFeatures?.commonFeatures.some(
                    (cf) => cf.dimension === key
                  );
                  const isUnique = commonFeatures?.uniqueFeatures.some(
                    (uf) => uf.dimension === key
                  );

                  return (
                    <div
                      key={key}
                      className={`dimension-section ${isCommon ? 'common' : ''} ${isUnique ? 'unique' : ''}`}
                      data-testid={`dimension-${key}`}
                      style={{
                        borderColor: isCommon
                          ? 'rgb(34, 197, 94)'
                          : isUnique
                            ? 'rgb(59, 130, 246)'
                            : undefined,
                      }}
                    >
                      <div className="dimension-header">
                        <span className="dimension-name">{getDimensionLabel(key)}</span>
                        {isCommon && (
                          <span className="feature-badge common" data-testid="common-features">
                            共同特征
                          </span>
                        )}
                        {isUnique && (
                          <span className="feature-badge unique" data-testid="unique-features">
                            独特特征
                          </span>
                        )}
                      </div>
                      <div className="dimension-features">
                        {dimension.features.map((feature, fIndex) => (
                          <div key={fIndex} className="feature-item">
                            <span className="feature-value">{feature.value}</span>
                            <span className="feature-confidence">
                              {Math.round(feature.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 失败图片列表 */}
      {failedResults.length > 0 && (
        <div className="failed-images" data-testid="failed-images">
          <h4>失败图片</h4>
          <ul>
            {failedResults.map((result) => (
              <li key={result.imageId}>
                <span>图片 {result.imageId}</span>
                <span className="error-message">{result.error}</span>
              </li>
            ))}
          </ul>
          <button
            className="retry-button"
            onClick={handleRetry}
            data-testid="retry-failed-button"
          >
            重试失败图片
          </button>
        </div>
      )}

      {/* 跳过的图片列表 */}
      {skippedResults.length > 0 && (
        <div className="skipped-images" data-testid="skipped-images">
          <h4>未通过审核的图片</h4>
          <ul>
            {skippedResults.map((result) => (
              <li key={result.imageId}>
                <span>图片 {result.imageId}</span>
                <span className="skip-reason">{result.error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 综合分析结果卡片 */}
      {commonFeatures && completedResults.length >= 2 && (
        <div className="combined-result-card" data-testid="combined-result-card">
          <h3>综合分析结果</h3>

          {/* 共同特征 */}
          {commonFeatures.commonFeatures.length > 0 && (
            <div className="combined-section common">
              <h4>共同特征</h4>
              <div className="combined-features">
                {commonFeatures.commonFeatures.map((dim, index) => (
                  <div key={index} className="combined-dimension">
                    <span className="dimension-label">{getDimensionLabel(dim.dimension)}:</span>
                    <div className="feature-tags">
                      {dim.features.map((feature, fIndex) => (
                        <span
                          key={fIndex}
                          className="feature-tag common"
                          style={{
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          }}
                        >
                          {feature.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 独特特征 */}
          {commonFeatures.uniqueFeatures.length > 0 && (
            <div className="combined-section unique">
              <h4>独特特征</h4>
              <div className="combined-features">
                {commonFeatures.uniqueFeatures.map((dim, index) => (
                  <div key={index} className="combined-dimension">
                    <span className="dimension-label">{getDimensionLabel(dim.dimension)}:</span>
                    <div className="feature-tags">
                      {dim.features.map((item, fIndex) => (
                        <span
                          key={fIndex}
                          className="feature-tag unique"
                          style={{
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          }}
                          title={`来自: ${item.sourceImages.join(', ')}`}
                        >
                          {item.feature.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 整体置信度 */}
          <div className="overall-confidence">
            <span>整体置信度:</span>
            <span className="confidence-value">
              {Math.round(commonFeatures.overallConfidence * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default BatchAnalysisResult;
