import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';


export default function Login() {
  usePageTitle('Log in');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ProtectedRoute stores the page the user was trying to reach
  const redirectTo = location.state?.from || '/';

  if (user) return <Navigate to={redirectTo} replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.data.token, data.data.user);
      toast.success(data.message);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const res = error.response?.data;
      // Unverified account → send them to finish verification
      if (res?.data?.needsVerification) {
        toast.error(res.message);
        navigate('/verify-otp', { state: { email: res.data.email } });
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      image="/images/auth-login.webp"
      panelTitle="Your next great night out starts here."
      panelText="Concerts, meetups, workshops and more — all in one place."
      title="Welcome back"
      subtitle="Log in to RSVP, manage your tickets and host events."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign up for free
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          icon={Mail}
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          autoFocus={!form.email}
        />
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          autoFocus={Boolean(form.email)}
        />
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

    </AuthLayout>
  );
}
