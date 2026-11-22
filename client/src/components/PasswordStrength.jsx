import { cn } from '../utils/cn';

// Rough strength score (0–4) from length and character variety — just a hint for the user
const getScore = (password) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const LEVELS = [
  { label: 'Too short', color: 'bg-rose-500', text: 'text-rose-600' },
  { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' },
  { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' },
  { label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-600' },
  { label: 'Strong', color: 'bg-emerald-600', text: 'text-emerald-700' },
];

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const score = getScore(password);
  const level = LEVELS[score];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className={cn('h-1 flex-1 rounded-full transition-colors', step <= score ? level.color : 'bg-slate-200')} />
        ))}
      </div>
      <p className={cn('mt-1.5 text-xs font-medium', level.text)}>
        {level.label}
        {score < 3 && <span className="font-normal text-slate-400"> · try 10+ characters with a number and symbol</span>}
      </p>
    </div>
  );
}
