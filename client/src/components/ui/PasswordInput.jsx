import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import Field, { inputClasses } from './Field';

// Password box with a show/hide toggle
export default function PasswordInput({ id, label, error, hint, className, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputClasses({ error, padding: 'pl-10 pr-11' })}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );
}
