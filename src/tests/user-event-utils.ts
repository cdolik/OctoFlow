import userEvent from '@testing-library/user-event';
import type { KeyboardShortcut } from '../types/keyboard';

export async function simulateKeyboardShortcut(shortcut: KeyboardShortcut) {
  await userEvent.keyboard(shortcut.key);
}

export async function simulateUserNavigation(actions: ('next' | 'previous' | 'save')[]) {
  for (const action of actions) {
    switch (action) {
      case 'next':
        await userEvent.keyboard('[ArrowRight]');
        break;
      case 'previous':
        await userEvent.keyboard('[ArrowLeft]');
        break;
      case 'save':
        await userEvent.keyboard('{Control>}s{/Control}');
        break;
    }
    // Give time for animations and state updates
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export async function simulateFormInteraction(formData: Record<string, string | number>) {
  for (const [field, value] of Object.entries(formData)) {
    const input = document.querySelector(`[name="${field}"]`);
    if (input instanceof HTMLElement) {
      await userEvent.type(input, String(value));
    }
  }
}

export async function simulateUserPreferences(preferences: {
  theme?: 'light' | 'dark' | 'system';
  fontSize?: 'small' | 'medium' | 'large';
  contrast?: boolean;
  motion?: boolean;
}) {
  const themeButton = document.querySelector(`button[data-theme="${preferences.theme}"]`);
  if (themeButton) {
    await userEvent.click(themeButton);
  }

  const fontSizeButton = document.querySelector(`button[data-size="${preferences.fontSize}"]`);
  if (fontSizeButton) {
    await userEvent.click(fontSizeButton);
  }

  if (preferences.contrast !== undefined) {
    const contrastToggle = document.querySelector('input[name="highContrast"]');
    if (contrastToggle instanceof HTMLInputElement && contrastToggle.checked !== preferences.contrast) {
      await userEvent.click(contrastToggle);
    }
  }

  if (preferences.motion !== undefined) {
    const motionToggle = document.querySelector('input[name="motionReduced"]');
    if (motionToggle instanceof HTMLInputElement && motionToggle.checked !== preferences.motion) {
      await userEvent.click(motionToggle);
    }
  }
}