import { renderHook } from '@testing-library/react';
import useAutoScroll from './useAutoScroll';

describe('useAutoScroll', () => {
  const originalScrollTo = window.scrollTo;
  
  beforeEach(() => {
    window.scrollTo = jest.fn();
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    });
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
    jest.clearAllMocks();
  });

  it('should scroll when element is out of view', () => {
    // Mock element out of view
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      top: 800,
      bottom: 900
    });
    
    const { result } = renderHook(() => useAutoScroll());
    
    // Create and append test element
    const element = document.createElement('div');
    element.id = 'current-question';
    document.body.appendChild(element);
    
    result.current();
    
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: 'smooth'
    });
    
    document.body.removeChild(element);
  });

  it('should not scroll when element is in view', () => {
    // Mock element in view
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      top: 200,
      bottom: 300
    });
    
    const { result } = renderHook(() => useAutoScroll());
    
    const element = document.createElement('div');
    element.id = 'current-question';
    document.body.appendChild(element);
    
    result.current();
    
    expect(window.scrollTo).not.toHaveBeenCalled();
    
    document.body.removeChild(element);
  });

  it('should handle missing element gracefully', () => {
    const { result } = renderHook(() => useAutoScroll());
    
    result.current();
    
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('should respect custom options', () => {
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      top: 800,
      bottom: 900
    });
    
    const { result } = renderHook(() => useAutoScroll({
      elementId: 'custom-element',
      behavior: 'auto',
      offset: 50
    }));
    
    const element = document.createElement('div');
    element.id = 'custom-element';
    document.body.appendChild(element);
    
    result.current();
    
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: 'auto'
    });
    
    document.body.removeChild(element);
  });

  it('should debounce scroll calls', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useAutoScroll({ delay: 100 }));
    
    const element = document.createElement('div');
    element.id = 'current-question';
    document.body.appendChild(element);
    
    // Call multiple times
    result.current();
    result.current();
    result.current();
    
    expect(window.scrollTo).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(100);
    
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    
    document.body.removeChild(element);
    jest.useRealTimers();
  });
});