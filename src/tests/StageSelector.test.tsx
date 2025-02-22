import { render, screen, fireEvent } from '@testing-library/react';
import StageSelector from '../components/StageSelector';
import { stages } from '../data/stages';
import { Stage } from '../types';

describe('StageSelector', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all available stages', () => {
    render(<StageSelector onSelect={mockOnSelect} />);

    stages.forEach(stage => {
      expect(screen.getByText(stage.label)).toBeInTheDocument();
      expect(screen.getByText(stage.description)).toBeInTheDocument();
    });
  });

  it('displays stage metrics correctly', () => {
    render(<StageSelector onSelect={mockOnSelect} />);

    stages.forEach(stage => {
      expect(screen.getByText(stage.benchmarks.deploymentFreq)).toBeInTheDocument();
      const questionCount = Object.keys(stage.benchmarks.expectedScores).length;
      expect(screen.getByText(`Questions: ${questionCount}`)).toBeInTheDocument();
    });
  });

  it('displays focus areas for each stage', () => {
    render(<StageSelector onSelect={mockOnSelect} />);

    stages.forEach(stage => {
      stage.focus.forEach(area => {
        const capitalizedArea = area.charAt(0).toUpperCase() + area.slice(1);
        expect(screen.getByText(capitalizedArea)).toBeInTheDocument();
      });
    });
  });

  it('filters stages based on search input', () => {
    render(<StageSelector onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText('Search stages');
    
    // Filter by stage label
    fireEvent.change(searchInput, { target: { value: 'seed' } });
    expect(screen.getByText('Seed Stage')).toBeInTheDocument();
    expect(screen.queryByText('Series A')).not.toBeInTheDocument();

    // Filter by focus area
    fireEvent.change(searchInput, { target: { value: 'security' } });
    const securityStages = stages.filter(s => s.focus.includes('security'));
    securityStages.forEach(stage => {
      expect(screen.getByText(stage.label)).toBeInTheDocument();
    });
  });

  it('handles no search results gracefully', () => {
    render(<StageSelector onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText('Search stages');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No stages found')).toBeInTheDocument();
  });

  it('highlights current stage when provided', () => {
    const currentStage: Stage = 'seed';
    render(<StageSelector onSelect={mockOnSelect} initialStage={currentStage} />);

    const stageCard = screen.getByText('Seed Stage').closest('button');
    expect(stageCard).toHaveClass('current');
  });

  it('calls onSelect with correct stage id when clicked', () => {
    render(<StageSelector onSelect={mockOnSelect} />);

    const firstStage = stages[0];
    fireEvent.click(screen.getByText(firstStage.label));
    expect(mockOnSelect).toHaveBeenCalledWith(firstStage.id);
  });

  it('supports keyboard navigation', () => {
    render(<StageSelector onSelect={mockOnSelect} />);

    const firstStageCard = screen.getAllByRole('button')[0];
    firstStageCard.focus();
    fireEvent.keyDown(firstStageCard, { key: 'Enter' });

    expect(mockOnSelect).toHaveBeenCalledWith(stages[0].id);
  });
});
