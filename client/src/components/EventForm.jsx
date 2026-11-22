import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import Card from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import ImageUpload from './ImageUpload';
import { CATEGORIES } from '../utils/categories';
import { toLocalDateAndTime } from '../utils/helpers';

const EMPTY_FORM = { title: '', description: '', category: 'Tech', date: '', time: '18:00', venue: '', capacity: 100 };

// Turns the separate date + time inputs into one local Date
const combineDateTime = (date, time) => new Date(`${date}T${time}`);

const validate = (values) => {
  const errors = {};
  if (values.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  if (values.description.trim().length < 10) errors.description = 'Description must be at least 10 characters';
  if (!values.date) errors.date = 'Pick a date';
  if (!values.time) errors.time = 'Pick a time';
  if (values.date && values.time && combineDateTime(values.date, values.time) <= new Date()) {
    errors.date = 'Date and time must be in the future';
  }
  if (!values.venue.trim()) errors.venue = 'Venue is required';
  if (!Number.isInteger(Number(values.capacity)) || Number(values.capacity) < 1) errors.capacity = 'Capacity must be 1 or more';
  return errors;
};

// Section heading inside the form card
function FormSection({ title, description, children }) {
  return (
    <div className="space-y-5 border-b border-slate-100 p-6 last:border-b-0 sm:p-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// Shared by CreateEvent and EditEvent. `initialEvent` is only passed when editing.
export default function EventForm({ initialEvent, onSubmit, submitting, submitLabel }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(() => {
    if (!initialEvent) return EMPTY_FORM;
    const { date, time } = toLocalDateAndTime(initialEvent.date);
    return {
      title: initialEvent.title,
      description: initialEvent.description,
      category: initialEvent.category,
      date,
      time,
      venue: initialEvent.venue,
      capacity: initialEvent.capacity,
    };
  });
  const [errors, setErrors] = useState({});
  const [bannerFile, setBannerFile] = useState(null);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      // Bring the first problem into view
      document.getElementById(Object.keys(validationErrors)[0])?.focus();
      return;
    }

    // FormData (not JSON) because we may be sending a file
    const formData = new FormData();
    formData.append('title', values.title.trim());
    formData.append('description', values.description.trim());
    formData.append('category', values.category);
    // date + time are local; send one ISO (UTC) string to the server
    formData.append('date', combineDateTime(values.date, values.time).toISOString());
    formData.append('venue', values.venue.trim());
    formData.append('capacity', values.capacity);
    if (bannerFile) formData.append('banner', bannerFile);

    onSubmit(formData);
  };

  const today = toLocalDateAndTime(new Date()).date;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <FormSection title="Event details" description="The basics people see first.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input id="title" name="title" label="Title" placeholder="e.g. React Meetup Bengaluru" value={values.title} onChange={handleChange} error={errors.title} maxLength={100} />
            <Select id="category" name="category" label="Category" value={values.category} onChange={handleChange}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
            <Input id="date" name="date" type="date" label="Date" icon={CalendarDays} value={values.date} onChange={handleChange} error={errors.date} min={today} />
            <Input id="time" name="time" type="time" label="Start time" icon={Clock} value={values.time} onChange={handleChange} error={errors.time} />
            <Input id="capacity" name="capacity" type="number" label="Capacity" icon={Users} min={1} value={values.capacity} onChange={handleChange} error={errors.capacity} hint="Maximum number of attendees" />
            <Input id="venue" name="venue" label="Venue" icon={MapPin} placeholder="e.g. Cubbon Park, Bengaluru" value={values.venue} onChange={handleChange} error={errors.venue} hint="We use this to place the event on the map" />
          </div>

          <Textarea
            id="description"
            name="description"
            label="Description"
            rows={6}
            placeholder="What should attendees expect? Agenda, speakers, what to bring..."
            value={values.description}
            onChange={handleChange}
            error={errors.description}
            hint={`${values.description.length}/2000 characters`}
            maxLength={2000}
          />
        </FormSection>

        <FormSection title="Banner" description="A good image makes your event stand out.">
          <ImageUpload existingUrl={initialEvent?.bannerUrl} onFileChange={setBannerFile} />
        </FormSection>

        <div className="flex flex-col-reverse gap-3 rounded-b-xl bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
          <Button variant="outline" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </Card>
    </form>
  );
}
