import { useEffect } from 'react';

// Closes a dropdown when the user clicks outside `ref` or presses Escape
export default function useDismiss(ref, open, close) {
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => !ref.current?.contains(e.target) && close();
    const handleKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, open, close]);
}
