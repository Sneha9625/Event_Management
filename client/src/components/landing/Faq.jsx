import { ChevronDown } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from './SectionHeading';

const QUESTIONS = [
  { q: 'Is EventHub free?', a: 'Yes. Browsing, RSVPing and hosting events are all free.' },
  {
    q: 'How do I RSVP to an event?',
    a: 'Create an account, verify your email with the 6-digit code we send you, then open any upcoming event and click "RSVP". A confirmation email follows right away.',
  },
  {
    q: 'Can I cancel my RSVP?',
    a: 'Any time before the event starts — from the event page or from My Events. Your spot is released for someone else.',
  },
  {
    q: 'How do I become an organizer?',
    a: 'When you sign up, choose "I want to organize". You\'ll get a dashboard where you can create events, see attendees and mark attendance.',
  },
  {
    q: 'What happens when an event is full?',
    a: 'The RSVP button changes to "Sold out". If someone cancels, the spot opens up again for the next person.',
  },
];

// Native <details> gives us an accessible accordion without any JavaScript.
// Two columns on desktop (heading left, questions right) so it uses the full width.
export default function Faq() {
  return (
    <section id="faq" className="w-full scroll-mt-20 bg-white">
      <Container size="full" className="grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" text="Everything you need to know about RSVPing and hosting on EventHub." />
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200 lg:col-span-8">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-semibold text-slate-900 focus:outline-none focus-visible:text-indigo-600">
                {q}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 transition group-open:rotate-180 group-open:border-indigo-200 group-open:bg-indigo-50">
                  <ChevronDown className="h-4 w-4 text-slate-500 group-open:text-indigo-600" aria-hidden />
                </span>
              </summary>
              <p className="max-w-3xl pb-6 leading-relaxed text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
