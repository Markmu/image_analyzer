/**
 * MSW (Mock Service Worker) Handlers for Replicate API
 *
 * Mocks Replicate API requests to avoid:
 * - Test costs (each Replicate call costs money)
 * - Test instability (network delays, rate limits)
 * - Slow tests (real AI response times)
 *
 * @see test-design-architecture.md#L584-L632
 */

import { http, HttpResponse } from 'msw';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ReplicateVisionPrediction {
  id: string;
  status: 'succeeded' | 'processing' | 'failed';
  output: {
    analysis: string;
    style_tags: string[];
    color_palette: string[];
    confidence: number;
  };
}

export interface ReplicateImageGenerationPrediction {
  id: string;
  status: 'succeeded' | 'processing' | 'failed';
  output: string | null; // Image URL
  urls: {
    get: string;
  };
}

export interface ReplicateTextPrediction {
  id: string;
  status: 'succeeded' | 'processing' | 'failed';
  output: {
    prompt: string;
    keywords: string[];
    description: string;
  };
}

// ============================================
// MOCK RESPONSE FIXTURES
// ============================================

export const mockReplicateResponses = {
  // Vision analysis responses
  vision: {
    modern_kitchen: {
      id: 'mock-vision-prediction-001',
      status: 'succeeded',
      output: {
        analysis: 'modern minimalist kitchen with clean lines and neutral color palette',
        style_tags: ['minimalist', 'modern', 'scandinavian', 'neutral'],
        color_palette: ['#FFFFFF', '#E0E0E0', '#808080', '#F5F5F5'],
        confidence: 0.92,
      },
    } as ReplicateVisionPrediction,

    industrial_bedroom: {
      id: 'mock-vision-prediction-002',
      status: 'succeeded',
      output: {
        analysis: 'industrial style bedroom with exposed brick walls and metal fixtures',
        style_tags: ['industrial', 'rustic', 'urban', 'masculine'],
        color_palette: ['#8B4513', '#696969', '#2F4F4F', '#A0522D'],
        confidence: 0.88,
      },
    } as ReplicateVisionPrediction,

    bohemian_living_room: {
      id: 'mock-vision-prediction-003',
      status: 'succeeded',
      output: {
        analysis: 'bohemian living room with eclectic patterns and vibrant colors',
        style_tags: ['bohemian', 'eclectic', 'vibrant', 'casual'],
        color_palette: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
        confidence: 0.85,
      },
    } as ReplicateVisionPrediction,
  },

  // Text-to-image generation responses
  textToImage: {
    success: {
      id: 'mock-image-gen-prediction-001',
      status: 'succeeded',
      output: 'https://mock-replicate-output.com/generated-image-001.png',
      urls: {
        get: 'https://api.replicate.com/v1/predictions/mock-image-gen-prediction-001',
      },
    } as ReplicateImageGenerationPrediction,

    processing: {
      id: 'mock-image-gen-prediction-002',
      status: 'processing',
      output: null,
      urls: {
        get: 'https://api.replicate.com/v1/predictions/mock-image-gen-prediction-002',
      },
    } as ReplicateImageGenerationPrediction,

    timeout: {
      id: 'mock-timeout-prediction',
      status: 'processing',
      output: null,
      urls: {
        get: 'https://api.replicate.com/v1/predictions/mock-timeout-prediction',
      },
    } as ReplicateImageGenerationPrediction,

    error: {
      id: 'mock-error-prediction',
      status: 'failed',
      output: null,
      urls: {
        get: 'https://api.replicate.com/v1/predictions/mock-error-prediction',
      },
    } as ReplicateImageGenerationPrediction,
  },

  // Text model responses
  text: {
    prompt_enhancement: {
      id: 'mock-text-prediction-001',
      status: 'succeeded',
      output: {
        prompt: 'A modern, sunlit living room with beige sofas and wooden accents, minimalist decor, large windows, indoor plants, bright and airy atmosphere',
        keywords: ['modern', 'sunlit', 'minimalist', 'beige', 'wooden', 'airy'],
        description: 'Enhanced prompt for style transfer',
      },
    } as ReplicateTextPrediction,
  },
};

// ============================================
// MSW HANDLERS
// ============================================

export const handlers = [
  // ----------------------------------------
  // Mock: Create Vision Analysis Prediction
  // ----------------------------------------
  http.post('https://api.replicate.com/v1/predictions', async ({ request }) => {
    const body = await request.json() as {
      version: string;
      input: { image_url: string };
    };

    console.log('🎭 MSW: Intercepted Replicate API prediction request', {
      version: body.version,
    });

    // Detect request type based on version
    if (body.version.includes('vision')) {
      // Return vision analysis response
      return HttpResponse.json(mockReplicateResponses.vision.modern_kitchen);
    }

    if (body.version.includes('stable-diffusion')) {
      // Return image generation response (processing)
      return HttpResponse.json(mockReplicateResponses.textToImage.processing);
    }

    if (body.version.includes('text-model')) {
      // Return text model response
      return HttpResponse.json(mockReplicateResponses.text.prompt_enhancement);
    }

    // Default fallback
    return HttpResponse.json({
      id: 'mock-default-prediction',
      status: 'succeeded',
      output: { analysis: 'mock analysis' },
    });
  }),

  // ----------------------------------------
  // Mock: Get Prediction Status (Polling)
  // ----------------------------------------
  http.get('https://api.replicate.com/v1/predictions/:id', ({ params }) => {
    const predictionId = params.id as string;

    console.log('🎭 MSW: Intercepted Replicate API status check', {
      predictionId,
    });

    // Return completed response for image generation
    if (predictionId === 'mock-image-gen-prediction-002') {
      // First few polls return processing, then success
      const random = Math.random();
      if (random > 0.5) {
        return HttpResponse.json(mockReplicateResponses.textToImage.processing);
      } else {
        return HttpResponse.json(mockReplicateResponses.textToImage.success);
      }
    }

    if (predictionId === 'mock-timeout-prediction') {
      // Always return processing (simulates timeout)
      return HttpResponse.json(mockReplicateResponses.textToImage.timeout);
    }

    if (predictionId === 'mock-error-prediction') {
      // Return error
      return HttpResponse.json({
        id: predictionId,
        status: 'failed',
        error: 'Simulated Replicate API error',
        output: null,
      });
    }

    // Default: return succeeded
    return HttpResponse.json({
      id: predictionId,
      status: 'succeeded',
      output: 'https://mock-replicate-output.com/default.png',
    });
  }),

  // ----------------------------------------
  // Mock: Cancel Prediction
  // ----------------------------------------
  http.post('https://api.replicate.com/v1/predictions/:id/cancel', () => {
    console.log('🎭 MSW: Intercepted Replicate API cancel request');

    return HttpResponse.json({
      status: 'canceled',
    });
  }),
];

// ============================================
// MOCK SELECTION HELPERS
// ============================================

/**
 * Select a specific mock response for vision analysis
 * Useful for testing different style types
 */
export function setVisionMockResponse(
  style: 'modern_kitchen' | 'industrial_bedroom' | 'bohemian_living_room'
) {
  return mockReplicateResponses.vision[style];
}

/**
 * Select a specific mock response for image generation
 */
export function setImageGenerationMockResponse(
  scenario: 'success' | 'processing' | 'timeout' | 'error'
) {
  return mockReplicateResponses.textToImage[scenario];
}

// ============================================
// EXPORTS
// ============================================

export default handlers;
