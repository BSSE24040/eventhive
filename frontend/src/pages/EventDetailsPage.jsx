import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import SeatMap from '../components/SeatMap';
import StarRating from '../components/StarRating';
import { fetchEventById } from '../services/eventService';
import { createBookingRequest, fetchEventReviews, createReviewRequest } from '../services/bookingService';
import { formatDateTime } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';
import socket from '../services/socket';
import '../styles/EventDetailsPage.css';

function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');

  const loadEvent = useCallback(async () => {
    setIsLoading(true);
    try {
      const [{ data: eventData }, { data: reviewData }] = await Promise.all([
        fetchEventById(id),
        fetchEventReviews(id),
      ]);
      setEvent(eventData.data.event);
      setReviews(reviewData.data.reviews);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  // Join this event's socket room to receive live seat-count updates whenever
  // anyone (including this user in another tab) books a ticket.
  useEffect(() => {
    socket.emit('joinEvent', id);
    const handleSeatsUpdated = (payload) => {
      if (payload.eventId === id) {
        setEvent((prev) => (prev ? { ...prev, ticketTypes: payload.ticketTypes } : prev));
      }
    };
    socket.on('seatsUpdated', handleSeatsUpdated);
    return () => {
      socket.emit('leaveEvent', id);
      socket.off('seatsUpdated', handleSeatsUpdated);
    };
  }, [id]);

  const handleBookNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedTypeId) {
      setError('Please select a ticket type first');
      return;
    }

    setIsBooking(true);
    setError('');
    try {
      const { data } = await createBookingRequest({
        eventId: id,
        ticketTypeId: selectedTypeId,
        quantity,
      });
      navigate('/checkout', {
        state: {
          booking: data.data.booking,
          clientSecret: data.data.clientSecret,
          event,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reserve seats — please try again');
    } finally {
      setIsBooking(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await createReviewRequest({ eventId: id, ...reviewForm });
      setReviewForm({ rating: 5, comment: '' });
      loadEvent();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review');
    }
  };

  if (isLoading) return <Loader label="Loading event..." />;
  if (!event) return <div className="empty-state">Event not found.</div>;

  return (
    <div className="page-wrapper container">
      <div className="event-details-grid">
        <div className="event-details-main">
          <span className="badge badge-muted">{event.category}</span>
          <h1>{event.title}</h1>
          <p className="event-details-meta">
            {formatDateTime(event.startsAt)} · {event.location.venueName}, {event.location.city}
          </p>
          <div className="event-details-rating">
            <StarRating value={event.averageRating} /> ({event.reviewCount} reviews)
          </div>

          <p className="event-details-description">{event.description}</p>

          <section className="event-reviews">
            <h2>Reviews</h2>
            {user && (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <StarRating
                  value={reviewForm.rating}
                  interactive
                  onChange={(rating) => setReviewForm({ ...reviewForm, rating })}
                />
                <textarea
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
                {reviewError && <p className="review-error">{reviewError}</p>}
                <button className="btn btn-outline" type="submit">
                  Submit Review
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="event-details-meta">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="review-item card">
                  <div className="review-item-header">
                    <strong>{review.user?.name}</strong>
                    <StarRating value={review.rating} />
                  </div>
                  {review.comment && <p>{review.comment}</p>}
                </div>
              ))
            )}
          </section>
        </div>

        <aside className="event-booking-panel card">
          <h3>Get your tickets</h3>
          {error && <div className="alert alert-error">{error}</div>}

          <SeatMap
            ticketTypes={event.ticketTypes}
            selectedTypeId={selectedTypeId}
            onSelectType={(typeId) => {
              setSelectedTypeId(typeId);
              setQuantity(1);
            }}
            quantity={quantity}
            onQuantityChange={setQuantity}
          />

          <button
            className="btn btn-primary event-booking-cta"
            onClick={handleBookNow}
            disabled={isBooking || !selectedTypeId}
          >
            {isBooking ? 'Reserving seats...' : 'Book Now'}
          </button>
          <p className="event-booking-note">
            Seats are held for 10 minutes while you complete payment.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default EventDetailsPage;
