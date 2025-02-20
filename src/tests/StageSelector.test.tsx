import { render, screen, fireEvent } from '@testing-library/react';
import StageSelector from '../components/StageSelector';
import { stages } from '../data/categories';

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
      const estimatedTime = screen.getAllByText(new RegExp(`${questionCount} questions`, 'i'))[0];
      expect(estimatedTime).toBeInTheDocument();
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
});