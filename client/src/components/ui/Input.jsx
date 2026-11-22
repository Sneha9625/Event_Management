import Field, { inputClasses } from './Field';

/**
 * <Input id="email" label="Email" icon={Mail} error={errors.email} />
 * `icon` is an optional lucide icon shown inside the box on the left.
 */
export default function Input({ id, label, error, hint, icon: Icon, className, ...props }) {
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        )}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputClasses({ error, padding: Icon ? 'pl-10 pr-3.5' : 'px-3.5' })}
          {...props}
        />
      </div>
    </Field>
  );
}
