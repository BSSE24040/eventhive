const QRCode = require('qrcode');
const { nanoid } = require('nanoid');

// Generates a unique serial code and its corresponding QR code (as a base64 data URL)
// The QR payload only carries the serial code — the server is the source of truth
// for validity, so nothing sensitive is encoded on the ticket itself.
const generateTicketQr = async (bookingId) => {
  const serialCode = `EVH-${nanoid(10).toUpperCase()}`;
  const qrCodeDataUrl = await QRCode.toDataURL(
    JSON.stringify({ serial: serialCode, booking: bookingId.toString() }),
    { errorCorrectionLevel: 'H', margin: 2, width: 300 }
  );
  return { serialCode, qrCodeDataUrl };
};

module.exports = { generateTicketQr };
