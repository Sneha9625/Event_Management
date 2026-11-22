import { useEffect } from 'react';

// Sets the browser tab title, e.g. usePageTitle('My Events') → "My Events · EventHub"
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · EventHub` : 'EventHub';
  }, [title]);
}
