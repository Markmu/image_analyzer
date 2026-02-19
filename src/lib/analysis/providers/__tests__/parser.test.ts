/**
 * Response normalization function tests
 *
 * Tech-Spec: 图片分析模型 Provider 抽象与阿里百炼接入
 * 测试不同 provider 的响应格式规范化
 */

import { describe, it, expect, vi } from 'vitest';
import {
  normalizeProviderResponse,
  normalizeReplicateResponse,
  normalizeAliyunResponse,
} from '@/lib/analysis/parser';

describe('normalizeReplicateResponse', () => {
  it('should clean standard JSON response', () => {
    const input = '{"dimensions": {"lighting": {"name": "光影"}}}';
    const output = normalizeReplicateResponse(input);
    expect(output).toBe('{"dimensions": {"lighting": {"name": "光影"}}}');
  });

  it('should remove markdown code blocks', () => {
    const input = '```json\n{"dimensions": {"lighting": {"name": "光影"}}}\n```';
    const output = normalizeReplicateResponse(input);
    expect(output).toBe('{"dimensions": {"lighting": {"name": "光影"}}}');
  });

  it('should remove extra whitespace', () => {
    const input = '{  "dimensions"  :  {  "lighting"  :  {  "name"  :  "光影"  }  }  }';
    const output = normalizeReplicateResponse(input);
    expect(output).toBe('{ "dimensions" : { "lighting" : { "name" : "光影" } } }');
  });

  it('should handle response without markdown blocks', () => {
    const input = '{"test": "value"}';
    const output = normalizeReplicateResponse(input);
    expect(output).toBe('{"test": "value"}');
  });

  it('should warn if response does not look like JSON', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const input = 'This is not JSON';
    const output = normalizeReplicateResponse(input);
    expect(output).toBe('This is not JSON');
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });
});

describe('normalizeAliyunResponse', () => {
  it('should clean standard JSON response', () => {
    const input = '{"dimensions": {"lighting": {"name": "光影"}}}';
    const output = normalizeAliyunResponse(input);
    // normalizeAliyunResponse removes whitespace around punctuation
    expect(output).toBe('{"dimensions":{"lighting":{"name":"光影"}}}');
  });

  it('should remove markdown code blocks', () => {
    const input = '```json\n{"dimensions": {"lighting": {"name": "光影"}}}\n```';
    const output = normalizeAliyunResponse(input);
    expect(output).toBe('{"dimensions":{"lighting":{"name":"光影"}}}');
  });

  it('should replace Chinese punctuation with English', () => {
    const input = '{"name"："测试"，"value"："数据"}';
    const output = normalizeAliyunResponse(input);
    expect(output).toBe('{"name":"测试","value":"数据"}');
  });

  it('should replace Chinese quotes with English quotes', () => {
    const input = '{"name":"测试"value","desc":"描述"}';
    const output = normalizeAliyunResponse(input);
    expect(output).toBe('{"name":"测试"value","desc":"描述"}');
  });

  it('should replace Chinese colon with English colon', () => {
    const input = '{"name"："test"}';
    const output = normalizeAliyunResponse(input);
    expect(output).toBe('{"name":"test"}');
  });

  it('should remove excessive line breaks', () => {
    const input = '{\n\n\n"test": "value"\n\n\n}';
    const output = normalizeAliyunResponse(input);
    // normalizeAliyunResponse removes all extra whitespace around punctuation
    expect(output).toBe('{"test":"value"}');
  });

  it('should remove whitespace around punctuation', () => {
    const input = '{ "test" : "value" , "num" : 123 }';
    const output = normalizeAliyunResponse(input);
    expect(output).toBe('{"test":"value","num":123}');
  });

  it('should warn if response does not look like JSON', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const input = 'This is not JSON';
    const output = normalizeAliyunResponse(input);
    expect(output).toBe('This is not JSON');
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });
});

describe('normalizeProviderResponse', () => {
  it('should route to Replicate normalizer', () => {
    const input = '{"test": "value"}';
    const output = normalizeProviderResponse(input, 'replicate');
    expect(output).toBe('{"test": "value"}');
  });

  it('should route to Aliyun normalizer', () => {
    const input = '{"test"："value"}';
    const output = normalizeProviderResponse(input, 'aliyun');
    expect(output).toBe('{"test":"value"}');
  });

  it('should throw TypeError for unknown provider', () => {
    const input = '{"test": "value"}';
    // @ts-expect-error - Testing invalid provider
    expect(() => normalizeProviderResponse(input, 'unknown')).toThrow(TypeError);
  });
});
