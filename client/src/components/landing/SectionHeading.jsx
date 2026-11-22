import { cn } from '../../utils/cn';

// Small label + big title + optional text, used at the top of landing sections
export default function SectionHeading({ eyebrow, title, text, center = false, dark = false, children }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', center && 'items-center text-center sm:flex-col sm:items-center')}>
      <div className={cn('max-w-2xl', center && 'mx-auto')}>
        {eyebrow && (
          <p className={cn('text-sm font-semibold uppercase tracking-wider', dark ? 'text-indigo-300' : 'text-indigo-600')}>{eyebrow}</p>
        )}
        <h2 className={cn('mt-2 text-3xl font-bold tracking-tight md:text-4xl', dark ? 'text-white' : 'text-slate-900')}>{title}</h2>
        {text && <p className={cn('mt-3 text-base leading-relaxed md:text-lg', dark ? 'text-slate-300' : 'text-slate-600')}>{text}</p>}
      </div>
      {children}
    </div>
  );
}
