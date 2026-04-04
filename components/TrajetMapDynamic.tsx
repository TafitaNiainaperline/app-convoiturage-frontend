'use client';

import dynamic from 'next/dynamic';

const TrajetMap = dynamic(() => import('./TrajetMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 260,
      borderRadius: 12,
      background: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: 14,
      border: '1px solid #e5e7eb',
    }}>
      Chargement de la carte...
    </div>
  ),
});

export default TrajetMap;
