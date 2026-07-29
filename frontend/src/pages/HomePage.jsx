import { useEffect, useState, useCallback } from 'react';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import { fetchEvents } from '../services/eventService';
import '../styles/HomePage.css';

const CATEGORIES = ['music', 'tech', 'sports', 'art', 'business', 'food', 'other'];

function HomePage() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', category: '', city: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = useCallback(async (params) => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await fetchEvents(params);
      setEvents(data.data.events);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents({ page: 1 });
  }, [loadEvents]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEvents({ ...filters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    loadEvents({ ...filters, page: newPage });
  };

  return (
    <div className="page-wrapper container">
      <section className="home-hero">
        <h1>Find your next favorite event</h1>
        <p>Concerts, conferences, festivals, and meetups — all in one hive.</p>
      </section>

      <form className="home-filters" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {isLoading ? (
        <Loader label="Fetching events..." />
      ) : events.length === 0 ? (
        <div className="empty-state">No events match your search yet.</div>
      ) : (
        <>
          <div className="home-grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="home-pagination">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${p === pagination.page ? 'active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
