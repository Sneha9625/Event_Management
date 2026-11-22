import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarPlus, CheckCircle2, Mail, Ticket, User } from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';
import PasswordStrength from '../components/PasswordStrength';
import { cn } from '../utils/cn';

const ROLE_OPTIONS = [
  { value: 'attendee', title: 'I want to attend', text: 'Discover & RSVP to events', icon: Ticket },
  { value: 'organizer', title: 'I want to organize', text: 'Create & manage events', icon: CalendarPlus },
];

const validate = ({ name, email, password, confirmPassword }) => {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email';
  if (password.length < 6) errors.password = 'At least 6 characters';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

// Two big selectable cards (really radio buttons underneath, so keyboard works)
function RoleSelector({ value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-slate-700">How will you use EventHub?</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ROLE_OPTIONS.map(({ value: optionValue, title, text, icon: Icon }) => {
          const selected = value === optionValue;
          return (
            <label
              key={optionValue}
              className={cn(
                'relative flex cursor-pointer gap-3 rounded-xl border p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500',
                selected ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <input
                type="radio"
                name="role"
                value={optionValue}
                checked={selected}
                onChange={onChange}
                className="sr-only"
              />
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">{title}</span>
                <span className="block text-xs text-slate-500">{text}</span>
              </span>
              {selected && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-indigo-600" aria-hidden />}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function Register() {
  usePageTitle('Sign up');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'attendee' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { name, email, password, role } = form;
      const { data } = await api.post('/auth/register', { name, email, password, role });
      toast.success(data.message);
      // Pass the email along so the user doesn't have to type it again
      navigate('/verify-otp', { state: { email: data.data.email } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      image="/images/auth-register.webp"
      panelTitle="Join a community that shows up."
      panelText="Find your people at events near you — or bring them together yourself."
      title="Create your account"
      subtitle="It's free and takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <RoleSelector value={form.role} onChange={handleChange} />

        <Input id="name" name="name" label="Full name" icon={User} placeholder="Jane Doe" value={form.name} onChange={handleChange} error={errors.name} autoComplete="name" />
        <Input id="email" name="email" type="email" label="Email" icon={Mail} placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" />

        <div>
          <PasswordInput id="password" name="password" label="Password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} error={errors.password} autoComplete="new-password" />
          {!errors.password && <PasswordStrength password={form.password} />}
        </div>
        <PasswordInput id="confirmPassword" name="confirmPassword" label="Confirm password" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} autoComplete="new-password" />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </Button>
        <p className="text-center text-xs text-slate-400">We&apos;ll email you a 6-digit code to verify your address.</p>
      </form>
    </AuthLayout>
  );
}
