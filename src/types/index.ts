export interface Vehicule {
  marque: string;
  modele: string;
  couleur: string;
  immatriculation: string;
  places: number;
}

export interface User {
  id: string;
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'passager' | 'conducteur' | 'les_deux';
  note?: number;
  nbAvis?: number;
  vehicule?: Vehicule;
  createdAt?: string;
}

export interface Ville {
  ville: string;
}

export interface Trajet {
  _id: string;
  depart: Ville;
  arrivee: Ville;
  dateDepart: string;
  heureDepart: string;
  placesDisponibles: number;
  placesReservees: number;
  prixParPlace: number;
  description?: string;
  statut: 'disponible' | 'complet' | 'annule' | 'termine';
  conducteur?: User;
}

export type StatutReservation = 'en_attente' | 'confirme' | 'refuse' | 'annule' | 'termine';
export type ModePaiement = 'especes' | 'mvola' | 'orange_money';

export interface Reservation {
  _id: string;
  trajet?: Trajet;
  nbPlaces: number;
  prixTotal?: number;
  modePaiement: ModePaiement;
  statut: StatutReservation;
}

export interface AuthResponse {
  token: string;
  user: User;
}
