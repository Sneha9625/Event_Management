import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios';
import usePageTitle from '../hooks/usePageTitle';
import Container from '../components/ui/Container';
import PageHeader from '../components/PageHeader';
import EventForm from '../components/EventForm';

export default function CreateEvent() {
  usePageTitle('Create event');
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/events', formData);
      toast.success(data.message);
      navigate(`/events/${data.data._id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="narrow" className="py-8 md:py-12">
      <PageHeader
        backTo="/dashboard"
        backLabel="Back to dashboard"
        title="Create a new event"
        subtitle="Fill in the details and share your event with the community."
      />
      <EventForm onSubmit={handleCreate} submitting={submitting} submitLabel="Publish event" />
    </Container>
  );
}
