import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          🐝 EventHive
        </Link>

        <nav className="navbar-links">
          <Link to="/">Browse Events</Link>

          {user?.role === 'organizer' && (
            <>
              <Link to="/organizer/dashboard">Dashboard</Link>
              <Link to="/organizer/events">My Events</Link>
              <Link to="/organizer/check-in">Check-In</Link>
            </>
          )}

          {user && user.role !== 'organizer' && <Link to="/my-tickets">My Tickets</Link>}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <>
              <span className="navbar-username">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
