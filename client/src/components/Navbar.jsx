import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, CalendarDays, ChevronDown, LayoutDashboard, LogOut, Menu, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useDismiss from '../hooks/useDismiss';
import Container from './ui/Container';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Logo from './Logo';
import { CATEGORIES, getCategoryStyle } from '../utils/categories';
import { getInitials } from '../utils/helpers';
import { cn } from '../utils/cn';

// Icon-box colours for the category menu
const CATEGORY_TINTS = {
  blue: 'bg-blue-50 text-blue-600',
  pink: 'bg-pink-50 text-pink-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
};

function Avatar({ name, className = 'h-9 w-9 text-sm' }) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-semibold text-white', className)}>
      {getInitials(name)}
    </span>
  );
}

// Desktop link with an underline that marks the current page
function DesktopLink({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'relative flex h-full items-center px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:text-indigo-600',
          isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
        )
      }
    >
      {({ isActive }) => (
        <>
          {children}
          <span className={cn('absolute inset-x-3 -bottom-px h-0.5 rounded-full transition', isActive ? 'bg-indigo-600' : 'bg-transparent')} />
        </>
      )}
    </NavLink>
  );
}

// Plain (non-active) desktop link, used for #section links on the landing page
function SectionLink({ to, children }) {
  return (
    <Link to={to} className="flex h-full items-center px-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 focus:outline-none focus-visible:text-indigo-600">
      {children}
    </Link>
  );
}

