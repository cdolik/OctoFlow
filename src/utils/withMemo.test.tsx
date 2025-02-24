import React from 'react';
import { render, screen } from '@testing-library/react';
import { withMemo, useMemoWithPerf, useCallbackWithPerf } from './withMemo';
import { performance } from './performance';

jest.mock('./performance', () => ({
  performance: {
    startMeasure: jest.fn(() => jest.fn()),
    trackComponentRender: jest.fn(),
    now: jest.fn(() => Date.now())
  }
}));

describe('withMemo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  interface TestProps {
    value: number;
    text: string;
  }

  const TestComponent: React.FC<TestProps> = ({ value, text }) => (
    <div data-testid="test-component">
      {value} - {text}
    </div>
  );

  it('memoizes component with default config', () => {
    const MemoizedComponent = withMemo(TestComponent);
    const { rerender } = render(<MemoizedComponent value={1} text="test" />);

    expect(screen.getByTestId('test-component')).toHaveTextContent('1 - test');

    // Re-render with same props
    rerender(<MemoizedComponent value={1} text="test" />);
    expect(performance.trackComponentRender).toHaveBeenCalledTimes(1);
  });

  it('respects custom propsAreEqual function', () => {
    const propsAreEqual = (prev: TestProps, next: TestProps) => (
      prev.value === next.value
    );

    const MemoizedComponent = withMemo(TestComponent, { propsAreEqual });
    const { rerender } = render(<MemoizedComponent value={1} text="test" />);

    // Re-render with different text but same value
    rerender(<MemoizedComponent value={1} text="different" />);
    expect(performance.trackComponentRender).toHaveBeenCalledTimes(1);

    // Re-render with different value
    rerender(<MemoizedComponent value={2} text="different" />);
    expect(performance.trackComponentRender).toHaveBeenCalledTimes(2);
  });

  it('tracks only specified props', () => {
    const MemoizedComponent = withMemo(TestComponent, {
      propsToTrack: ['value']
    });

    const { rerender } = render(<MemoizedComponent value={1} text="test" />);

    // Re-render with different text but same value
    rerender(<MemoizedComponent value={1} text="different" />);
    expect(performance.trackComponentRender).toHaveBeenCalledTimes(1);
  });

  it('preserves display name', () => {
    const NamedComponent = withMemo(TestComponent, { name: 'CustomName' });
    expect(NamedComponent.displayName).toBe('WithMemo(CustomName)');
  });
});

describe('useMemoWithPerf', () => {
  it('measures expensive calculations', () => {
    const TestComponent = () => {
      const result = useMemoWithPerf(
        () => {
          let sum = 0;
          for (let i = 0; i < 1000; i++) sum += i;
          return sum;
        },
        [],
        'expensive-sum'
      );

      return <div>{result}</div>;
    };

    render(<TestComponent />);
    expect(performance.startMeasure).toHaveBeenCalledWith(
      'calc-expensive-sum',
      { type: 'calculation' }
    );
  });

  it('memoizes result correctly', () => {
    let calculationCount = 0;
    const TestComponent = ({ dep }: { dep: number }) => {
      const result = useMemoWithPerf(
        () => {
          calculationCount++;
          return dep * 2;
        },
        [dep],
        'double'
      );

      return <div>{result}</div>;
    };

    const { rerender } = render(<TestComponent dep={1} />);
    expect(calculationCount).toBe(1);

    rerender(<TestComponent dep={1} />);
    expect(calculationCount).toBe(1);

    rerender(<TestComponent dep={2} />);
    expect(calculationCount).toBe(2);
  });
});

describe('useCallbackWithPerf', () => {
  it('tracks callback performance', () => {
    const TestComponent = () => {
      const callback = useCallbackWithPerf(
        () => {
          let result = 0;
          for (let i = 0; i < 1000; i++) result += i;
          return result;
        },
        [],
        'expensive-callback'
      );

      React.useEffect(() => {
        callback();
      }, [callback]);

      return null;
    };

    render(<TestComponent />);
    expect(performance.startMeasure).toHaveBeenCalledWith(
      'callback-expensive-callback',
      { type: 'callback' }
    );
  });

  it('memoizes callback correctly', () => {
    const TestComponent = ({ value }: { value: number }) => {
      const callback = useCallbackWithPerf(
        () => value * 2,
        [value],
        'double'
      );

      return <button onClick={() => callback()}>Click</button>;
    };

    const { rerender } = render(<TestComponent value={1} />);
    const initialCallback = screen.getByRole('button').onclick;

    rerender(<TestComponent value={1} />);
    expect(screen.getByRole('button').onclick).toBe(initialCallback);

    rerender(<TestComponent value={2} />);
    expect(screen.getByRole('button').onclick).not.toBe(initialCallback);
  });
});