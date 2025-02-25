import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from '../App';

// Integration tests simulating real-world user flows

describe('Integration tests for component and hook integration', () => {
  test('App renders correctly and navigation works', async () => {
    // Render the main application
    render(<App />);

    // Expect the navigation element to be in the document
    const navElement = await screen.findByRole('navigation');
    expect(navElement).toBeInTheDocument();

    // Simulate a user clicking on a navigation link labeled "Assessment"
    const assessmentLink = screen.getByText(/Assessment/i);
    fireEvent.click(assessmentLink);

    // Verify that the Assessment component or its corresponding content is displayed
    const assessmentContent = await screen.findByText(/assessment/i);
    expect(assessmentContent).toBeInTheDocument();
  });

  test('Custom hook integration simulation using renderHook', () => {
    // Example hook for demonstration
    function useTestHook() {
      const [value, setValue] = React.useState(0);
      const increment = () => setValue(v => v + 1);
      return { value, increment };
    }

    const { result } = renderHook(() => useTestHook());
    expect(result.current.value).toBe(0);

    act(() => {
      result.current.increment();
    });
    expect(result.current.value).toBe(1);
  });
});
