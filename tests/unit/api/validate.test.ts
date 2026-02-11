/**
 * API Validation Endpoint Tests
 *
 * Tests for /api/validate endpoint
 * Validates AC-4: API-based deep validation
 */

import { POST } from '@/app/api/validate/route';
import { NextRequest } from 'next/server';

// Mock Replicate vision module
vi.mock('@/lib/replicate/vision', () => ({
  validateImageComplexity: vi.fn(),
}));

import { validateImageComplexity } from '@/lib/replicate/vision';

describe('/api/validate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/validate', () => {
    it('should return validation success for simple image', async () => {
      const mockAnalysis = {
        subjectCount: 1,
        complexity: 'low' as const,
        confidence: 0.9,
        reason: '图片清晰，主体单一',
      };

      vi.mocked(validateImageComplexity).mockResolvedValueOnce(mockAnalysis);

      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/image.jpg',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(true);
      expect(data.data.errors).toEqual([]);
      expect(data.data.warnings).toEqual([]);
      expect(data.data.analysis).toEqual(mockAnalysis);
      expect(validateImageComplexity).toHaveBeenCalledWith('https://example.com/image.jpg');
    });

    it('should return warning for complex image with many subjects', async () => {
      const mockAnalysis = {
        subjectCount: 7,
        complexity: 'high' as const,
        confidence: 0.7,
        reason: '图片包含多个主体',
      };

      vi.mocked(validateImageComplexity).mockResolvedValueOnce(mockAnalysis);

      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/complex.jpg',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(true);
      expect(data.data.warnings).toHaveLength(2);
      expect(data.data.warnings[0].code).toBe('COMPLEX_SCENE');
      expect(data.data.warnings[0].message).toContain('多个主体');
      expect(data.data.analysis).toEqual(mockAnalysis);
    });

    it('should return warning for low confidence', async () => {
      const mockAnalysis = {
        subjectCount: 2,
        complexity: 'medium' as const,
        confidence: 0.5,
        reason: '图片质量一般',
      };

      vi.mocked(validateImageComplexity).mockResolvedValueOnce(mockAnalysis);

      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/medium.jpg',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.valid).toBe(true);
      expect(data.data.warnings).toHaveLength(1);
      expect(data.data.warnings[0].code).toBe('LOW_CONFIDENCE');
      expect(data.data.warnings[0].message).toContain('可能不适合分析');
      expect(data.data.warnings[0].confidence).toBe(0.5);
    });

    it('should return error for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_JSON');
    });

    it('should return error for missing imageUrl', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('imageUrl');
    });

    it('should return error for invalid URL format', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'not-a-valid-url',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_URL');
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(validateImageComplexity).mockRejectedValueOnce(
        new Error('API call failed')
      );

      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/error.jpg',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept empty imageUrl as validation error', async () => {
      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: '',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle edge case: exactly 5 subjects', async () => {
      const mockAnalysis = {
        subjectCount: 5,
        complexity: 'medium' as const,
        confidence: 0.75,
        reason: '图片包含 5 个主体',
      };

      vi.mocked(validateImageComplexity).mockResolvedValueOnce(mockAnalysis);

      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/five-subjects.jpg',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.valid).toBe(true);
      // 5 subjects is the threshold, should not trigger warning
      expect(data.data.warnings).toHaveLength(0);
    });

    it('should handle edge case: confidence exactly 0.6', async () => {
      const mockAnalysis = {
        subjectCount: 1,
        complexity: 'low' as const,
        confidence: 0.6,
        reason: '图片质量尚可',
      };

      vi.mocked(validateImageComplexity).mockResolvedValueOnce(mockAnalysis);

      const request = new NextRequest('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/confidence-60.jpg',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.valid).toBe(true);
      // 0.6 is the threshold, should not trigger warning
      expect(data.data.warnings).toHaveLength(0);
    });
  });
});
