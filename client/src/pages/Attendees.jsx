import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays, CheckCircle2, Download, Lock, MapPin, Search, SearchX, Users } from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import usePageTitle from '../hooks/usePageTitle';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Switch from '../components/ui/Switch';
import EmptyState from '../components/ui/EmptyState';
import Skeleton, { ListSkeleton } from '../components/ui/Skeleton';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import NotFound from './NotFound';
import { formatDate, formatDateTime, getInitials } from '../utils/helpers';

// Builds a CSV file in the browser and downloads it (no server needed)
const exportCsv = (eventTitle, attendees) => {
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Name', 'Email', 'Registered on', 'Attended'],
    ...attendees.map((a) => [a.user?.name, a.user?.email, formatDateTime(a.createdAt), a.attended ? 'Yes' : 'No']),
  ];
  const csv = rows.map((row) => row.map(escape).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${eventTitle.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-attendees.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

function Avatar({ name }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
      {getInitials(name || '?')}
    </span>
  );
}

export default function Attendees() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [query, setQuery] = useState('');

  usePageTitle(event ? `Attendees · ${event.title}` : 'Attendees');

  useEffect(() => {
    api
      .get(`/events/${id}/attendees`)
      .then(({ data }) => {
        setEvent(data.data.event);
        setAttendees(data.data.attendees);
      })
      .catch((error) => setErrorMessage(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [id]);

  // Optimistic update: flip the switch immediately, undo it if the server says no
  const toggleAttended = async (registrationId, attended) => {
    const setAttended = (value) =>
      setAttendees((prev) => prev.map((a) => (a._id === registrationId ? { ...a, attended: value } : a)));

    setAttended(attended);
    try {
      await api.patch(`/registrations/${registrationId}/attendance`, { attended });
    } catch (error) {
      setAttended(!attended);
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <Container className="py-8 md:py-12">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="mt-3 h-5 w-1/3" />
        <div className="mt-8"><ListSkeleton rows={5} /></div>
      </Container>
    );
  }
  if (errorMessage) return <NotFound icon={Lock} title="Can't show attendees" message={errorMessage} />;

  const attendedCount = attendees.filter((a) => a.attended).length;
  const search = query.trim().toLowerCase();
  const filtered = attendees.filter(
    (a) => !search || a.user?.name?.toLowerCase().includes(search) || a.user?.email?.toLowerCase().includes(search)
  );

  return (
    <Container className="py-8 md:py-12">
      <PageHeader
        backTo="/dashboard"
        backLabel="Back to dashboard"
        title={event.title}
        subtitle={
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDate(event.date)}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.venue}</span>
          </span>
        }
        actions={
          attendees.length > 0 && (
            <Button variant="outline" onClick={() => exportCsv(event.title, attendees)}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Registered" value={`${attendees.length} / ${event.capacity}`} />
        <StatCard icon={CheckCircle2} label="Attended" value={attendedCount} tone="emerald" />
        <StatCard
          icon={CheckCircle2}
          label="Attendance rate"
          value={attendees.length ? `${Math.round((attendedCount / attendees.length) * 100)}%` : '—'}
          tone="violet"
        />
      </div>

      <section className="mt-10">
        {attendees.length === 0 ? (
          <EmptyState icon={Users} title="No attendees yet" message="Share your event — RSVPs will appear here as they come in." />
        ) : (
          <>
            <Input
              id="attendee-search"
              type="search"
              icon={Search}
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search attendees"
              className="max-w-md"
            />

            <div className="mt-6">
              {filtered.length === 0 ? (
                <EmptyState icon={SearchX} title="No matching attendees" message={`Nobody matches “${query}”.`} />
              ) : (
                <>
                  {/* Table on medium screens and up */}
                  <Card className="hidden overflow-hidden md:block">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th scope="col" className="px-5 py-3">Attendee</th>
                          <th scope="col" className="px-5 py-3">Email</th>
                          <th scope="col" className="px-5 py-3">Registered on</th>
                          <th scope="col" className="px-5 py-3 text-right">Attended</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((reg) => (
                          <tr key={reg._id} className="transition hover:bg-slate-50/70">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar name={reg.user?.name} />
                                <span className="font-medium text-slate-900">{reg.user?.name || 'Deleted user'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-slate-600">{reg.user?.email || '—'}</td>
                            <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDateTime(reg.createdAt)}</td>
                            <td className="px-5 py-3">
                              <div className="flex justify-end">
                                <Switch
                                  checked={reg.attended}
                                  onChange={(value) => toggleAttended(reg._id, value)}
                                  label={`Mark ${reg.user?.name || 'attendee'} as attended`}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>

                  {/* Cards on phones */}
                  <div className="space-y-3 md:hidden">
                    {filtered.map((reg) => (
                      <Card key={reg._id} className="flex items-center gap-3 p-4">
                        <Avatar name={reg.user?.name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900">{reg.user?.name || 'Deleted user'}</p>
                          <p className="truncate text-sm text-slate-500">{reg.user?.email}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(reg.createdAt)}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={reg.attended}
                            onChange={(value) => toggleAttended(reg._id, value)}
                            label={`Mark ${reg.user?.name || 'attendee'} as attended`}
                          />
                          <span className="text-[11px] text-slate-400">Attended</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </Container>
  );
}
