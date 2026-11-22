import { ArrowRight, CheckCircle2, Compass, Plus } from 'lucide-react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import SectionHeading from './SectionHeading';

const FEATURES = [
  'Banner uploads and automatic venue maps',
  'Live capacity — RSVPs stop when you are full',
  'Attendee list with one-tap check-in',
  'Export attendees to CSV in a click',
];

// Dark band pitching the organizer side of the product
export default function OrganizerCta({ user }) {
  const action =
    user?.role === 'organizer' ? (
      <Button to="/events/create" variant="light" size="lg"><Plus className="h-5 w-5" /> Create an event</Button>
    ) : user ? (
      <Button to="/" variant="light" size="lg"><Compass className="h-5 w-5" /> Keep exploring</Button>
    ) : (
      <Button to="/register" variant="light" size="lg">Start hosting for free <ArrowRight className="h-5 w-5" /></Button>
    );

  return (
    <section id="organizers" className="relative w-full scroll-mt-20 overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" aria-hidden />
      <Container size="full" className="relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            dark
            eyebrow="For organizers"
            title="Host your next event on EventHub"
            text="Everything you need to run a meetup, gig or workshop — without spreadsheets or paid ticketing tools."
          />
          <ul className="mt-8 space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-slate-200">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden /> {feature}
              </li>
            ))}
          </ul>
          <div className="mt-10">{action}</div>
        </div>

        <div className="relative">
          <div className="aspect-[16/10] overflow-hidden rounded-3xl ring-1 ring-white/10">
            <img src="/images/organizer.webp" alt="Speaker microphone in front of an audience" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </Container>
    </section>
  );
}
