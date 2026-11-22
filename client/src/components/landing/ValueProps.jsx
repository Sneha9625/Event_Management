import { BellRing, MapPinned, MousePointerClick, Users } from 'lucide-react';
import Container from '../ui/Container';

const ITEMS = [
  { icon: MousePointerClick, title: 'One-click RSVP', text: 'Save your spot instantly — no forms, no fees.' },
  { icon: BellRing, title: 'Email confirmations', text: 'Get the date, time and venue straight to your inbox.' },
  { icon: MapPinned, title: 'Maps for every venue', text: 'Venues are pinned automatically so you never get lost.' },
  { icon: Users, title: 'Built for organizers', text: 'Track capacity, see attendees and mark check-ins.' },
];

export default function ValueProps() {
  return (
    <section className="w-full border-b border-slate-200 bg-white">
      <Container size="full" className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{text}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
