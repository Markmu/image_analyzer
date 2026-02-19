/**
 * Provider Router Error Types
 *
 * Tech-Spec: 图片分析模型 Provider 抽象与阿里百炼接入
 * 自定义错误类型，用于 Provider 路由和模型查找
 */

/**
 * 模型未找到错误
 *
 * 当尝试使用不存在的模型 ID 时抛出
 */
export class ModelNotFoundError extends Error {
  constructor(modelId: string) {
    super(`Model not found: ${modelId}`);
    this.name = 'ModelNotFoundError';
  }
}

/**
 * 未知 Provider 错误
 *
 * 当模型配置的 provider 字段不是支持的值时抛出
 */
export class UnknownProviderError extends TypeError {
  constructor(provider: string) {
    super(`Unknown provider: ${provider}. Valid providers: 'replicate', 'aliyun'`);
    this.name = 'UnknownProviderError';
  }
}
