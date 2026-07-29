import { formatDateTime } from '../utils/formatDate';
import '../styles/TicketQRCode.css';

function TicketQRCode({ ticket }) {
  return (
    <div className="ticket-card card">
      <div className="ticket-card-info">
        <h3>{ticket.event?.title}</h3>
        <p className="ticket-card-meta">
          {formatDateTime(ticket.event?.startsAt)} · {ticket.event?.location?.venueName}
        </p>
        <p className="ticket-card-serial">Serial: {ticket.serialCode}</p>
        <span className={`badge ${ticket.isCheckedIn ? 'badge-success' : 'badge-warning'}`}>
          {ticket.isCheckedIn ? 'Checked In' : 'Valid — Not Yet Used'}
        </span>
      </div>
      <div className="ticket-card-qr">
        <img src={ticket.qrCodeDataUrl} alt="Ticket QR code" />
      </div>
    </div>
  );
}

export default TicketQRCode;
