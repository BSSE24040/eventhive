import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEventRequest } from '../services/eventService';
import '../styles/CreateEventPage.css';

const emptyTicketType = { name: '', price: '', totalQuantity: '' };

function CreateEventPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'tech',
    venueName: '',
    address: '',
    city: '',
    startsAt: '',
    endsAt: '',
  });
  const [ticketTypes, setTicketTypes] = useState([{ ...emptyTicketType }]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTicketType = (index, field, value) => {
    setTicketTypes((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const addTicketType = () => setTicketTypes((prev) => [...prev, { ...emptyTicketType }]);
  const removeTicketType = (index) =>
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await createEventRequest({
        title: form.title,
        description: form.description,
        category: form.category,
        location: { venueName: form.venueName, address: form.address, city: form.city },
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        ticketTypes: ticketTypes.map((t) => ({
          name: t.name,
          price: Number(t.price),
          totalQuantity: Number(t.totalQuantity),
        })),
      });
      navigate('/organizer/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper container create-event-page">
      <h1>Create a new event</h1>
      <form className="card create-event-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Event title</label>
          <input
            id="title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {['music', 'tech', 'sports', 'art', 'business', 'food', 'other'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="venueName">Venue name</label>
            <input
              id="venueName"
              required
              value={form.venueName}
              onChange={(e) => setForm({ ...form, venueName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startsAt">Starts at</label>
            <input
              id="startsAt"
              type="datetime-local"
              required
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="endsAt">Ends at</label>
            <input
              id="endsAt"
              type="datetime-local"
              required
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            />
          </div>
        </div>

        <h3 className="ticket-types-heading">Ticket types</h3>
        {ticketTypes.map((type, index) => (
          <div className="ticket-type-row-form" key={index}>
            <input
              placeholder="Name (e.g. General)"
              required
              value={type.name}
              onChange={(e) => updateTicketType(index, 'name', e.target.value)}
            />
            <input
              placeholder="Price"
              type="number"
              min="0"
              step="0.01"
              required
              value={type.price}
              onChange={(e) => updateTicketType(index, 'price', e.target.value)}
            />
            <input
              placeholder="Quantity"
              type="number"
              min="1"
              required
              value={type.totalQuantity}
              onChange={(e) => updateTicketType(index, 'totalQuantity', e.target.value)}
            />
            {ticketTypes.length > 1 && (
              <button
                type="button"
                className="btn btn-outline remove-ticket-type"
                onClick={() => removeTicketType(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-outline" onClick={addTicketType}>
          + Add another ticket type
        </button>

        <button className="btn btn-primary create-event-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default CreateEventPage;
