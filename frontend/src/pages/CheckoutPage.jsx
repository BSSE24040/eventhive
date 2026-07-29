import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { confirmBookingRequest, cancelBookingRequest } from '../services/bookingService';
import { formatCurrency } from '../utils/formatDate';
import '../styles/CheckoutPage.css';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

function CheckoutForm({ booking, clientSecret, event }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (stripeError) {
      setError(stripeError.message);
      setIsProcessing(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        await confirmBookingRequest(booking._id);
        navigate('/my-tickets', { state: { justBooked: true } });
      } catch (err) {
        setError(err.response?.data?.message || 'Payment succeeded but confirmation failed');
      }
    }
    setIsProcessing(false);
  };

  const handleCancel = async () => {
    try {
      await cancelBookingRequest(booking._id);
    } finally {
      navigate(`/events/${event._id}`);
    }
  };

  return (
    <form className="checkout-card card" onSubmit={handleSubmit}>
      <h2>Complete your payment</h2>
      <div className="checkout-summary">
        <p>
          <strong>{event.title}</strong>
        </p>
        <p>
          {booking.quantity} × {booking.ticketTypeName} — {formatCurrency(booking.unitPrice)} each
        </p>
        <p className="checkout-total">Total: {formatCurrency(booking.totalAmount)}</p>
      </div>

      <div className="card-element-wrapper">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <p className="checkout-test-hint">
        Test mode — use card number 4242 4242 4242 4242, any future date, any CVC.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="checkout-actions">
        <button type="button" className="btn btn-outline" onClick={handleCancel}>
          Cancel booking
        </button>
        <button className="btn btn-primary" type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Processing...' : `Pay ${formatCurrency(booking.totalAmount)}`}
        </button>
      </div>
    </form>
  );
}

function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.booking) {
    return (
      <div className="empty-state">
        No pending booking found.{' '}
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Browse events
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper container checkout-page">
      <Elements stripe={stripePromise}>
        <CheckoutForm booking={state.booking} clientSecret={state.clientSecret} event={state.event} />
      </Elements>
    </div>
  );
}

export default CheckoutPage;
