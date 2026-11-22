import { ArrowRight } from 'lucide-react';
import Container from '../ui/Container';
import Button from '../ui/Button';

// Full-width closing band just above the footer
export default function FinalCta({ user, onExplore }) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" aria-hidden />

      <Container size="full" className="relative flex flex-col gap-8 py-16 md:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Your next favourite event is already on the calendar.
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            Join EventHub to RSVP in seconds — or host your own and watch the seats fill up.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="light" size="lg" onClick={onExplore}>
            Browse events <ArrowRight className="h-5 w-5" />
          </Button>
          {!user && (
            <Button to="/register" variant="glass" size="lg">Create free account</Button>
          )}
        </div>
      </Container>
    </section>
  );
}
