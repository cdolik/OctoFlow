import React, { useEffect, useRef } from 'react';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import './styles.css';
import type { LiveRegionProps } from '../types/props';

interface Message {
  text: string;
  type: 'status' | 'alert' | 'info';
  id: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true
}) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const { activeShortcut } = useKeyboardShortcuts();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const regionRef = useRef<HTMLDivElement>(null);

  const addMessage = React.useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== message.id));
    }, 5000);
  }, []);

  useEffect(() => {
    const handleCustomMessage = (event: CustomEvent<Message>) => {
      addMessage(event.detail);
    };

    window.addEventListener('liveRegionUpdate', handleCustomMessage as EventListener);
    return () => {
      window.removeEventListener('liveRegionUpdate', handleCustomMessage as EventListener);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [addMessage]);

  // Announce active shortcut
  useEffect(() => {
    if (activeShortcut) {
      addMessage({
        text: `${activeShortcut.description} shortcut activated`,
        type: 'status',
        id: `shortcut-${Date.now()}`
      });
    }
  }, [activeShortcut, addMessage]);

  useEffect(() => {
    // Force screen readers to announce content changes
    if (regionRef.current) {
      const originalContent = regionRef.current.textContent;
      regionRef.current.textContent = '';
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = originalContent;
        }
      }, 100);
    }
  }, [children]);

  return (
    <div
      ref={regionRef}
      className="live-region"
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
    >
      {children}
      {/* Polite announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="live-region"
      >
        {messages
          .filter(m => m.type === 'status' || m.type === 'info')
          .map(message => (
            <div key={message.id} role="status">
              {message.text}
            </div>
          ))}
      </div>

      {/* Important alerts */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="live-region"
      >
        {messages
          .filter(m => m.type === 'alert')
          .map(message => (
            <div key={message.id} role="alert">
              {message.text}
            </div>
          ))}
      </div>
    </div>
  );
};

// Helper function to dispatch messages
export const announce = (
  text: string,
  type: Message['type'] = 'status'
) => {
  const event = new CustomEvent('liveRegionUpdate', {
    detail: {
      text,
      type,
      id: Date.now().toString()
    }
  });
  window.dispatchEvent(event);
};

export default LiveRegion;