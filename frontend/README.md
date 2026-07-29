# EventHive Frontend

React (Vite) client for EventHive.

## Setup

```bash
cp .env.example .env
npm install
npm run dev     # http://localhost:5173
```

## Folder Structure

```
src/
├── assets/       # Images/icons used inside components
├── components/   # Navbar, Footer, EventCard, SeatMap, TicketQRCode, ProtectedRoute, StarRating, Loader
├── context/      # AuthContext (global auth state)
├── pages/        # Route-level screens (Home, EventDetails, Login, Register, Checkout, MyTickets, organizer pages)
├── services/     # apiClient (axios + token refresh), authService, eventService, bookingService, socket
├── styles/       # One CSS file per page/component, plus global.css and variables.css
├── utils/        # formatDate, formatCurrency helpers
├── App.jsx       # Route definitions
└── main.jsx      # Entry point
```

## Notable Patterns

- **Token refresh:** `services/apiClient.js` automatically retries a failed request once after silently refreshing the access token via the httpOnly cookie.
- **Live seat updates:** `EventDetailsPage` joins a Socket.io room for the event and listens for `seatsUpdated` broadcasts.
- **Stripe Elements:** `CheckoutPage` wraps the payment form in `<Elements>` using the publishable key from `.env`.

No Tailwind — all styling is plain, hand-written CSS per page/component for full control and to demonstrate CSS fundamentals.
