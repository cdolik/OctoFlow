import React from 'react';
import renderer from 'react-test-renderer';
import { render, fireEvent, screen } from '@testing-library/react';
import GitHubTooltip from '../components/GitHubTooltip';

describe('GitHubTooltip', () => {
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
});