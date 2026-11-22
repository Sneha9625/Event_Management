import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays, CheckCircle2, Clock, Eye, Pencil, Plus, Trash2, Users } from 'lucide-react';
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
import StatCard from '../components/StatCard';
import EventBanner from '../components/EventBanner';
import { formatDate, formatTime, isPast } from '../utils/helpers';
import { getCategoryStyle } from '../utils/categories';

// Small "12 / 50" bar used in the table and cards
function RsvpBar({ count, capacity }) {
  const percent = Math.min(100, Math.round((count / capacity) * 100));
  return (
    <div className="w-full max-w-40">
      <p className="text-sm">
        <span className="font-semibold text-slate-900">{count}</span>
        <span className="text-slate-400"> / {capacity}</span>
      </p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// View / Edit / Attendees / Delete — icon buttons with labels for screen readers
function EventActions({ event, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <Button to={`/events/${event._id}`} variant="ghost" size="icon" aria-label={`View ${event.title}`} title="View">
        <Eye className="h-4 w-4" />
      </Button>
      <Button to={`/events/${event._id}/edit`} variant="ghost" size="icon" aria-label={`Edit ${event.title}`} title="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button to={`/events/${event._id}/attendees`} variant="ghost" size="icon" aria-label={`Attendees of ${event.title}`} title="Attendees">
        <Users className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(event)}
        className="hover:bg-rose-50 hover:text-rose-600"
        aria-label={`Delete ${event.title}`}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

const StatusBadge = ({ date }) =>
  isPast(date) ? <Badge variant="slate">Past</Badge> : <Badge variant="emerald">Upcoming</Badge>;

export default function OrganizerDashboard() {
  usePageTitle('Dashboard');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceRate, setAttendanceRate] = useState(null); // null = still loading
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get('/events/organizer/mine')
      .then(({ data }) => setEvents(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  // Attendance rate = attended / registered across all events.
  // The list endpoint has no "attended" numbers, so we read each event's
  // attendee list (fine for a handful of events).
  useEffect(() => {
    if (loading) return;
    const withRsvps = events.filter((e) => e.registeredCount > 0);
    if (withRsvps.length === 0) {
      setAttendanceRate('—');
      return;
    }
    Promise.all(withRsvps.map((e) => api.get(`/events/${e._id}/attendees`)))
      .then((responses) => {
        const attendees = responses.flatMap((res) => res.data.data.attendees);
        const attended = attendees.filter((a) => a.attended).length;
        setAttendanceRate(`${Math.round((attended / attendees.length) * 100)}%`);
      })
      .catch(() => setAttendanceRate('—'));
  }, [events, loading]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data } = await api.delete(`/events/${eventToDelete._id}`);
      toast.success(data.message);
      setEvents((prev) => prev.filter((e) => e._id !== eventToDelete._id));
      setEventToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const upcomingCount = events.filter((e) => !isPast(e.date)).length;
  const totalRsvps = events.reduce((sum, e) => sum + e.registeredCount, 0);

  return (
    <Container className="py-8 md:py-12">
      <PageHeader
        title="Organizer Dashboard"
        subtitle="Manage your events and see who's coming."
        actions={
          <Button to="/events/create">
            <Plus className="h-4 w-4" /> Create event
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="Total events" value={loading ? null : events.length} tone="indigo" />
        <StatCard icon={Users} label="Total registrations" value={loading ? null : totalRsvps} tone="violet" />
        <StatCard icon={Clock} label="Upcoming events" value={loading ? null : upcomingCount} tone="amber" />
        <StatCard icon={CheckCircle2} label="Attendance rate" value={attendanceRate} hint="Marked attended ÷ registered" tone="emerald" />
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">My events</h2>

        <div className="mt-6">
          {loading ? (
            <ListSkeleton rows={4} />
          ) : events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="You haven't created any events yet"
              message="Create your first event and start collecting RSVPs."
              action={<Button to="/events/create"><Plus className="h-4 w-4" /> Create event</Button>}
            />
          ) : (
            <>
              {/* Table on medium screens and up */}
              <Card className="hidden overflow-hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="px-5 py-3">Event</th>
                      <th scope="col" className="px-5 py-3">Date</th>
                      <th scope="col" className="px-5 py-3">Registrations</th>
                      <th scope="col" className="px-5 py-3">Status</th>
                      <th scope="col" className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((event) => (
                      <tr key={event._id} className="transition hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg">
                              <EventBanner src={event.bannerUrl} category={event.category} title={event.title} seed={event._id} />
                            </div>
                            <div className="min-w-0">
                              <Link to={`/events/${event._id}`} className="line-clamp-1 font-semibold text-slate-900 hover:text-indigo-600">
                                {event.title}
                              </Link>
                              <Badge variant={getCategoryStyle(event.category).badge} className="mt-1">{event.category}</Badge>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="font-medium text-slate-900">{formatDate(event.date)}</p>
                          <p className="text-slate-500">{formatTime(event.date)}</p>
                        </td>
                        <td className="px-5 py-4"><RsvpBar count={event.registeredCount} capacity={event.capacity} /></td>
                        <td className="px-5 py-4"><StatusBadge date={event.date} /></td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end"><EventActions event={event} onDelete={setEventToDelete} /></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {/* Cards on phones */}
              <div className="space-y-4 md:hidden">
                {events.map((event) => (
                  <Card key={event._id} className="overflow-hidden">
                    <div className="flex gap-4 p-4">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                        <EventBanner src={event.bannerUrl} category={event.category} title={event.title} seed={event._id} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/events/${event._id}`} className="line-clamp-2 font-semibold text-slate-900">{event.title}</Link>
                          <StatusBadge date={event.date} />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{formatDate(event.date)} • {formatTime(event.date)}</p>
                        <div className="mt-2"><RsvpBar count={event.registeredCount} capacity={event.capacity} /></div>
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-slate-100 px-2 py-1">
                      <EventActions event={event} onDelete={setEventToDelete} />
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <ConfirmModal
        open={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this event?"
        message={eventToDelete && `"${eventToDelete.title}" and all of its registrations will be permanently removed. This can't be undone.`}
        confirmLabel="Delete event"
      />
    </Container>
  );
}
