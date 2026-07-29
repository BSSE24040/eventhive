# 🐝 EventHive — Real-Time Event Booking & Ticketing Platform

EventHive is a full-stack MERN application for discovering, booking, and managing tickets to live events. It's built to demonstrate production-grade patterns, not just CRUD — the core feature is **concurrency-safe seat booking**, so two people can never accidentally buy the same last seat.

## Highlight Features

- **Race-condition-free ticket booking** — uses an atomic MongoDB `findOneAndUpdate` with an inventory check built into the filter itself, so concurrent buyers can never oversell an event (see `backend/src/services/bookingService.js`)
- **Real-time seat availability** via Socket.io — everyone viewing an event page sees seat counts update live as others book
- **JWT auth** with short-lived access tokens + httpOnly refresh token cookies, and role-based access control (attendee / organizer / admin)
- **Stripe test-mode payments** with a 10-minute seat hold that auto-releases if payment isn't completed
- **QR-code ticket generation** and organizer check-in scanning at the door
- **Organizer analytics dashboard** with MongoDB aggregation pipelines (revenue over time, ticket-type breakdown)
- **Reviews & ratings** restricted to users with a confirmed booking
- **Email confirmations** via Nodemailer

## Project Structure

```
EventHive/
├── backend/     # Express + MongoDB API, Socket.io, Stripe, Nodemailer
└── frontend/    # React (Vite) client
```

See `backend/README.md` and `frontend/README.md` for setup instructions specific to each half.

## Quick Start

1. **Backend**
   ```bash
   cd backend
  SMTP creds
   npm install
 
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   
   npm install
   npm run dev
   ```


## The Concurrency Problem, Explained

Imagine an event has 1 seat left, and two people click "Book Now" at the exact same millisecond. A naive implementation reads "1 seat left," and both requests pass that check before either writes back, so both succeed — the event is now oversold.

EventHive prevents this by folding the availability check directly into the atomic update:

```js
Event.findOneAndUpdate(
  { _id: eventId, ticketTypes: { $elemMatch: { _id: typeId, $expr: { $lte: [...] } } } },
  { $inc: { 'ticketTypes.$[t].quantitySold': quantity } },
  { arrayFilters: [{ 't._id': typeId }] }
)
```

MongoDB guarantees this operation is atomic — only one of the two concurrent requests can match the filter and succeed. The other gets `null` back and is told the event is sold out.

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Socket.io-client, Stripe.js, Recharts, plain CSS (no Tailwind)
- **Backend:** Node.js, Express, MongoDB/Mongoose, Socket.io, Stripe, JWT, Nodemailer, QRCode

## Naming Conventions

- Backend/logic files: `camelCase.js` (e.g. `authController.js`)
- Frontend React components: `PascalCase.jsx` (e.g. `EventCard.jsx`)
