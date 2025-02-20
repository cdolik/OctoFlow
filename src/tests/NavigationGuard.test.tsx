import { render } from '@testing-library/react';
import NavigationGuard from '../components/NavigationGuard';

describe('NavigationGuard', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;
  
  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('registers beforeunload event listener when there are unsaved changes', () => {
    render(<NavigationGuard hasUnsavedChanges={true} />);
    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('removes event listener when component unmounts', () => {
    const { unmount } = render(<NavigationGuard hasUnsavedChanges={true} />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('does not register listener when there are no unsaved changes', () => {
    render(<NavigationGuard hasUnsavedChanges={false} />);
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('updates listener when hasUnsavedChanges changes', () => {
    const { rerender } = render(<NavigationGuard hasUnsavedChanges={false} />);
    expect(addEventListenerSpy).not.toHaveBeenCalled();

    rerender(<NavigationGuard hasUnsavedChanges={true} />);
    expect(addEventListenerSpy).toHaveBeenCalled();
  });

  it('prevents default and sets returnValue when event is triggered', () => {
    render(<NavigationGuard hasUnsavedChanges={true} />);
    
    const mockEvent = {
      preventDefault: jest.fn(),
      returnValue: ''
    };
    
    // Get the registered event handler and call it
    const handler = addEventListenerSpy.mock.calls[0][1];
    handler(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.returnValue).toBe('');
  });
});