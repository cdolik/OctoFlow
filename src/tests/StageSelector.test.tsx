import { render, screen, fireEvent } from '@testing-library/react';
import StageSelector from '../components/StageSelector';
import { stages } from '../data/stages';

describe('StageSelector', () => {
  const mockOnStageSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all available stages', () => {
    render(<StageSelector onStageSelect={mockOnStageSelect} />);

    stages.forEach(stage => {
      expect(screen.getByText(stage.label)).toBeInTheDocument();
      expect(screen.getByText(stage.description)).toBeInTheDocument();
    });
  });

  it('shows correct team size for each stage', () => {
    render(<StageSelector onStageSelect={mockOnStageSelect} />);

    expect(screen.getByText(/1-5 developers/)).toBeInTheDocument();
    expect(screen.getByText(/5-15 developers/)).toBeInTheDocument();
    expect(screen.getByText(/15\+ developers/)).toBeInTheDocument();
  });

  it('shows correct focus areas for each stage', () => {
    render(<StageSelector onStageSelect={mockOnStageSelect} />);

    // Pre-seed stage focus areas
    expect(screen.getByText('Basic Automation')).toBeInTheDocument();
    expect(screen.getByText('Core Security')).toBeInTheDocument();

    // Seed stage focus areas
    expect(screen.getByText('Team Collaboration')).toBeInTheDocument();
    expect(screen.getByText('CI/CD')).toBeInTheDocument();

    // Series A focus areas
    expect(screen.getByText('Advanced Security')).toBeInTheDocument();
    expect(screen.getByText('Scale & Performance')).toBeInTheDocument();
  });

  it('shows deployment frequency benchmarks', () => {
    render(<StageSelector onStageSelect={mockOnStageSelect} />);

    stages.forEach(stage => {
      expect(screen.getByText(stage.benchmarks.deploymentFreq)).toBeInTheDocument();
    });
  });

  it('calls onStageSelect with correct stage id when clicked', () => {
    render(<StageSelector onStageSelect={mockOnStageSelect} />);

    const preSeedCard = screen.getByRole('button', { name: /pre-seed/i });
    fireEvent.click(preSeedCard);
    expect(mockOnStageSelect).toHaveBeenCalledWith('pre-seed');
  });

  it('shows estimated time for each stage', () => {
    render(<StageSelector onStageSelect={mockOnStageSelect} />);

    stages.forEach(stage => {
      const questionCount = Object.values(stage.benchmarks.expectedScores).length;
      expect(screen.getByText((content, element) => {
        return element?.textContent?.toLowerCase().includes(`${questionCount} questions`) || false;
      })).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', () => {
    render(<StageSelector onStageSelect={mockOnStageSelect} />);

    const firstStageCard = screen.getAllByRole('button')[0];
    firstStageCard.focus();
    fireEvent.keyDown(firstStageCard, { key: 'Enter' });

    expect(mockOnStageSelect).toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    render(<StageSelector onStageSelect={mockOnStageSelect} />);

    const stageCards = screen.getAllByRole('button');
    stageCards.forEach(card => {
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  it('filters stages correctly based on user input', () => {
    render(<StageSelector onStageSelect={mockOnStageSelect} />);

    const searchInput = screen.getByPlaceholderText('Search stages');
    fireEvent.change(searchInput, { target: { value: 'seed' } });

    expect(screen.queryByText('Pre-Seed Startup')).not.toBeInTheDocument();
    expect(screen.getByText('Seed Stage')).toBeInTheDocument();
    expect(screen.queryByText('Series A')).not.toBeInTheDocument();
  });

  it('displays no results message when no stages match filter', () => {
    render(<StageSelector onStageSelect={mockOnStageSelect} />);

    const searchInput = screen.getByPlaceholderText('Search stages');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No stages found')).toBeInTheDocument();
  });
});
