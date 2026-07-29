import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { fetchMyEvents, deleteEventRequest } from '../services/eventService';
import { formatDate } from '../utils/formatDate';
import '../styles/MyEventsPage.css';

function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const { data } = await fetchMyEvents();
      setEvents(data.data.events);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    await deleteEventRequest(id);
    loadEvents();
  };

  if (isLoading) return <Loader label="Loading your events..." />;

  return (
    <div className="page-wrapper container">
      <div className="my-events-header">
        <h1>My Events</h1>
        <Link to="/organizer/create-event" className="btn btn-primary">
          + Create Event
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {events.length === 0 ? (
        <div className="empty-state">You haven&apos;t created any events yet.</div>
      ) : (
        <table className="my-events-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Seats Sold</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const totalSeats = event.ticketTypes.reduce((s, t) => s + t.totalQuantity, 0);
              const soldSeats = event.ticketTypes.reduce((s, t) => s + t.quantitySold, 0);
              return (
                <tr key={event._id}>
                  <td>
                    <Link to={`/events/${event._id}`}>{event.title}</Link>
                  </td>
                  <td>{formatDate(event.startsAt)}</td>
                  <td>
                    {soldSeats} / {totalSeats}
                  </td>
                  <td>
                    <span className="badge badge-muted">{event.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-outline" onClick={() => handleDelete(event._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyEventsPage;
