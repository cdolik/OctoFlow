import React from 'react';
import { render, screen } from '@testing-library/react';
import { OfflineIndicator } from './OfflineIndicator';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

jest.mock('../hooks/useOfflineStatus');

describe('OfflineIndicator', () => {
  const mockDate = new Date('2024-01-01T12:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders offline state correctly', () => {
    (useOfflineStatus as jest.Mock).mockReturnValue({
      isOffline: true,
      lastOnlineAt: new Date(mockDate.getTime() - 5 * 60000), // 5 minutes ago
      pendingSyncs: 0
    });

    render(<OfflineIndicator />);

    expect(screen.getByText('Working offline')).toBeInTheDocument();
    expect(screen.getByText('Last online: 5 minutes ago')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('offline');
  });

  it('renders syncing state correctly', () => {
    (useOfflineStatus as jest.Mock).mockReturnValue({
      isOffline: false,
      lastOnlineAt: mockDate,
      pendingSyncs: 3
    });

    render(<OfflineIndicator />);

    expect(screen.getByText('Syncing 3 changes...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('syncing');
  });

  it('handles single pending sync grammar', () => {
    (useOfflineStatus as jest.Mock).mockReturnValue({
      isOffline: false,
      lastOnlineAt: mockDate,
      pendingSyncs: 1
    });

    render(<OfflineIndicator />);

    expect(screen.getByText('Syncing 1 change...')).toBeInTheDocument();
  });

  it('renders nothing when online and no syncs pending', () => {
    (useOfflineStatus as jest.Mock).mockReturnValue({
      isOffline: false,
      lastOnlineAt: mockDate,
      pendingSyncs: 0
    });

    const { container } = render(<OfflineIndicator />);
    expect(container).toBeEmptyDOMElement();
  });

  it('formats recent offline time as "Just now"', () => {
    (useOfflineStatus as jest.Mock).mockReturnValue({
      isOffline: true,
      lastOnlineAt: new Date(mockDate.getTime() - 30000), // 30 seconds ago
      pendingSyncs: 0
    });

    render(<OfflineIndicator />);
    expect(screen.getByText('Last online: Just now')).toBeInTheDocument();
  });

  it('handles singular minute in time display', () => {
    (useOfflineStatus as jest.Mock).mockReturnValue({
      isOffline: true,
      lastOnlineAt: new Date(mockDate.getTime() - 60000), // 1 minute ago
      pendingSyncs: 0
    });

    render(<OfflineIndicator />);
    expect(screen.getByText('Last online: 1 minute ago')).toBeInTheDocument();
  });

  it('provides proper ARIA live region updates', () => {
    (useOfflineStatus as jest.Mock).mockReturnValue({
      isOffline: true,
      lastOnlineAt: new Date(mockDate.getTime() - 300000), // 5 minutes ago
      pendingSyncs: 0
    });

    render(<OfflineIndicator />);

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveTextContent('Working offline. 5 minutes ago');
  });

  it('updates display when sync status changes', () => {
    const { rerender } = render(<OfflineIndicator />);

    // Initial state: offline
    (useOfflineStatus as jest.Mock).mockReturnValue({
      isOffline: true,
      lastOnlineAt: mockDate,
      pendingSyncs: 0
    });
    rerender(<OfflineIndicator />);
    expect(screen.getByText('Working offline')).toBeInTheDocument();

    // Updated state: syncing
    (useOfflineStatus as jest.Mock).mockReturnValue({
      isOffline: false,
      lastOnlineAt: mockDate,
      pendingSyncs: 2
    });
    rerender(<OfflineIndicator />);
    expect(screen.getByText('Syncing 2 changes...')).toBeInTheDocument();
  });
});