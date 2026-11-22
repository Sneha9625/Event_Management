import { Loader2 } from 'lucide-react';

// Centered spinner for whole-page loading (e.g. while checking the login token)
export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden />
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}
