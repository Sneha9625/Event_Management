// Joins class names and skips falsy values:
// cn('px-4', isActive && 'bg-indigo-600') → "px-4 bg-indigo-600" or "px-4"
export const cn = (...classes) => classes.filter(Boolean).join(' ');
