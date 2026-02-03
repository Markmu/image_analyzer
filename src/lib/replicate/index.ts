import Replicate from 'replicate';

// Validate required environment variables
if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN environment variable is required');
}

// Initialize Replicate client with API token from environment
export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Export Replicate instance for use throughout the application
export { Replicate };
