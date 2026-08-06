# EventHive - Real-Time Event Booking & Ticketing Platform

EventHive is a full-stack MERN application designed to handle real-world backend engineering challenges encountered in ticketing platforms like Eventbrite and BookMyShow. It features concurrency-safe seat reservations, real-time inventory updates using WebSockets, secure multi-role authentication, Stripe payments, QR-code ticketing, and an organizer analytics dashboard.

---

## Technical Features

### Concurrency-Safe Seat Reservations
To prevent overselling during high-concurrency traffic, seat availability checks and seat updates are executed as a single atomic operation in MongoDB using `findOneAndUpdate()`. This avoids race conditions by ensuring that concurrent booking requests cannot over-allocate remaining tickets.

### Real-Time Inventory Updates
Socket.io is integrated to broadcast live seat inventory updates across connected clients. When a user reserves tickets, all users viewing that specific event receive updated seat availability in real time without manual page refreshes.

### Reservation Expiry Handling
Upon initiating a booking, selected seats are held temporarily for 10 minutes. If payment processing is not completed within this window, the reserved seats automatically return to the available inventory pool.

### QR Code Ticketing & Check-in
Successful transactions trigger the generation of individual tickets with unique serial codes and corresponding QR code image payloads. Organizers can scan these codes to handle attendee check-in.

### Analytics Dashboard
Organizer metrics are computed using MongoDB Aggregation Pipelines to deliver real-time data on total revenue, ticket sales distribution, booking counts, and performance over time.

---

## Features Overview

* **Authentication & Authorization:** JWT access tokens, HTTP-only refresh token cookies, password hashing with bcrypt, and Role-Based Access Control (RBAC) across Attendee, Organizer, and Admin roles.
* **Event Management:** Full CRUD operations for event creation, ticket tier setup, category tagging, city-based filtering, and paginated queries.
* **Payments:** Integration with Stripe PaymentIntents to handle client secret verification, secure card processing, and payment status callbacks.
* **Reviews & Ratings:** Restrictive review system allowing only verified ticket purchasers to submit 5-star ratings and textual feedback.
* **Email Confirmations:** Automated transaction receipts and ticket details delivered via Nodemailer SMTP integrations.

---

## Technical Stack

### Frontend
* React 18 (Vite build tool)
* React Router DOM
* Axios
* Context API
* Socket.io Client
* Stripe.js
* Recharts
* Modular CSS

### Backend
* Node.js & Express.js framework
* MongoDB & Mongoose ODM
* Socket.io
* Stripe API
* Nodemailer
* QRCode generator
* bcrypt & cookie-parser
* Express Rate Limit

---

## Architecture & Project Structure

EventHive follows a layered backend architecture dividing responsibilities between Routes, Controllers, Services, Models, and Socket Handlers.

```
EventHive/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── sockets/
│   ├── utils/
│   └── server.js
│
└── frontend/
    ├── components/
    ├── context/
    ├── pages/
    ├── services/
    ├── styles/
    ├── utils/
    └── App.jsx
```

---

## API & Booking Workflow

```
User Selects Event -> Choose Ticket Type -> Initiate Reservation -> Atomic DB Lock 
   -> Stripe Payment -> Transaction Confirmation -> QR Ticket Generation 
   -> Email Confirmation Sent
```

---

## Environment Variables Configuration

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=your_stripe_secret_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@eventhive.com
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

---

## Local Development Setup

### Prerequisites
* Node.js (v18 or higher)
* MongoDB database instance
* Stripe developer test accounts
* SMTP credentials (e.g., Mailtrap, SendGrid)

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/BSSE24040/EventHive.git
   cd EventHive
   ```

2. Setup Backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. Setup Frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## License

This project is open source and available under the MIT License.

---

## Author

**Mahad Ashfaq**
* GitHub: https://github.com/BSSE24040
* LinkedIn: www.linkedin.com/in/muhammadmahadashfaq
