export interface Vehicule {
  marque?: string;
  modele?: string;
  couleur?: string;
  immatriculation?: string;
  places?: number;
}

export interface User {
  id: string;
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'passager' | 'conducteur' | 'les_deux';
  photo?: string;
  note?: number;
  nbAvis?: number;
  vehicule?: Vehicule;
  createdAt?: string;
}

export interface Lieu {
  ville: string;
  adresse?: string;
}

export interface Trajet {
  _id: string;
  depart: Lieu;
  arrivee: Lieu;
  dateDepart: string;
  heureDepart: string;
  placesDisponibles: number;
  placesReservees: number;
  prixParPlace: number;
  description?: string;
  statut: 'disponible' | 'complet' | 'en_cours' | 'termine' | 'annule';
  conducteur?: User;
}

export type StatutReservation = 'en_attente' | 'confirme' | 'refuse' | 'annule' | 'termine';
export type ModePaiement = 'especes' | 'mvola' | 'orange_money';

export interface Reservation {
  _id: string;
  trajet?: Trajet;
  passager?: User;
  nbPlaces: number;
  prixTotal: number;
  modePaiement: ModePaiement;
  statut: StatutReservation;
  message?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
