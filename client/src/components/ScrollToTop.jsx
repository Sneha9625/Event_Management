import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// On every new page: jump to the top — or, if the URL has a #hash
// (e.g. "/#how-it-works" from the navbar), scroll to that section instead.
// Changing only ?search= on the Home page does not trigger this.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // Wait one tick so the page has rendered the section
    const timer = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
