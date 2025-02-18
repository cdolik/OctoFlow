import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { withFlowValidation } from '../components/withFlowValidation';

const MockComponent = () => <div>Mock Component</div>;
const WrappedComponent = withFlowValidation(MockComponent);

describe('withFlowValidation', () => {
  const validProps = {
    currentStage: 'seed',
    stages: ['pre-seed', 'seed', 'series-a'],
    responses: {
      'pre-seed': { complete: true },
      'seed': null,
      'series-a': null
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
    const invalidProps = {
      ...validProps,
      currentStage: 'series-a',
      responses: {
        'pre-seed': { complete: true },
        'seed': null,
        'series-a': null
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
    const invalidStageProps = {
      ...validProps,
      currentStage: 'invalid-stage'
    };

    render(
      <MemoryRouter>
        <WrappedComponent {...invalidStageProps} />
      </MemoryRouter>
    );

    // Should redirect to error page
    expect(screen.queryByText('Mock Component')).not.toBeInTheDocument();
  });
});