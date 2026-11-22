import { Link } from 'react-router-dom';
import { ArrowLeft, BellRing, MapPinned, ShieldCheck, Ticket } from 'lucide-react';
import Logo from './Logo';

const HIGHLIGHTS = [
  { icon: Ticket, text: 'RSVP to any event in one click' },
  { icon: BellRing, text: 'Instant email confirmations' },
  { icon: MapPinned, text: 'Every venue pinned on a map' },
];

/**
 * Full-screen split layout for Login / Register / VerifyOtp (no main navbar or footer,
 * so the user can focus on the form).
 * Left: logo, form and fine print. Right (desktop): photo with headline and highlights.
 */
export default function AuthLayout({ title, subtitle, children, footer, image, panelTitle, panelText }) {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* ---------- Form side ---------- */}
      <div className="flex w-full flex-col px-4 py-6 sm:px-8 lg:w-1/2 lg:px-12 xl:px-20">
        <header className="flex items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </header>

        <main className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-md py-12">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-3 text-base leading-relaxed text-slate-600">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-sm text-slate-600">{footer}</div>}
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} EventHub</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" aria-hidden /> Passwords are encrypted · Emails are verified
          </span>
        </footer>
      </div>

      {/* ---------- Photo side (desktop only); sticky so it stays put while the form scrolls ---------- */}
      <div className="relative hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:w-1/2">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-indigo-950/30" aria-hidden />

        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <h2 className="max-w-lg text-4xl font-bold leading-tight tracking-tight text-white">{panelTitle}</h2>
          {panelText && <p className="mt-4 max-w-md text-lg text-slate-300">{panelText}</p>}

          <ul className="mt-8 grid max-w-lg gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur-md">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
