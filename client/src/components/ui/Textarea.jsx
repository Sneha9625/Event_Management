import Field, { inputClasses } from './Field';

export default function Textarea({ id, label, error, hint, className, rows = 5, ...props }) {
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClasses({ error, padding: 'px-3.5 py-2.5' })} resize-y`}
        {...props}
      />
    </Field>
  );
}
