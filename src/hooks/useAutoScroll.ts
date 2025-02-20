import { useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface UseAutoScrollOptions {
  elementId?: string;
  behavior?: ScrollBehavior;
  offset?: number;
  delay?: number;
}

const useAutoScroll = ({
  elementId = 'current-question',
  behavior = 'smooth',
  offset = 100,
  delay = 100
}: UseAutoScrollOptions = {}) => {
  const scrollToElement = useCallback(() => {
    const debouncedScroll = debounce(() => {
      const element = document.getElementById(elementId);
      if (!element) return;

      const elementRect = element.getBoundingClientRect();
      const shouldScroll = elementRect.top < offset || elementRect.bottom > window.innerHeight;

      if (shouldScroll) {
        const scrollTop = window.pageYOffset + elementRect.top - offset;
        window.scrollTo({
          top: scrollTop,
          behavior
        });
      }
    }, delay);

    debouncedScroll();
  }, [elementId, behavior, offset, delay]);

  useEffect(() => {
    return () => {
      scrollToElement.cancel();
    };
  }, [scrollToElement]);

  return scrollToElement;
};

export default useAutoScroll;