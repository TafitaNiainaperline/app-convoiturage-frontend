'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { COORDS_VILLES } from '@/lib/villes';
import styles from './TrajetMap.module.scss';

// Fix icônes Leaflet avec Next.js
const iconDepart = L.divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:#1E6B3C;border:3px solid #fff;
    box-shadow:0 2px 6px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const iconArrivee = L.divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:#fff;border:3px solid #1E6B3C;
    box-shadow:0 2px 6px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  return null;
}

interface TrajetMapProps {
  depart: string;
  arrivee: string;
}

export default function TrajetMap({ depart, arrivee }: TrajetMapProps) {
  const coordsDepart  = COORDS_VILLES[depart];
  const coordsArrivee = COORDS_VILLES[arrivee];

  if (!coordsDepart || !coordsArrivee) return null;

  const centre: [number, number] = [
    (coordsDepart[0] + coordsArrivee[0]) / 2,
    (coordsDepart[1] + coordsArrivee[1]) / 2,
  ];

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={centre}
        zoom={6}
        className={styles.map}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <FitBounds positions={[coordsDepart, coordsArrivee]} />

        <Marker position={coordsDepart} icon={iconDepart}>
          <Popup><strong>{depart}</strong><br />Point de départ</Popup>
        </Marker>

        <Marker position={coordsArrivee} icon={iconArrivee}>
          <Popup><strong>{arrivee}</strong><br />Destination</Popup>
        </Marker>

        <Polyline
          positions={[coordsDepart, coordsArrivee]}
          pathOptions={{ color: '#1E6B3C', weight: 3, dashArray: '8 6', opacity: 0.8 }}
        />
      </MapContainer>

      <div className={styles.legende}>
        <span className={styles.legendeDepart}>
          <span className={styles.dotDepart} /> {depart}
        </span>
        <span className={styles.legendeFleche}>→</span>
        <span className={styles.legendeArrivee}>
          <span className={styles.dotArrivee} /> {arrivee}
        </span>
      </div>
    </div>
  );
}
