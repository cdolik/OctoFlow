import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { withFlowValidation, FlowValidationProps } from '../components/withFlowValidation';
import type { Stage as GlobalStage } from '../types';

// Use the Stage type from withFlowValidation component
type ComponentStage = Exclude<GlobalStage, 'series-b'>;

const MockComponent: React.FC<FlowValidationProps> = () => <div>Mock Component</div>;
const WrappedComponent = withFlowValidation(MockComponent);

describe('withFlowValidation', () => {
  const validProps: FlowValidationProps = {
    currentStage: 'seed' as ComponentStage,
    stages: ['pre-seed', 'seed', 'series-a'] as ComponentStage[],
    responses: {
      'pre-seed-q1': 3,
      'pre-seed-q2': 4
    }
  };

  it('renders wrapped component when flow is valid', () => {
    render(
      <MemoryRouter>
        <WrappedComponent {...validProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Mock Component')).toBeInTheDocument();
  });

  it('redirects when previous stage is incomplete', () => {
    const invalidProps: FlowValidationProps = {
      ...validProps,
      currentStage: 'series-a' as ComponentStage,
      responses: {
        'pre-seed-q1': 3,
        'pre-seed-q2': 4
      }
    };

    render(
      <MemoryRouter initialEntries={['/assessment/series-a']}>
        <WrappedComponent {...invalidProps} />
      </MemoryRouter>
    );

    // Component should redirect and not render
    expect(screen.queryByText('Mock Component')).not.toBeInTheDocument();
  });

  it('handles invalid stage errors', () => {
    const invalidProps = {
      ...validProps,
      // Using 'invalid-stage' to test error handling
      currentStage: 'invalid-stage' as ComponentStage
    };

    render(
      <MemoryRouter>
        <WrappedComponent {...invalidProps} />
      </MemoryRouter>
    );

    // Should redirect to error page
    expect(screen.queryByText('Mock Component')).not.toBeInTheDocument();
  });

  it('validates stage progression order', () => {
    const outOfOrderProps: FlowValidationProps = {
      ...validProps,
      currentStage: 'series-a' as ComponentStage,
      stages: ['pre-seed', 'seed', 'series-a'] as ComponentStage[],
      responses: {
        'series-a-q1': 3 // Trying to answer series-a questions without completing seed stage
      }
    };

    render(
      <MemoryRouter>
        <WrappedComponent {...outOfOrderProps} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Mock Component')).not.toBeInTheDocument();
  });
});