import { http, HttpResponse } from 'msw';
import { mockStorageState } from '../tests/test-data';

export const handlers = [
  // Health check endpoint
  http.head('/api/health', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Storage state endpoints
  http.get('/api/state', () => {
    return HttpResponse.json(mockStorageState);
  }),

  http.post('/api/state', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ ...data, saved: true });
  }),

  // Error simulation endpoints
  http.get('/api/error/network', () => {
    return new HttpResponse(null, { status: 503 });
  }),

  http.get('/api/error/validation', () => {
    return new HttpResponse(
      JSON.stringify({ 
        message: 'Validation failed',
        errors: [{ field: 'stage', message: 'Invalid stage' }]
      }),
      { status: 400 }
    );
  })
];