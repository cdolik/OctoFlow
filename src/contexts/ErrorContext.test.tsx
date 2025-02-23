import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { ErrorProvider, useError } from './ErrorContext';

jest.useFakeTimers();

const TestComponent: React.FC = () => {
  const { attempts, canAttemptRecovery, recordAttempt } = useError();
  
  return (
    <div>
      <span data-testid="attempts">{attempts}</span>
      <span data-testid="can-recover">{canAttemptRecovery() ? 'yes' : 'no'}</span>
      <button onClick={() => recordAttempt(new Error('Test error'))}>
        Record Error
      </button>
    </div>
  );
};

describe('ErrorContext', () => {
  it('provides error recovery state to children', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    expect(screen.getByTestId('attempts')).toHaveTextContent('0');
    expect(screen.getByTestId('can-recover')).toHaveTextContent('yes');
  });

  it('tracks error attempts through context', () => {
    render(
      <ErrorProvider maxAttempts={2}>
        <TestComponent />
      </ErrorProvider>
    );

    act(() => {
      screen.getByRole('button').click();
      screen.getByRole('button').click();
    });

    expect(screen.getByTestId('attempts')).toHaveTextContent('2');
    expect(screen.getByTestId('can-recover')).toHaveTextContent('no');
  });

  it('allows recovery after cooldown', () => {
    render(
      <ErrorProvider maxAttempts={1} cooldownPeriod={1000}>
        <TestComponent />
      </ErrorProvider>
    );

    act(() => {
      screen.getByRole('button').click();
    });

    expect(screen.getByTestId('can-recover')).toHaveTextContent('no');

    act(() => {
      jest.advanceTimersByTime(1001);
    });

    expect(screen.getByTestId('can-recover')).toHaveTextContent('yes');
  });

  it('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useError());
    }).toThrow('useError must be used within an ErrorProvider');
    
    consoleError.mockRestore();
  });

  it('shares error state between components', () => {
    const AnotherTestComponent: React.FC = () => {
      const { attempts } = useError();
      return <span data-testid="other-attempts">{attempts}</span>;
    };

    render(
      <ErrorProvider>
        <TestComponent />
        <AnotherTestComponent />
      </ErrorProvider>
    );

    act(() => {
      screen.getByRole('button').click();
    });

    expect(screen.getByTestId('attempts')).toHaveTextContent('1');
    expect(screen.getByTestId('other-attempts')).toHaveTextContent('1');
  });
});