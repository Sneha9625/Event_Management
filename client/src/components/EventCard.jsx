import { Link } from 'react-router-dom';
import { Clock, MapPin, Users } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import EventBanner from './EventBanner';
import { formatDateTime, getDateParts } from '../utils/helpers';
import { getCategoryStyle } from '../utils/categories';
import { cn } from '../utils/cn';

// Text + colour for the "spots left" label
const getAvailability = (spotsLeft) => {
  if (spotsLeft <= 0) return { text: 'Sold out', color: 'text-rose-600' };
  const text = `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`;
  return { text, color: spotsLeft <= 10 ? 'text-amber-600' : 'text-emerald-600' };
};

export default function EventCard({ event }) {
  const { day, month } = getDateParts(event.date);
  const availability = getAvailability(event.capacity - (event.registeredCount || 0));

  return (
    <Card
      as={Link}
      to={`/events/${event._id}`}
      hover
      className="group flex flex-col overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <EventBanner
          src={event.bannerUrl}
          category={event.category}
          title={event.title}
          seed={event._id}
          className="transition duration-500 group-hover:scale-105"
        />
        <Badge variant={getCategoryStyle(event.category).badge} className="absolute left-3 top-3 shadow-sm">
          {event.category}
        </Badge>
        {/* Calendar-style date badge */}
        <div className="absolute right-3 top-3 min-w-12 rounded-lg bg-white/95 px-2 py-1.5 text-center shadow-sm backdrop-blur">
          <p className="text-lg font-bold leading-none text-slate-900">{day}</p>
          <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-indigo-600">{month}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-sm font-medium text-indigo-600">
          <Clock className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{formatDateTime(event.date)}</span>
        </p>
        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-slate-900 transition group-hover:text-indigo-600">
          {event.title}
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{event.venue}</span>
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
          <span className="truncate text-slate-400">{event.organizer?.name && `by ${event.organizer.name}`}</span>
          <span className={cn('flex shrink-0 items-center gap-1 font-medium', availability.color)}>
            <Users className="h-4 w-4" aria-hidden />
            {availability.text}
          </span>
        </div>
      </div>
    </Card>
  );
}
