import '../styles/Loader.css';

function Loader({ label = 'Loading...' }) {
  return (
    <div className="loader-wrapper">
      <div className="loader-spinner" />
      <p>{label}</p>
    </div>
  );
}

export default Loader;
