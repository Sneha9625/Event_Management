import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './ui/Button';
import { cn } from '../utils/cn';

// Page list with gaps, e.g. current=5, total=10 → [1, '…', 4, 5, 6, '…', 10]
const getPageNumbers = (current, total) => {
  const pages = [];
  for (let page = 1; page <= total; page++) {
    if (page === 1 || page === total || Math.abs(page - current) <= 1) pages.push(page);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return pages;
};

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-12 flex items-center justify-between gap-3 border-t border-slate-200 pt-6" aria-label="Pagination">
      <Button variant="outline" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Page numbers on larger screens; simple "Page x of y" on phones */}
      <p className="text-sm text-slate-600 sm:hidden">
        Page <span className="font-semibold text-slate-900">{page}</span> of {totalPages}
      </p>
      <ul className="hidden items-center gap-1 sm:flex">
        {getPageNumbers(page, totalPages).map((item, index) =>
          item === '…' ? (
            <li key={`gap-${index}`} className="px-2 text-slate-400">…</li>
          ) : (
            <li key={item}>
              <button
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  item === page ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {item}
              </button>
            </li>
          )
        )}
      </ul>

      <Button variant="outline" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
