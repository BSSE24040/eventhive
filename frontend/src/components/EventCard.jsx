import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { formatDate } from '../utils/formatDate';
import '../styles/EventCard.css';

function EventCard({ event }) {
  const lowestPrice = Math.min(...event.ticketTypes.map((t) => t.price));
  const soldOut = event.seatsRemaining === 0;

  return (
    <Link to={`/events/${event._id}`} className="event-card card">
      <div className="event-card-image">
        {event.coverImageUrl ? (
          <img src={event.coverImageUrl} alt={event.title} />
        ) : (
          <div className="event-card-placeholder">{event.category.toUpperCase()}</div>
        )}
        {soldOut && <span className="badge badge-danger event-card-badge">Sold Out</span>}
      </div>

      <div className="event-card-body">
        <span className="badge badge-muted">{event.category}</span>
        <h3>{event.title}</h3>
        <p className="event-card-meta">
          {formatDate(event.startsAt)} · {event.location.city}
        </p>

        <div className="event-card-footer">
          <span className="event-card-price">From ${lowestPrice}</span>
          {event.reviewCount > 0 && (
            <span className="event-card-rating">
              <StarRating value={event.averageRating} /> ({event.reviewCount})
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default EventCard;
