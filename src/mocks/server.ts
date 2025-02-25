import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

if (process.env.NODE_ENV === 'development') {
  console.log('Mock Service Worker enabled');
}