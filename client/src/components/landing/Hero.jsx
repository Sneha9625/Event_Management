import { Link } from 'react-router-dom';
import { CalendarDays, ShieldCheck, Ticket } from 'lucide-react';
import Container from '../ui/Container';
import SearchBar from '../SearchBar';
import EventBanner from '../EventBanner';
import { formatDateTime } from '../../utils/helpers';

const POPULAR = ['Tech', 'Music', 'Workshop'];

// Floating "next event" card on top of the hero photo — uses real data
function NextEventCard({ event }) {
  if (!event) return null;
  return (
    <Link
      to={`/events/${event._id}`}
      className="absolute -bottom-6 -left-4 flex w-72 items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur transition hover:-translate-y-0.5 sm:-left-8"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
        <EventBanner src={event.bannerUrl} category={event.category} title={event.title} seed={event._id} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Next up</p>
        <p className="truncate text-sm font-semibold text-slate-900">{event.title}</p>
        <p className="flex items-center gap-1 truncate text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" /> {formatDateTime(event.date)}
        </p>
      </div>
    </Link>
  );
}

export default function Hero({ search, category, onSearch, onCategory, nextEvent, totalUpcoming }) {
  return (
    <section className="relative w-full overflow-hidden border-b border-slate-200 bg-white">
      {/* Background: soft colour glow + faint grid, faded out towards the bottom */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-200/60 via-violet-200/50 to-pink-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f033_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f033_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <Container size="full" className="relative grid items-center gap-14 py-14 md:py-20 lg:grid-cols-12 lg:gap-10 lg:py-24">
        {/* Left: copy + search */}
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
            <Ticket className="h-4 w-4" aria-hidden /> Free RSVPs with instant email confirmation
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Discover & Host{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Amazing Events
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            From tech meetups to sunset concerts — find what&apos;s happening near you, save your spot in one click,
            or publish your own event in minutes.
          </p>

          <SearchBar
            key={`${search}|${category}`}
            initialSearch={search}
            initialCategory={category}
            onSearch={onSearch}
            className="mt-8 max-w-2xl border border-slate-200 shadow-lg shadow-slate-200/60"
          />

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Popular:</span>
            {POPULAR.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategory(cat)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {cat}
              </button>
            ))}
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-slate-200 pt-6">
            <div>
              <dt className="text-sm text-slate-500">Upcoming events</dt>
              <dd className="font-display text-2xl font-bold text-slate-900">{totalUpcoming ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Categories</dt>
              <dd className="font-display text-2xl font-bold text-slate-900">5</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Cost to RSVP</dt>
              <dd className="font-display text-2xl font-bold text-slate-900">₹0</dd>
            </div>
          </dl>
        </div>

        {/* Right: photo with floating cards */}
        <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none xl:pl-8">
          <div className="absolute -inset-4 -z-0 rotate-3 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-500 opacity-15" aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-indigo-900/20 ring-1 ring-slate-900/5 lg:aspect-auto lg:h-[540px] xl:h-[600px]">
            <img src="/images/hero-main.webp" alt="People at a community meetup" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" aria-hidden />
          </div>

          <NextEventCard event={nextEvent} />
        </div>
      </Container>

      <Container size="full" className="relative pb-6">
        <p className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4" aria-hidden /> Every account is email-verified before it can RSVP or host.
        </p>
      </Container>
    </section>
  );
}
