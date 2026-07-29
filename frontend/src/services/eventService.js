import apiClient from './apiClient';

export const fetchEvents = (params) => apiClient.get('/events', { params });
export const fetchEventById = (id) => apiClient.get(`/events/${id}`);
export const fetchMyEvents = () => apiClient.get('/events/mine');
export const createEventRequest = (payload) => apiClient.post('/events', payload);
export const updateEventRequest = (id, payload) => apiClient.put(`/events/${id}`, payload);
export const deleteEventRequest = (id) => apiClient.delete(`/events/${id}`);
