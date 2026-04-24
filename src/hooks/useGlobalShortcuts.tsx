import { useEffect } from 'react';

/**
 * Listens for Ctrl/Cmd + K to toggle global search.
 */
export function useGlobalShortcuts(onToggleSearch: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggleSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onToggleSearch]);
}
