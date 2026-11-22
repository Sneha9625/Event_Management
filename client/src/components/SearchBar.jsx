import { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import Button from './ui/Button';
import { CATEGORIES } from '../utils/categories';
import { cn } from '../utils/cn';

// Big hero search: text + category dropdown. Keeps its own values while typing
// and only reports them on submit, so we don't call the API on every keystroke.
export default function SearchBar({ initialSearch = '', initialCategory = 'All', onSearch, className }) {
  const [text, setText] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search: text.trim(), category });
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn(
        'flex flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row sm:items-center',
        className
      )}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search events by title..."
          aria-label="Search events"
          className="min-h-12 w-full rounded-xl border-0 bg-transparent pl-12 pr-10 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {text && (
          <button
            type="button"
            onClick={() => setText('')}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search text"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="hidden h-8 w-px bg-slate-200 sm:block" aria-hidden />

      <div className="relative sm:w-48">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
          className="min-h-12 w-full appearance-none rounded-xl border-0 bg-slate-50 pl-4 pr-10 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:bg-transparent sm:text-sm"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
      </div>

      <Button type="submit" size="lg" className="sm:px-8">
        <Search className="h-5 w-5" aria-hidden /> Search
      </Button>
    </form>
  );
}