// "Categories" dropdown with icons and taglines
function CategoriesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div className="relative flex h-full items-center" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'flex h-full items-center gap-1 px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:text-indigo-600',
          open ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
        )}
      >
        Categories
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-[440px] animate-pop-in rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10">
          <div className="grid grid-cols-2 gap-1">
            {CATEGORIES.map((category) => {
              const { Icon, tagline, badge } = getCategoryStyle(category);
              return (
                <Link
                  key={category}
                  to={`/?category=${category}#events`}
                  onClick={close}
                  className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', CATEGORY_TINTS[badge])}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{category}</span>
                    <span className="block text-xs text-slate-500">{tagline}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <Link
            to="/#events"
            onClick={close}
            className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Browse all upcoming events <ArrowRight className="h-4 w-4 text-indigo-600" aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}

// Avatar + name button with account dropdown
function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const itemClass = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full border border-slate-200 py-1 pl-1 pr-3 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} className="h-8 w-8 text-xs" />
        <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 xl:block">{user.name.split(' ')[0]}</span>
        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-80 animate-pop-in rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <Avatar name={user.name} className="h-11 w-11 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              <Badge variant="indigo" className="mt-1.5 capitalize">{user.role}</Badge>
            </div>
          </div>

          <div className="mt-2 space-y-0.5">
            <Link to="/my-events" className={itemClass} onClick={close} role="menuitem">
              <CalendarDays className="h-4 w-4 text-slate-400" /> My Events
            </Link>
            {user.role === 'organizer' && (
              <>
                <Link to="/dashboard" className={itemClass} onClick={close} role="menuitem">
                  <LayoutDashboard className="h-4 w-4 text-slate-400" /> Dashboard
                </Link>
                <Link to="/events/create" className={itemClass} onClick={close} role="menuitem">
                  <Plus className="h-4 w-4 text-slate-400" /> Create Event
                </Link>
              </>
            )}
          </div>

          <div className="my-2 border-t border-slate-100" />
          <button onClick={onLogout} className={cn(itemClass, 'text-rose-600 hover:bg-rose-50 hover:text-rose-700')} role="menuitem">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the mobile menu whenever the URL changes
  useEffect(() => setMobileOpen(false), [location.key]);

  // Add a soft shadow once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const isOrganizer = user?.role === 'organizer';
  const tab = mobileOpen ? 0 : -1; // keep hidden mobile links out of the Tab order

  const mobileLink = 'flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium text-slate-700 transition hover:bg-slate-50';

  return (
    // z-[1000] keeps the navbar above Leaflet's map layers
    <header
      className={cn(
        'sticky top-0 z-[1000] w-full border-b bg-white/90 backdrop-blur-lg transition-shadow duration-200',
        scrolled ? 'border-slate-200 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.12)]' : 'border-slate-200/70'
      )}
    >
      <Container size="full" className="flex h-[72px] items-center gap-6 xl:gap-10">
        <Logo />

        {/* Desktop navigation */}
        <nav className="hidden h-full items-stretch lg:flex" aria-label="Main">
          <DesktopLink to="/" end>Explore</DesktopLink>
          <CategoriesMenu />
          {user ? (
            <>
              <DesktopLink to="/my-events">My Events</DesktopLink>
              {isOrganizer && <DesktopLink to="/dashboard">Dashboard</DesktopLink>}
            </>
          ) : (
            <>
              <SectionLink to="/#how-it-works">How it works</SectionLink>
              <SectionLink to="/#organizers">For organizers</SectionLink>
            </>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {isOrganizer && (
                <Button to="/events/create" size="sm">
                  <Plus className="h-4 w-4" /> Create event
                </Button>
              )}
              <UserMenu user={user} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                Log in
              </Link>
              <Button to="/register" size="sm" className="px-4">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </Container>

      {/* Mobile panel: animating grid rows from 0fr → 1fr gives a smooth height transition */}
      <div
        id="mobile-menu"
        className={cn(
          'grid bg-white transition-all duration-300 ease-in-out lg:hidden',
          mobileOpen ? 'grid-rows-[1fr] border-t border-slate-200 opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <Container size="full" className="max-h-[calc(100vh-72px)] space-y-6 overflow-y-auto py-5">
            {user && (
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <Avatar name={user.name} className="h-11 w-11 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-sm text-slate-500">{user.email}</p>
                </div>
                <Badge variant="indigo" className="capitalize">{user.role}</Badge>
              </div>
            )}

            <div>
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Browse</p>
              <Link to="/#events" className={mobileLink} tabIndex={tab}>All events</Link>
              <div className="mt-1 grid grid-cols-2 gap-2 px-1">
                {CATEGORIES.map((category) => {
                  const { Icon, badge } = getCategoryStyle(category);
                  return (
                    <Link
                      key={category}
                      to={`/?category=${category}#events`}
                      tabIndex={tab}
                      className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                    >
                      <span className={cn('flex h-7 w-7 items-center justify-center rounded-md', CATEGORY_TINTS[badge])}>
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      {category}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{user ? 'Your account' : 'Learn more'}</p>
              {user ? (
                <>
                  <Link to="/my-events" className={mobileLink} tabIndex={tab}><CalendarDays className="h-5 w-5 text-slate-400" /> My Events</Link>
                  {isOrganizer && (
                    <>
                      <Link to="/dashboard" className={mobileLink} tabIndex={tab}><LayoutDashboard className="h-5 w-5 text-slate-400" /> Dashboard</Link>
                      <Link to="/events/create" className={mobileLink} tabIndex={tab}><Plus className="h-5 w-5 text-slate-400" /> Create Event</Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to="/#how-it-works" className={mobileLink} tabIndex={tab}>How it works</Link>
                  <Link to="/#organizers" className={mobileLink} tabIndex={tab}>For organizers</Link>
                  <Link to="/#faq" className={mobileLink} tabIndex={tab}>FAQ</Link>
                </>
              )}
            </div>

            <div className="border-t border-slate-100 pt-5">
              {user ? (
                <Button variant="danger-outline" fullWidth onClick={handleLogout} tabIndex={tab}>
                  <LogOut className="h-4 w-4" /> Log out
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button to="/login" variant="outline" tabIndex={tab}>Log in</Button>
                  <Button to="/register" tabIndex={tab}>Get started</Button>
                </div>
              )}
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}
