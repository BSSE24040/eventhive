import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import TicketQRCode from '../components/TicketQRCode';
import Loader from '../components/Loader';
import { fetchMyTickets } from '../services/bookingService';
import '../styles/MyTicketsPage.css';

function MyTicketsPage() {
  const { state } = useLocation();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchMyTickets();
        setTickets(data.data.tickets);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tickets');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return <Loader label="Loading your tickets..." />;

  return (
    <div className="page-wrapper container">
      <h1>My Tickets</h1>
      {state?.justBooked && (
        <div className="alert alert-success">
          Booking confirmed! Your tickets are ready below.
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      {tickets.length === 0 ? (
        <div className="empty-state">You don&apos;t have any tickets yet — go book an event!</div>
      ) : (
        <div className="my-tickets-list">
          {tickets.map((ticket) => (
            <TicketQRCode key={ticket._id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTicketsPage;
