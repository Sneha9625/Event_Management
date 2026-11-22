import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays, Lock } from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import Container from '../components/ui/Container';
import Skeleton from '../components/ui/Skeleton';
import PageHeader from '../components/PageHeader';
import EventForm from '../components/EventForm';
import NotFound from './NotFound';

export default function EditEvent() {
  usePageTitle('Edit event');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then(({ data }) => setEvent(data.data))
      .catch((error) => {
        if (error.response?.status !== 404 && error.response?.status !== 400) toast.error(getErrorMessage(error));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Container size="narrow" className="py-8 md:py-12">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="mt-8 h-[600px] w-full rounded-xl" />
      </Container>
    );
  }
  if (!event) return <NotFound icon={CalendarDays} title="Event not found" message="This event doesn't exist or was removed." />;

  // Friendly UI check — the server enforces ownership regardless
  if (event.organizer?._id !== user._id) {
    return <NotFound icon={Lock} title="Not allowed" message="You can only edit events that you created." />;
  }

  const handleUpdate = async (formData) => {
    setSubmitting(true);
    try {
      const { data } = await api.put(`/events/${id}`, formData);
      toast.success(data.message);
      navigate(`/events/${id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="narrow" className="py-8 md:py-12">
      <PageHeader
        backTo={`/events/${id}`}
        backLabel="Back to event"
        title="Edit event"
        subtitle="Changing the venue updates the map location automatically."
      />
      <EventForm initialEvent={event} onSubmit={handleUpdate} submitting={submitting} submitLabel="Save changes" />
    </Container>
  );
}
