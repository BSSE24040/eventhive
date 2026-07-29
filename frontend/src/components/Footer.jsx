import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} EventHive. Built for learning real-world MERN patterns.</p>
        <p className="footer-note">Concurrency-safe booking · Real-time seats · QR check-in</p>
      </div>
    </footer>
  );
}

export default Footer;
