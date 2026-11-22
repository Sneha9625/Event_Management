import { cn } from '../../utils/cn';

// Shared look for every text-like control. `padding` is passed in (instead of
// overriding later) so icon inputs don't end up with two conflicting paddings.
export const inputClasses = ({ error, padding = 'px-3.5' } = {}) =>
  cn(
    'block min-h-11 w-full rounded-lg border bg-white text-base text-slate-900 shadow-sm transition sm:text-sm',
    'placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30',
    'disabled:cursor-not-allowed disabled:bg-slate-50',
    error ? 'border-rose-300' : 'border-slate-200',
    padding
  );

// Label + control + error/hint text. Used by Input, Select, Textarea.
export default function Field({ id, label, error, hint, className, children }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-rose-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-sm text-slate-400">{hint}</p>
      )}
    </div>
  );
}
