import { useState } from 'react';
import { getCategoryImage, getCategoryStyle } from '../utils/categories';
import { cn } from '../utils/cn';

/**
 * Event image. Order of preference:
 * 1. the organizer's uploaded banner
 * 2. a stock photo for the category (so cards never look empty)
 * 3. a coloured gradient with the category icon (if even that fails to load)
 * `seed` (the event id) keeps the stock photo the same for an event.
 */
export default function EventBanner({ src, category, title, seed, className }) {
  const fallbackPhoto = getCategoryImage(category, seed);
  const [imageUrl, setImageUrl] = useState(src || fallbackPhoto);
  const [failed, setFailed] = useState(false);
  const { gradient, Icon } = getCategoryStyle(category);

  const handleError = () => {
    // Uploaded banner broken → try the stock photo; stock photo broken → gradient
    if (imageUrl !== fallbackPhoto) setImageUrl(fallbackPhoto);
    else setFailed(true);
  };

  if (!failed) {
    return (
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        className={cn('h-full w-full object-cover', className)}
        onError={handleError}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={title}
      className={cn('relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br', gradient, className)}
    >
      <Icon className="h-12 w-12 text-white/90" strokeWidth={1.5} aria-hidden />
    </div>
  );
}
