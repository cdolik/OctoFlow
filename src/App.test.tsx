import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Mock the router to prevent navigation issues in tests
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  HashRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the storage module
jest.mock('./utils/storage', () => ({
  loadState: jest.fn().mockReturnValue(null),
  saveState: jest.fn(),
  clearState: jest.fn(),
}));

describe('App component', () => {
  test('renders without crashing', () => {
    render(<App />);
    // Basic assertion that the component renders
    expect(true).toBe(true);
  });
});
