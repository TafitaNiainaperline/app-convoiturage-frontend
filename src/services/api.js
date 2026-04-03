import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.100:5000/api'; // Remplace par ton IP locale

const api = axios.create({ baseURL: API_URL });

// Ajoute le token JWT à chaque requête
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Trajets
export const getTrajets = (params) => api.get('/trips', { params });
export const getTrajet = (id) => api.get(`/trips/${id}`);
export const creerTrajet = (data) => api.post('/trips', data);
export const modifierTrajet = (id, data) => api.put(`/trips/${id}`, data);
export const annulerTrajet = (id) => api.delete(`/trips/${id}`);
export const mesTrajets = () => api.get('/trips/conducteur/mes-trajets');

// Réservations
export const reserverTrajet = (data) => api.post('/bookings', data);
export const mesReservations = () => api.get('/bookings/mes-reservations');
export const reservationsTrajet = (tripId) => api.get(`/bookings/trajet/${tripId}`);
export const changerStatutReservation = (id, statut) => api.put(`/bookings/${id}/statut`, { statut });
export const annulerReservation = (id) => api.delete(`/bookings/${id}`);

// Utilisateurs
export const getProfil = () => api.get('/users/profil');
export const modifierProfil = (data) => api.put('/users/profil', data);
export const getProfilPublic = (id) => api.get(`/users/${id}`);

export default api;
