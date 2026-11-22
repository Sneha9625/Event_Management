import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays, Plus, SearchX, Sparkles } from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { EventCardSkeleton } from '../components/ui/Skeleton';
import EventCard from '../components/EventCard';
import Pagination from '../components/Pagination';
import Hero from '../components/landing/Hero';
import ValueProps from '../components/landing/ValueProps';
import CategoryShowcase from '../components/landing/CategoryShowcase';
import HowItWorks from '../components/landing/HowItWorks';
import OrganizerCta from '../components/landing/OrganizerCta';
import Faq from '../components/landing/Faq';
import FinalCta from '../components/landing/FinalCta';
import SectionHeading from '../components/landing/SectionHeading';
import { CATEGORIES, getCategoryStyle } from '../utils/categories';
import { cn } from '../utils/cn';

const PAGE_SIZE = 12; // divides evenly into 1, 2, 3 and 4 columns

export default function Home() {
  usePageTitle('Discover & host events');
  const { user } = useAuth();

  // Filters live in the URL (?search=&category=&page=) so they survive a refresh,
  // work with the Back button, and can be linked to (e.g. from the footer).
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Real numbers for the hero + category tiles (loaded once, independent of filters)
  const [summary, setSummary] = useState({ total: null, nextEvent: null, counts: null });

  // Events list (re-fetched whenever a filter changes)
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/events', {
          params: { search: search || undefined, category, page, limit: PAGE_SIZE },
        });
        setEvents(data.data.events);
        setPagination(data.data.pagination);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [search, category, page]);

  // Summary: total upcoming + next event, and how many events each category has.
  // limit=1 keeps these requests tiny — we only need `pagination.total`.
  useEffect(() => {
    const requests = [null, ...CATEGORIES].map((cat) => api.get('/events', { params: { category: cat || undefined, limit: 1 } }));
    Promise.all(requests)
      .then(([all, ...perCategory]) => {
        const counts = {};
        CATEGORIES.forEach((cat, i) => (counts[cat] = perCategory[i].data.data.pagination.total));
        setSummary({ total: all.data.data.pagination.total, nextEvent: all.data.data.events[0] || null, counts });
      })
      .catch(() => {}); // decorative only — the main list shows its own errors
  }, []);

  // Update some URL params; default values are removed to keep the URL clean
  const updateFilters = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      const isDefault = !value || value === 'All' || (key === 'page' && value === 1);
      if (isDefault) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  const scrollToEvents = () => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });

  const handleSearch = (values) => {
    updateFilters({ search: values.search, category: values.category, page: 1 });
    scrollToEvents();
  };

  const selectCategory = (cat) => {
    updateFilters({ category: cat, page: 1 });
    scrollToEvents();
  };

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage });
    scrollToEvents();
  };

  const clearFilters = () => updateFilters({ search: '', category: 'All', page: 1 });
  const hasFilters = Boolean(search) || category !== 'All';

  return (
    <>
      <Hero
        search={search}
        category={category}
        onSearch={handleSearch}
        onCategory={selectCategory}
        nextEvent={summary.nextEvent}
        totalUpcoming={summary.total}
      />

      <ValueProps />

      <CategoryShowcase counts={summary.counts} onSelect={selectCategory} />

      {/* ---------- Events list ---------- */}
      <section id="events" className="w-full scroll-mt-20 border-t border-slate-200 bg-white">
        <Container size="full" className="py-16 md:py-24">
          <SectionHeading
            eyebrow="Upcoming events"
            title={hasFilters ? 'Search results' : 'Happening soon'}
            text={
              loading
                ? 'Finding events...'
                : `${pagination.total} event${pagination.total === 1 ? '' : 's'}${search ? ` matching “${search}”` : ''}${category !== 'All' ? ` in ${category}` : ''}`
            }
          >
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="self-start sm:self-auto">
                Clear filters
              </Button>
            )}
          </SectionHeading>

          {/* Category chips — scroll sideways on phones, wrap on larger screens */}
          <div
            className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
            role="group"
            aria-label="Filter by category"
          >
            {['All', ...CATEGORIES].map((cat) => {
              const Icon = cat === 'All' ? Sparkles : getCategoryStyle(cat).Icon;
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => updateFilters({ category: cat, page: 1 })}
                  aria-pressed={active}
                  className={cn(
                    'flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900 hover:ring-slate-300'
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {cat === 'All' ? 'All events' : cat}
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : events.length === 0 ? (
              <EmptyState
                icon={hasFilters ? SearchX : CalendarDays}
                title={hasFilters ? 'No events match your filters' : 'No upcoming events yet'}
                message={hasFilters ? 'Try a different search term or category.' : 'Check back soon — new events are added all the time.'}
                action={
                  hasFilters ? (
                    <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                  ) : (
                    user?.role === 'organizer' && (
                      <Button to="/events/create"><Plus className="h-4 w-4" /> Create the first event</Button>
                    )
                  )
                }
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>

          {!loading && (
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
          )}
        </Container>
      </section>

      <HowItWorks />
      <OrganizerCta user={user} />
      <Faq />
      <FinalCta user={user} onExplore={scrollToEvents} />
    </>
  );
}
