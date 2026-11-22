import { ArrowUpRight } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from './SectionHeading';
import { CATEGORIES, getCategoryStyle } from '../../utils/categories';
import { cn } from '../../utils/cn';

// Photo tiles for each category; clicking one filters the events list below
export default function CategoryShowcase({ counts, onSelect }) {
  return (
    <Container as="section" size="full" className="py-16 md:py-24">
      <SectionHeading
        eyebrow="Browse by category"
        title="Something for every kind of evening"
        text="Pick a vibe and we'll show you what's coming up."
      />

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((category, index) => {
          const { Icon, tagline, images } = getCategoryStyle(category);
          const count = counts?.[category];
          return (
            <button
              key={category}
              onClick={() => onSelect(category)}
              className={cn(
                'group relative overflow-hidden rounded-2xl text-left shadow-sm ring-1 ring-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                // First tile spans the full row on phones so 5 tiles don't leave a gap
                index === 0 ? 'col-span-2 aspect-[2/1] sm:col-span-1 sm:aspect-[4/5]' : 'aspect-[4/5]'
              )}
            >
              <img
                src={images[0]}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" aria-hidden />

              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>

              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="font-display text-lg font-bold text-white">{category}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-200">{tagline}</p>
                <p className="mt-2 text-xs font-semibold text-white/90">
                  {count === undefined ? ' ' : `${count} upcoming`}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Container>
  );
}
