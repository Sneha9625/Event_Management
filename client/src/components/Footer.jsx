import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from './ui/Container';
import Logo from './Logo';
import { CATEGORIES } from '../utils/categories';

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="text-sm text-slate-400 transition hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { user } = useAuth();

  const accountLinks = user
    ? [
        { label: 'My Events', to: '/my-events' },
        ...(user.role === 'organizer'
          ? [
              { label: 'Dashboard', to: '/dashboard' },
              { label: 'Create Event', to: '/events/create' },
            ]
          : []),
      ]
    : [
        { label: 'Log in', to: '/login' },
        { label: 'Sign up', to: '/register' },
      ];

  return (
    <footer className="w-full bg-slate-900">
      <Container size="full" className="py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Discover meetups, concerts, workshops and more — or host your own event and manage RSVPs in one place.
            </p>
          </div>
          <FooterColumn
            title="Explore"
            links={[
              { label: 'All events', to: '/' },
              ...CATEGORIES.slice(0, 4).map((c) => ({ label: c, to: `/?category=${c}` })),
            ]}
          />
          <FooterColumn title="Account" links={accountLinks} />
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-sm text-slate-500">
          © {new Date().getFullYear()} EventHub. Built with the MERN stack.
        </div>
      </Container>
    </footer>
  );
}
