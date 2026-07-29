import '../styles/StarRating.css';

// interactive=true renders clickable stars for review submission,
// otherwise it's a read-only display (e.g. on event cards)
function StarRating({ value = 0, onChange, interactive = false }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`star-rating ${interactive ? 'interactive' : ''}`}>
      {stars.map((star) => (
        <span
          key={star}
          className={star <= Math.round(value) ? 'star filled' : 'star'}
          onClick={() => interactive && onChange?.(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default StarRating;
