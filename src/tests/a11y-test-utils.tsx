import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { TestContextProvider } from './TestContextProvider';

expect.extend(toHaveNoViolations);

export async function testAccessibility(ui: React.ReactElement) {
  const { container } = render(ui, {
    wrapper: ({ children }) => (
      <TestContextProvider>{children}</TestContextProvider>
    )
  });
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

export const accessibilityRules = {
  wcag2a: true,
  wcag2aa: true,
  'color-contrast': true,
  'aria-allowed-attr': true,
  'aria-required-attr': true,
  'aria-valid-attr': true,
  'button-name': true,
  'image-alt': true,
  label: true,
  'link-name': true,
  list: true,
  'list-item': true,
  'duplicate-id': true,
  'frame-title': true
};