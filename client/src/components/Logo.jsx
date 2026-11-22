import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { cn } from '../utils/cn';

// `light` = white text for dark backgrounds (footer, gradient panels)
export default function Logo({ light = false, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', light ? 'bg-white/10' : 'bg-indigo-600')}>
        <Ticket className="h-5 w-5 text-white" aria-hidden />
      </span>
      <span className={cn('text-lg font-bold tracking-tight', light ? 'text-white' : 'text-slate-900')}>EventHub</span>
    </Link>
  );
}
