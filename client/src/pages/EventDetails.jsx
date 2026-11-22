import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, CalendarDays, CheckCircle2, Clock, MapPin, MapPinOff, Pencil, Trash2, Users,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { ConfirmModal } from '../components/ui/Modal';
import MapView from '../components/MapView';
import EventBanner from '../components/EventBanner';
import NotFound from './NotFound';
import { formatDate, formatTime, getInitials, isPast } from '../utils/helpers';
import { getCategoryStyle } from '../utils/categories';
import { cn } from '../utils/cn';

// One icon + label + value row in the booking card
function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
        <Icon className="h-5 w-5 text-indigo-600" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <div className="text-sm font-medium text-slate-900">{children}</div>
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <Container className="py-8 md:py-12">
      <Skeleton className="h-56 w-full rounded-2xl sm:h-72 lg:h-96" />
      <Skeleton className="mt-8 h-10 w-2/3" />
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </Container>
  );
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'cancel' | 'delete' | null

  usePageTitle(event?.title || 'Event');

  // Load the event (public)
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data.data);
      } catch (error) {
        const status = error.response?.status;
        if (status === 404 || status === 400) setNotFound(true);
        else toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // If logged in, check whether this user already has an RSVP
  useEffect(() => {
    if (authLoading || !user) {
      setIsRegistered(false);
      return;
    }
    api
      .get('/registrations/my')
      .then(({ data }) => setIsRegistered(data.data.some((reg) => reg.event._id === id)))
      .catch(() => setIsRegistered(false));
  }, [id, user, authLoading]);

  if (loading) return <DetailsSkeleton />;
  if (notFound || !event) {
    return <NotFound icon={CalendarDays} title="Event not found" message="This event doesn't exist or was removed." />;
  }

  const isOwner = user && event.organizer?._id === user._id;
  const isAdmin = user?.role === 'admin';
  const past = isPast(event.date);
  const spotsLeft = event.capacity - event.registeredCount;
  const isFull = spotsLeft <= 0;
  const fillPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const hasLocation = event.location?.lat != null && event.location?.lng != null;

  const handleRsvp = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/registrations/${id}`);
      toast.success(data.message);
      setIsRegistered(true);
      setEvent((prev) => ({ ...prev, registeredCount: prev.registeredCount + 1 }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.delete(`/registrations/${id}`);
      toast.success(data.message);
      setIsRegistered(false);
      setEvent((prev) => ({ ...prev, registeredCount: prev.registeredCount - 1 }));
      setConfirm(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.delete(`/events/${id}`);
      toast.success(data.message);
      navigate(isOwner ? '/dashboard' : '/');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setActionLoading(false);
    }
  };

  // Decide which RSVP control to show
  const renderRsvp = () => {
    if (isOwner) return null;
    if (!user) {
      return (
        <Button to="/login" state={{ from: `/events/${id}` }} size="lg" fullWidth>
          Log in to RSVP
        </Button>
      );
    }
    if (isRegistered) {
      return (
        <>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden /> You&apos;re going!
          </div>
          {!past && (
            <Button variant="outline" size="lg" fullWidth onClick={() => setConfirm('cancel')}>
              Cancel RSVP
            </Button>
          )}
        </>
      );
    }
    if (past) return <Button variant="outline" size="lg" fullWidth disabled>This event has ended</Button>;
    if (isFull) return <Button variant="outline" size="lg" fullWidth disabled>Sold out</Button>;
    return (
      <Button size="lg" fullWidth onClick={handleRsvp} loading={actionLoading}>
        {actionLoading ? 'Saving your spot...' : 'RSVP now — it’s free'}
      </Button>
    );
  };

  return (
    <Container className="py-8 md:py-12">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 rounded text-sm font-medium text-slate-500 transition hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      {/* Banner */}
      <div className="h-56 w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm sm:h-72 lg:h-96">
        <EventBanner src={event.bannerUrl} category={event.category} title={event.title} seed={event._id} />
      </div>

      {/* Title + host (full width so the booking card sits next to the content below) */}
      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getCategoryStyle(event.category).badge}>{event.category}</Badge>
          {past && <Badge variant="slate">Past event</Badge>}
          {isOwner && <Badge variant="indigo">You&apos;re hosting</Badge>}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{event.title}</h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            {getInitials(event.organizer?.name)}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Hosted by</p>
            <p className="truncate font-semibold text-slate-900">{event.organizer?.name}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Booking card: first on phones (right after the title), right column on desktop */}
        <aside className="lg:order-last">
          <Card className="space-y-5 p-6 lg:sticky lg:top-24">
            <InfoRow icon={CalendarDays} label="Date">{formatDate(event.date)}</InfoRow>
            <InfoRow icon={Clock} label="Time">{formatTime(event.date)}</InfoRow>
            <InfoRow icon={MapPin} label="Venue">{event.venue}</InfoRow>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <Users className="h-4 w-4" aria-hidden /> Capacity
                </span>
                <span className="font-semibold text-slate-900">
                  {event.registeredCount} / {event.capacity} spots
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuenow={fillPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Spots taken"
              >
                <div
                  className={cn('h-full rounded-full transition-all', isFull ? 'bg-rose-500' : fillPercent >= 80 ? 'bg-amber-500' : 'bg-indigo-600')}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
              <p className={cn('mt-2 text-sm', isFull ? 'font-medium text-rose-600' : 'text-slate-500')}>
                {isFull ? 'Sold out' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
              </p>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-5">
              {renderRsvp()}

              {isOwner && (
                <>
                  <Button to={`/events/${id}/attendees`} size="lg" fullWidth>
                    <Users className="h-5 w-5" /> View attendees
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button to={`/events/${id}/edit`} variant="outline">
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button variant="danger-outline" onClick={() => setConfirm('delete')}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </>
              )}

              {isAdmin && !isOwner && (
                <Button variant="danger-outline" fullWidth onClick={() => setConfirm('delete')}>
                  <Trash2 className="h-4 w-4" /> Delete event (admin)
                </Button>
              )}
            </div>
          </Card>
        </aside>

        {/* Main content */}
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">About this event</h2>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-slate-600">{event.description}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Location</h2>
            <p className="mt-2 flex items-center gap-1.5 text-slate-600">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden /> {event.venue}
            </p>
            <div className="mt-4">
              {hasLocation ? (
                <MapView lat={event.location.lat} lng={event.location.lng} label={event.venue} />
              ) : (
                <Card className="flex items-center gap-3 p-5 text-sm text-slate-500">
                  <MapPinOff className="h-5 w-5 text-slate-400" aria-hidden />
                  Map not available for this venue.
                </Card>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Organizer</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                {getInitials(event.organizer?.name)}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{event.organizer?.name}</p>
                <a href={`mailto:${event.organizer?.email}`} className="truncate text-sm text-indigo-600 hover:text-indigo-700">
                  {event.organizer?.email}
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={confirm === 'cancel'}
        onClose={() => setConfirm(null)}
        onConfirm={handleCancel}
        loading={actionLoading}
        title="Cancel your RSVP?"
        message={`You'll lose your spot at "${event.title}". You can RSVP again later if spots are still available.`}
        confirmLabel="Cancel RSVP"
        cancelLabel="Keep my spot"
      />
      <ConfirmModal
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="Delete this event?"
        message={`"${event.title}" and all of its ${event.registeredCount} registration(s) will be permanently removed. This can't be undone.`}
        confirmLabel="Delete event"
      />
    </Container>
  );
}
