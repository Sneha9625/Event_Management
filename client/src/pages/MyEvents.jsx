import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarCheck2, CalendarDays, Clock, History, MapPin } from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import usePageTitle from '../hooks/usePageTitle';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { ListSkeleton } from '../components/ui/Skeleton';
import { ConfirmModal } from '../components/ui/Modal';
import PageHeader from '../components/PageHeader';
import EventBanner from '../components/EventBanner';
import { formatDateTime, isPast } from '../utils/helpers';
import { getCategoryStyle } from '../utils/categories';
import { cn } from '../utils/cn';

// One registration shown as a horizontal card
function RegistrationCard({ registration, onCancel }) {
  const { event, attended } = registration;
  const past = isPast(event.date);

  return (
    <Card hover className="flex flex-col overflow-hidden sm:flex-row">
      <Link to={`/events/${event._id}`} className="relative aspect-video shrink-0 overflow-hidden sm:aspect-auto sm:w-60">
        <EventBanner src={event.bannerUrl} category={event.category} title={event.title} seed={event._id} />
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant={getCategoryStyle(event.category).badge}>{event.category}</Badge>
            {past && (attended ? <Badge variant="emerald">Attended</Badge> : <Badge variant="slate">Ended</Badge>)}
          </div>
          <Link to={`/events/${event._id}`} className="line-clamp-2 text-lg font-semibold text-slate-900 hover:text-indigo-600">
            {event.title}
          </Link>
          <p className="flex items-center gap-1.5 text-sm text-slate-600">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden /> {formatDateTime(event.date)}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <span className="truncate">{event.venue}</span>
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button to={`/events/${event._id}`} variant="outline" className="flex-1 sm:flex-none">View</Button>
          {!past && (
            <Button variant="danger-outline" onClick={() => onCancel(event)} className="flex-1 sm:flex-none">
              Cancel RSVP
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function MyEvents() {
  usePageTitle('My Events');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [eventToCancel, setEventToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api
      .get('/registrations/my')
      .then(({ data }) => setRegistrations(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data } = await api.delete(`/registrations/${eventToCancel._id}`);
      toast.success(data.message);
      // Remove it from the list without re-fetching
      setRegistrations((prev) => prev.filter((reg) => reg.event._id !== eventToCancel._id));
      setEventToCancel(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCancelling(false);
    }
  };

  const upcoming = registrations.filter((reg) => !isPast(reg.event.date));
  // Past events: most recent first
  const past = registrations.filter((reg) => isPast(reg.event.date)).reverse();
  const shown = tab === 'upcoming' ? upcoming : past;

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { key: 'past', label: 'Past', count: past.length },
  ];

  return (
    <Container className="py-8 md:py-12">
      <PageHeader title="My Events" subtitle="Events you've RSVP'd to." />

      {/* Tabs */}
      <div className="border-b border-slate-200" role="tablist" aria-label="Filter my events">
        <div className="-mb-px flex gap-6">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                'flex min-h-11 items-center gap-2 border-b-2 px-1 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              )}
            >
              {label}
              <span className={cn('rounded-full px-2 py-0.5 text-xs', tab === key ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600')}>
                {loading ? '…' : count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8" role="tabpanel">
        {loading ? (
          <ListSkeleton rows={3} />
        ) : shown.length === 0 ? (
          tab === 'upcoming' ? (
            <EmptyState
              icon={CalendarCheck2}
              title="No upcoming RSVPs"
              message="When you RSVP to an event, it will show up here."
              action={<Button to="/"><CalendarDays className="h-4 w-4" /> Browse events</Button>}
            />
          ) : (
            <EmptyState icon={History} title="No past events yet" message="Events you've attended will appear here." />
          )
        ) : (
          <div className="space-y-4">
            {shown.map((registration) => (
              <RegistrationCard key={registration._id} registration={registration} onCancel={setEventToCancel} />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(eventToCancel)}
        onClose={() => setEventToCancel(null)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel your RSVP?"
        message={eventToCancel && `You'll lose your spot at "${eventToCancel.title}". You can RSVP again later if spots are still available.`}
        confirmLabel="Cancel RSVP"
        cancelLabel="Keep my spot"
      />
    </Container>
  );
}
