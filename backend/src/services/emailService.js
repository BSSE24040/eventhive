const transporter = require('../config/mailer');

const sendBookingConfirmationEmail = async ({ to, eventTitle, quantity, totalAmount }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `Your tickets for ${eventTitle} are confirmed!`,
      html: `
        <h2>Booking Confirmed</h2>
        <p>You purchased <strong>${quantity}</strong> ticket(s) for <strong>${eventTitle}</strong>.</p>
        <p>Total paid: $${totalAmount.toFixed(2)}</p>
        <p>You can view your QR tickets anytime in the "My Tickets" section of EventHive.</p>
      `,
    });
  } catch (error) {
    // Email failures shouldn't crash the booking flow — log and move on.
    console.error('Failed to send confirmation email:', error.message);
  }
};

const sendEventReminderEmail = async ({ to, eventTitle, startsAt }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `Reminder: ${eventTitle} is coming up`,
      html: `<p>Just a reminder that <strong>${eventTitle}</strong> starts at ${new Date(
        startsAt
      ).toLocaleString()}. See you there!</p>`,
    });
  } catch (error) {
    console.error('Failed to send reminder email:', error.message);
  }
};

module.exports = { sendBookingConfirmationEmail, sendEventReminderEmail };
