import apiClient from './apiClient';

export const createBookingRequest = (payload) => apiClient.post('/bookings', payload);
export const confirmBookingRequest = (bookingId) =>
  apiClient.post('/bookings/confirm', { bookingId });
export const fetchMyBookings = () => apiClient.get('/bookings/mine');
export const cancelBookingRequest = (id) => apiClient.patch(`/bookings/${id}/cancel`);

export const fetchMyTickets = () => apiClient.get('/tickets/mine');
export const checkInTicketRequest = (serialCode) =>
  apiClient.post('/tickets/check-in', { serialCode });

export const fetchOrganizerAnalytics = () => apiClient.get('/analytics/organizer');

export const fetchEventReviews = (eventId) => apiClient.get(`/reviews/${eventId}`);
export const createReviewRequest = (payload) => apiClient.post('/reviews', payload);
