import { CalendarPlus, ClipboardCheck, MailCheck, Search, Ticket, UserPlus } from 'lucide-react';
import Container from '../ui/Container';
import Card from '../ui/Card';
import SectionHeading from './SectionHeading';

const TRACKS = [
  {
    title: 'For attendees',
    steps: [
      { icon: UserPlus, title: 'Create a free account', text: 'Sign up and verify your email with a 6-digit code.' },
      { icon: Search, title: 'Find something you love', text: 'Search by title or browse categories and dates.' },
      { icon: Ticket, title: 'RSVP in one click', text: 'Get a confirmation email and see it in My Events.' },
    ],
  },
  {
    title: 'For organizers',
    steps: [
      { icon: CalendarPlus, title: 'Publish your event', text: 'Add details and a banner — we pin the venue on a map.' },
      { icon: MailCheck, title: 'Collect RSVPs', text: 'Capacity updates live and the event closes when full.' },
      { icon: ClipboardCheck, title: 'Check people in', text: 'Mark attendance on the day and export the list as CSV.' },
    ],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full scroll-mt-20 border-t border-slate-200 bg-slate-50">
      <Container size="full" className="py-16 md:py-24">
        <SectionHeading center eyebrow="How it works" title="From discovery to doors open" text="Simple for the people coming, and for the people hosting." />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {TRACKS.map((track) => (
            <Card key={track.title} className="p-6 sm:p-8">
              <h3 className="text-xl font-bold text-slate-900">{track.title}</h3>
              <ol className="mt-6 space-y-6">
                {track.steps.map(({ icon: Icon, title, text }, index) => (
                  <li key={title} className="relative flex gap-4">
                    {/* connector line between steps */}
                    {index < track.steps.length - 1 && (
                      <span className="absolute left-5 top-12 h-[calc(100%-1.5rem)] w-px bg-slate-200" aria-hidden />
                    )}
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="pt-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step {index + 1}</p>
                      <p className="mt-0.5 font-semibold text-slate-900">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
