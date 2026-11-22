import { ChevronDown } from 'lucide-react';
import Field, { inputClasses } from './Field';

// Native <select> (great on mobile) with our styling and a custom arrow
export default function Select({ id, label, error, hint, className, children, ...props }) {
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          className={`${inputClasses({ error, padding: 'pl-3.5 pr-10' })} appearance-none`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
      </div>
    </Field>
  );
}
