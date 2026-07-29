import { useState } from 'react';
import '../styles/SeatMap.css';

// Shows each ticket type as a selectable row with live remaining-seat counts.
// Parent component keeps ticketTypes state fresh via the socket 'seatsUpdated' event.
function SeatMap({ ticketTypes, selectedTypeId, onSelectType, quantity, onQuantityChange }) {
  const [error, setError] = useState('');

  const selected = ticketTypes.find((t) => t._id === selectedTypeId);
  const remaining = selected ? selected.totalQuantity - selected.quantitySold : 0;

  const handleQuantityChange = (value) => {
    const qty = Number(value);
    if (qty > remaining) {
      setError(`Only ${remaining} seat(s) left for this ticket type`);
    } else {
      setError('');
    }
    onQuantityChange(qty);
  };

  return (
    <div className="seat-map">
      {ticketTypes.map((type) => {
        const left = type.totalQuantity - type.quantitySold;
        const isSoldOut = left <= 0;
        const isSelected = type._id === selectedTypeId;

        return (
          <button
            key={type._id}
            className={`seat-type-row ${isSelected ? 'selected' : ''} ${
              isSoldOut ? 'sold-out' : ''
            }`}
            disabled={isSoldOut}
            onClick={() => onSelectType(type._id)}
          >
            <div className="seat-type-info">
              <span className="seat-type-name">{type.name}</span>
              <span className="seat-type-left">
                {isSoldOut ? 'Sold out' : `${left} seat(s) left`}
              </span>
            </div>
            <span className="seat-type-price">${type.price.toFixed(2)}</span>
          </button>
        );
      })}

      {selected && (
        <div className="seat-quantity-picker">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={remaining}
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
          />
          {error && <p className="seat-map-error">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default SeatMap;
