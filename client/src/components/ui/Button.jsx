import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const VARIANTS = {
  primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700',
  secondary: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  outline: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700',
  'danger-outline': 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  // For use on the indigo gradient (hero, auth panel)
  light: 'bg-white text-indigo-700 shadow-sm hover:bg-indigo-50',
  glass: 'border border-white/30 text-white hover:bg-white/10',
};

// min-h-11 (44px) keeps every button easy to tap on phones
const SIZES = {
  sm: 'min-h-11 px-3 text-sm sm:min-h-9',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-6 text-base',
  icon: 'h-11 w-11 sm:h-9 sm:w-9', // square icon-only button
};

/**
 * <Button variant="primary" size="md" loading={saving}>Save</Button>
 * Pass `to` to render a router <Link> that looks like a button.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  to,
  type = 'button',
  disabled,
  className,
  children,
  ...props
}) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
