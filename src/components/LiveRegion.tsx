import React, { useEffect, useRef } from 'react';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import './styles.css';

interface Message {
  text: string;
  type: 'status' | 'alert' | 'info';
  id: string;
}

interface LiveRegionProps {
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
  filter?: (message: Message) => boolean;
}

const LiveRegion: React.FC<LiveRegionProps> = ({
  politeness = 'polite',
  clearAfter = 5000,
  filter = () => true
}) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const { activeShortcut } = useKeyboardShortcuts();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const addMessage = React.useCallback((message: Message) => {
    if (!filter(message)) return;

    setMessages(prev => [...prev, message]);

    if (clearAfter > 0) {
      timeoutRef.current = setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== message.id));
      }, clearAfter);
    }
  }, [clearAfter, filter]);

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

  return (
    <>
      {/* Polite announcements */}
      <div
        aria-live={politeness}
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
    </>
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