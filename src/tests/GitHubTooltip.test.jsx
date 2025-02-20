import React from 'react';
import renderer from 'react-test-renderer';
import { render, fireEvent, screen, act } from '@testing-library/react';
import GitHubTooltip from '../components/GitHubTooltip';
import { GITHUB_GLOSSARY } from '../data/GITHUB_GLOSSARY';

describe('GitHubTooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Snapshot Tests', () => {
    it('renders correctly when closed', () => {
      const tree = renderer
        .create(
          <GitHubTooltip term="CODEOWNERS">
            <span>Test Content</span>
          </GitHubTooltip>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly when open', () => {
      const component = renderer.create(
        <GitHubTooltip term="CODEOWNERS">
          <span>Test Content</span>
        </GitHubTooltip>
      );
      
      renderer.act(() => {
        component.root.findByType('span').then(span => {
          if (span) {
            span.props.onMouseEnter();
          }
        });
      });

      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe('Accessibility Tests', () => {
    it('handles keyboard navigation', () => {
      render(
        <GitHubTooltip term="CODEOWNERS">
          <span>Test Content</span>
        </GitHubTooltip>
      );

      const trigger = screen.getByRole('button');
      
      // Enter key opens tooltip
      fireEvent.keyPress(trigger, { key: 'Enter' });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Escape key closes tooltip
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('has proper ARIA attributes', () => {
      render(
        <GitHubTooltip term="CODEOWNERS">
          <span>Test Content</span>
        </GitHubTooltip>
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      const tooltip = screen.getByRole('dialog');
      expect(tooltip).toHaveAttribute('aria-label', expect.stringContaining('CODEOWNERS'));
    });
  });

  describe('Mobile Interaction Tests', () => {
    it('handles touch events', () => {
      render(
        <GitHubTooltip term="CODEOWNERS">
          <span>Test Content</span>
        </GitHubTooltip>
      );

      const trigger = screen.getByRole('button');
      
      fireEvent.touchStart(trigger);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      fireEvent.touchEnd(trigger);
      fireEvent.click(document.body); // Click outside should close
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing glossary entries gracefully', () => {
      render(
        <GitHubTooltip term="NON_EXISTENT_TERM">
          <span>Test Content</span>
        </GitHubTooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      
      const tooltip = screen.getByRole('dialog');
      expect(tooltip).toHaveTextContent('Definition not found');
    });
  });

  it('renders children correctly', () => {
    render(
      <GitHubTooltip term="codeowners">
        <div>Tooltip trigger</div>
      </GitHubTooltip>
    );

    expect(screen.getByText('Tooltip trigger')).toBeInTheDocument();
  });

  it('shows tooltip on hover', () => {
    render(
      <GitHubTooltip term="codeowners">
        <div>Hover me</div>
      </GitHubTooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    expect(screen.getByText(GITHUB_GLOSSARY.codeowners.description)).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toHaveAttribute('href', GITHUB_GLOSSARY.codeowners.url);
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <GitHubTooltip term="codeowners">
        <div>Hover me</div>
      </GitHubTooltip>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);

    act(() => {
      jest.advanceTimersByTime(200); // Account for fade-out animation
    });

    expect(screen.queryByText(GITHUB_GLOSSARY.codeowners.description)).not.toBeInTheDocument();
  });

  it('handles undefined terms gracefully', () => {
    render(
      <GitHubTooltip term="nonexistent">
        <div>Invalid term</div>
      </GitHubTooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Invalid term'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus and hides on blur', () => {
    render(
      <GitHubTooltip term="codeowners">
        <button>Focus me</button>
      </GitHubTooltip>
    );

    const trigger = screen.getByText('Focus me');
    trigger.focus();
    expect(screen.getByText(GITHUB_GLOSSARY.codeowners.description)).toBeInTheDocument();

    trigger.blur();
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.queryByText(GITHUB_GLOSSARY.codeowners.description)).not.toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(
      <GitHubTooltip term="codeowners">
        <button>ARIA test</button>
      </GitHubTooltip>
    );

    fireEvent.mouseEnter(screen.getByText('ARIA test'));
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('role', 'tooltip');
    expect(tooltip).toHaveAttribute('id', expect.stringContaining('tooltip-'));
    expect(screen.getByText('ARIA test')).toHaveAttribute('aria-describedby', tooltip.id);
  });
});