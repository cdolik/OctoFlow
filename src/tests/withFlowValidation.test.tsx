import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import withFlowValidation from '../components/withFlowValidation';
import { FlowValidationProps, WithFlowValidationProps } from '../types/flowValidation';

// Mock component to test with flow validation
const TestComponent: React.FC<FlowValidationProps> = ({ stage }) => (
  <div>Current Stage: {stage}</div>
);

const ValidatedComponent = withFlowValidation(TestComponent);

describe('withFlowValidation HOC', () => {
  const defaultProps: WithFlowValidationProps = {
    stage: 'pre-seed',
    responses: {},
    validationConfig: {
      requirePreviousStage: true,
      validateResponses: true
    }
  };

  const renderWithRouter = (props = defaultProps) => {
    return render(
      <HashRouter>
        <Routes>
          <Route path="/" element={<ValidatedComponent {...props} />} />
          <Route path="/error" element={<div>Error Page</div>} />
        </Routes>
      </HashRouter>
    );
  };

  it('renders wrapped component when validation passes', () => {
    renderWithRouter();
    expect(screen.getByText(/Current Stage: pre-seed/)).toBeInTheDocument();
  });

  it('redirects on validation failure', async () => {
    const invalidProps = {
      ...defaultProps,
      stage: 'series-a',
      responses: {}
    };

    renderWithRouter(invalidProps);
    await waitFor(() => {
      expect(window.location.hash).toBe('#/error');
    });
  });

  it('handles missing responses gracefully', () => {
    const propsWithoutResponses = {
      ...defaultProps,
      responses: undefined
    };

    renderWithRouter(propsWithoutResponses);
    expect(screen.getByText(/Current Stage: pre-seed/)).toBeInTheDocument();
  });

  it('validates stage progression order', async () => {
    const advancedStageProps = {
      ...defaultProps,
      stage: 'series-a',
      validationConfig: {
        requirePreviousStage: true
      }
    };

    renderWithRouter(advancedStageProps);
    await waitFor(() => {
      expect(window.location.hash).not.toBe('/');
    });
  });

  it('calls onValidationError when provided', () => {
    const onValidationError = jest.fn();
    const invalidProps = {
      ...defaultProps,
      stage: 'invalid-stage',
      onValidationError
    };

    renderWithRouter(invalidProps);
    expect(onValidationError).toHaveBeenCalled();
  });

  it('allows stage skipping when configured', () => {
    const skipProps = {
      ...defaultProps,
      stage: 'series-a',
      validationConfig: {
        requirePreviousStage: false,
        allowSkipTo: ['series-a']
      }
    };

    renderWithRouter(skipProps);
    expect(screen.getByText(/Current Stage: series-a/)).toBeInTheDocument();
  });
});