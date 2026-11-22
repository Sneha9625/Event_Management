import Card from './ui/Card';
import Skeleton from './ui/Skeleton';
import { cn } from '../utils/cn';

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
};

// Number tile for dashboards. `value` of null shows a loading placeholder.
export default function StatCard({ icon: Icon, label, value, hint, tone = 'indigo' }) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', TONES[tone])}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {value === null ? (
          <Skeleton className="mt-2 h-7 w-16" />
        ) : (
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        )}
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
    </Card>
  );
}
