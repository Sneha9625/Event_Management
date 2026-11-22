import { Laptop, Music, Trophy, Wrench, Sparkles } from 'lucide-react';

export const CATEGORIES = ['Tech', 'Music', 'Sports', 'Workshop', 'Other'];

// Badge colour, icon, a short tagline and two stock photos per category.
// Photos (from Unsplash, free to use) live in client/public/images and are shown
// whenever an event has no banner of its own.
const CATEGORY_STYLES = {
  Tech: {
    badge: 'blue', gradient: 'from-blue-500 to-indigo-600', Icon: Laptop,
    tagline: 'Talks, meetups & hackathons', images: ['/images/tech-1.webp', '/images/tech-2.webp'],
  },
  Music: {
    badge: 'pink', gradient: 'from-pink-500 to-rose-600', Icon: Music,
    tagline: 'Concerts, gigs & open mics', images: ['/images/music-1.webp', '/images/music-2.webp'],
  },
  Sports: {
    badge: 'emerald', gradient: 'from-emerald-500 to-teal-600', Icon: Trophy,
    tagline: 'Runs, rides & tournaments', images: ['/images/sports-1.webp', '/images/sports-2.webp'],
  },
  Workshop: {
    badge: 'amber', gradient: 'from-amber-400 to-orange-600', Icon: Wrench,
    tagline: 'Hands-on classes & bootcamps', images: ['/images/workshop-1.webp', '/images/workshop-2.webp'],
  },
  Other: {
    badge: 'violet', gradient: 'from-violet-500 to-purple-700', Icon: Sparkles,
    tagline: 'Networking, socials & more', images: ['/images/other-1.webp', '/images/other-2.webp'],
  },
};

export const getCategoryStyle = (category) => CATEGORY_STYLES[category] || CATEGORY_STYLES.Other;

// Picks one of the category's photos. Using the event id as a "seed" means
// each event always gets the same photo, but events in one category still vary.
export const getCategoryImage = (category, seed = '') => {
  const { images } = getCategoryStyle(category);
  const sum = [...String(seed)].reduce((total, char) => total + char.charCodeAt(0), 0);
  return images[sum % images.length];
};
