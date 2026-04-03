import axios, { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, Trajet, Reservation, User, ModePaiement, StatutReservation } from '../types';

const API_URL = 'http://192.168.1.100:5000/api'; // Remplace par ton IP locale

const api = axios.create({ baseURL: API_URL });

// Ajoute le token JWT à chaque requête
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data: Partial<User> & { motDePasse: string }) =>
  api.post<AuthResponse>('/auth/register', data);
export const login = (data: { email: string; motDePasse: string }) =>
  api.post<AuthResponse>('/auth/login', data);

// Trajets
export const getTrajets = (params?: { depart?: string; arrivee?: string }) =>
  api.get<Trajet[]>('/trips', { params });
export const getTrajet = (id: string) => api.get<Trajet>(`/trips/${id}`);
export const creerTrajet = (data: Partial<Trajet>) => api.post<Trajet>('/trips', data);
export const modifierTrajet = (id: string, data: Partial<Trajet>) => api.put<Trajet>(`/trips/${id}`, data);
export const annulerTrajet = (id: string) => api.delete(`/trips/${id}`);
export const mesTrajets = () => api.get<Trajet[]>('/trips/conducteur/mes-trajets');

// Réservations
export const reserverTrajet = (data: { trajetId: string; nbPlaces: number; modePaiement: ModePaiement }) =>
  api.post<Reservation>('/bookings', data);
export const mesReservations = () => api.get<Reservation[]>('/bookings/mes-reservations');
export const reservationsTrajet = (tripId: string) => api.get<Reservation[]>(`/bookings/trajet/${tripId}`);
export const changerStatutReservation = (id: string, statut: StatutReservation) =>
  api.put<Reservation>(`/bookings/${id}/statut`, { statut });
export const annulerReservation = (id: string) => api.delete(`/bookings/${id}`);

// Utilisateurs
export const getProfil = () => api.get<User>('/users/profil');
export const modifierProfil = (data: Partial<User>) => api.put<User>('/users/profil', data);
export const getProfilPublic = (id: string) => api.get<User>(`/users/${id}`);

export default api;
