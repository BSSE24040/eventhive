# EventHive Backend

Express + MongoDB API powering EventHive.

## Setup

```bash
cp .env.example .env
npm install
npm run dev       # starts with nodemon on PORT (default 5000)
npm run seed      # optional demo data
```

## Folder Structure

```
src/
├── config/       # DB connection, Stripe, Nodemailer config
├── controllers/  # Request/response handlers
├── models/       # Mongoose schemas: User, Event, Booking, Ticket, Review
├── routes/       # Express routers
├── middlewares/  # authMiddleware, roleMiddleware, errorHandler
├── services/     # Business logic (authService, bookingService, emailService)
├── sockets/       # Socket.io setup for live seat updates
├── utils/        # Token generation, QR generation, API response helpers, seed script
├── app.js        # Express app + middleware wiring
└── server.js     # Entry point — boots HTTP server, Socket.io, and background jobs
```

## Key Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/events` | List/search/filter events |
| GET | `/api/events/:id` | Event details |
| POST | `/api/events` | Create event (organizer) |
| POST | `/api/bookings` | Reserve seats + create payment intent |
| POST | `/api/bookings/confirm` | Confirm booking after payment succeeds |
| GET | `/api/tickets/mine` | My QR tickets |
| POST | `/api/tickets/check-in` | Organizer check-in scan |
| GET | `/api/analytics/organizer` | Revenue/sales analytics |

## Notes

- A background interval in `server.js` sweeps expired, unpaid seat holds every 60 seconds and releases the inventory back to the event.
- Stripe keys must be **test mode** keys from your Stripe dashboard for the payment flow to work locally.
