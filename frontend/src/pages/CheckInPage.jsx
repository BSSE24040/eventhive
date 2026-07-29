import { useState } from 'react';
import { checkInTicketRequest } from '../services/bookingService';
import '../styles/CheckInPage.css';

// Simplified check-in flow: organizer enters/pastes the serial code found in
// the attendee's QR payload. A production version would wire this to a real
// camera-based QR scanner library, but the validation logic (server-side,
// idempotent, ownership-checked) is identical either way.
function CheckInPage() {
  const [serialCode, setSerialCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsSubmitting(true);
    try {
      const { data } = await checkInTicketRequest(serialCode.trim());
      setResult(data.data.ticket);
      setSerialCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper container check-in-page">
      <h1>Ticket Check-In</h1>
      <p className="check-in-subtitle">
        Enter the serial code from an attendee&apos;s QR ticket to check them in.
      </p>

      <form className="card check-in-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="serialCode">Ticket serial code</label>
          <input
            id="serialCode"
            placeholder="EVH-XXXXXXXXXX"
            required
            value={serialCode}
            onChange={(e) => setSerialCode(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Checking...' : 'Check In'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}
      {result && (
        <div className="alert alert-success">
          ✅ Checked in successfully — serial <strong>{result.serialCode}</strong>
        </div>
      )}
    </div>
  );
}

export default CheckInPage;
