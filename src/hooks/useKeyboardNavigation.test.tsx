import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import useKeyboardNavigation from './useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  const mockProps = {
    onNext: jest.fn(),
    onBack: jest.fn(),
    onSelect: jest.fn(),
    canProceed: true,
    isFirstQuestion: false,
    optionsCount: 4
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle arrow right and enter for next', () => {
    renderHook(() => useKeyboardNavigation(mockProps));

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(mockProps.onNext).toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(mockProps.onNext).toHaveBeenCalledTimes(2);
  });

  it('should not proceed when canProceed is false', () => {
    renderHook(() => useKeyboardNavigation({ ...mockProps, canProceed: false }));

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(mockProps.onNext).not.toHaveBeenCalled();
  });

  it('should handle arrow left for back when not first question', () => {
    renderHook(() => useKeyboardNavigation(mockProps));

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('should not go back on first question', () => {
    renderHook(() => useKeyboardNavigation({ ...mockProps, isFirstQuestion: true }));

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(mockProps.onBack).not.toHaveBeenCalled();
  });

  it('should handle number keys for option selection', () => {
    renderHook(() => useKeyboardNavigation(mockProps));

    fireEvent.keyDown(document, { key: '1' });
    expect(mockProps.onSelect).toHaveBeenCalledWith(0);

    fireEvent.keyDown(document, { key: '4' });
    expect(mockProps.onSelect).toHaveBeenCalledWith(3);
  });

  it('should not handle number keys beyond optionsCount', () => {
    renderHook(() => useKeyboardNavigation({ ...mockProps, optionsCount: 2 }));

    fireEvent.keyDown(document, { key: '3' });
    expect(mockProps.onSelect).not.toHaveBeenCalled();
  });

  it('should not handle keyboard events when typing in input', () => {
    renderHook(() => useKeyboardNavigation(mockProps));
    
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(mockProps.onNext).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});