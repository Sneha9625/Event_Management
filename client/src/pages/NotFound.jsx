import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Home } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';

// Used for unknown URLs, and reused by pages when something is missing or not allowed
export default function NotFound({
  icon: Icon = Compass,
  title = 'Page not found',
  message = "Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.",
  showCode = title === 'Page not found',
}) {
  usePageTitle(title);
  const navigate = useNavigate();

  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
        <Icon className="h-8 w-8 text-indigo-600" aria-hidden />
      </div>
      {showCode && <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-indigo-600">Error 404</p>}
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-base text-slate-600">{message}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Go back
        </Button>
        <Button to="/">
          <Home className="h-4 w-4" /> Back to home
        </Button>
      </div>
    </Container>
  );
}
