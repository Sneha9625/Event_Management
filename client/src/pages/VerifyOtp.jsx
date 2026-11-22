import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import usePageTitle from '../hooks/usePageTitle';
import AuthLayout from '../components/AuthLayout';
import OtpInput from '../components/OtpInput';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOtp() {
  usePageTitle('Verify email');
  const location = useLocation();
  const navigate = useNavigate();

  // Email arrives via navigate state from Register/Login; allow typing it if the page was opened directly
  const emailFromState = location.state?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(emailFromState ? RESEND_COOLDOWN : 0);

  // Count down one second at a time
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    if (!/^\d{6}$/.test(otp)) return toast.error('Please enter all 6 digits');

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      toast.success(data.message);
      navigate('/login', { state: { email } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return toast.error('Please enter your email');
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      toast.success(data.message);
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      image="/images/auth-register.webp"
      panelTitle="Almost there."
      panelText="Verify your email and you're ready to RSVP or host your first event."
      title="Check your inbox"
      subtitle={
        emailFromState ? (
          <>We sent a 6-digit code to <span className="font-semibold text-slate-900">{emailFromState}</span>. It expires in 10 minutes.</>
        ) : (
          'Enter your email and the 6-digit code we sent you.'
        )
      }
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      }
    >
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
        <MailCheck className="h-6 w-6 text-indigo-600" aria-hidden />
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        {!emailFromState && (
          <Input id="email" type="email" label="Email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Verification code</p>
          <OtpInput onChange={setOtp} disabled={submitting} />
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting} disabled={otp.length !== 6}>
          {submitting ? 'Verifying...' : 'Verify email'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Didn&apos;t get the code?{' '}
        {cooldown > 0 ? (
          <span className="text-slate-400">
            Resend in <span className="font-semibold tabular-nums text-slate-600">
              {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, '0')}
            </span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="rounded font-semibold text-indigo-600 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
          >
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        )}
      </p>
    </AuthLayout>
  );
}
