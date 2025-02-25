import { setupServer } from 'msw/node';

// Sets up a minimal MSW server without any request handlers, add handlers as needed for tests.
const server = setupServer();

export { server };