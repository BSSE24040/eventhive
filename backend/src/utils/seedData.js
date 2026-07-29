// Run with: npm run seed
// Populates the database with a demo organizer, attendee, and a few events.
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');

const seed = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Event.deleteMany({})]);

  const organizer = await User.create({
    name: 'Ayesha Khan',
    email: 'organizer@eventhive.com',
    password: 'password123',
    role: 'organizer',
  });

  await User.create({
    name: 'Demo Attendee',
    email: 'attendee@eventhive.com',
    password: 'password123',
    role: 'attendee',
  });

  await Event.create([
    {
      title: 'Lahore Tech Summit 2026',
      description: 'A gathering of developers, founders, and product folks across Pakistan.',
      category: 'tech',
      location: { venueName: 'Expo Center', address: 'Main Boulevard', city: 'Lahore' },
      startsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      organizer: organizer._id,
      ticketTypes: [
        { name: 'General', price: 15, totalQuantity: 200, quantitySold: 0 },
        { name: 'VIP', price: 45, totalQuantity: 30, quantitySold: 0 },
      ],
    },
    {
      title: 'Sunset Music Festival',
      description: 'Live bands, food trucks, and good vibes by the riverside.',
      category: 'music',
      location: { venueName: 'Riverside Grounds', address: 'Ravi Road', city: 'Lahore' },
      startsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      organizer: organizer._id,
      ticketTypes: [
        { name: 'General Admission', price: 20, totalQuantity: 500, quantitySold: 0 },
        { name: 'Front Row', price: 60, totalQuantity: 50, quantitySold: 0 },
      ],
    },
  ]);

  console.log('Seed data created successfully.');
  console.log('Organizer login: organizer@eventhive.com / password123');
  console.log('Attendee login: attendee@eventhive.com / password123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
