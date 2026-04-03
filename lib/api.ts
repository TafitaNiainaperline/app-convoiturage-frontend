import { AuthResponse, Trajet, Reservation, User, ModePaiement, StatutReservation } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erreur serveur.' }));
    throw new Error(error.message || 'Erreur serveur.');
  }

  return res.json();
}

// Auth
export const register = (data: Record<string, string>) =>
  request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const login = (data: { email: string; motDePasse: string }) =>
  request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) });

// Trajets
export const getTrajets = (params?: { depart?: string; arrivee?: string }) => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return request<Trajet[]>(`/trips${query ? `?${query}` : ''}`);
};
export const getTrajet = (id: string) => request<Trajet>(`/trips/${id}`);
export const creerTrajet = (data: Partial<Trajet>) =>
  request<Trajet>('/trips', { method: 'POST', body: JSON.stringify(data) });
export const modifierTrajet = (id: string, data: Partial<Trajet>) =>
  request<Trajet>(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const annulerTrajet = (id: string) =>
  request(`/trips/${id}`, { method: 'DELETE' });
export const mesTrajets = () => request<Trajet[]>('/trips/conducteur/mes-trajets');

// Réservations
export const reserverTrajet = (data: { trajetId: string; nbPlaces: number; modePaiement: ModePaiement }) =>
  request<Reservation>('/bookings', { method: 'POST', body: JSON.stringify(data) });
export const mesReservations = () => request<Reservation[]>('/bookings/mes-reservations');
export const changerStatutReservation = (id: string, statut: StatutReservation) =>
  request<Reservation>(`/bookings/${id}/statut`, { method: 'PUT', body: JSON.stringify({ statut }) });
export const annulerReservation = (id: string) =>
  request(`/bookings/${id}`, { method: 'DELETE' });

// Utilisateurs
export const getProfil = () => request<User>('/users/profil');
export const modifierProfil = (data: Partial<User>) =>
  request<User>('/users/profil', { method: 'PUT', body: JSON.stringify(data) });
export const getProfilPublic = (id: string) => request<User>(`/users/${id}`);
