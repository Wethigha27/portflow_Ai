import React from 'react';
import AdminHubLayout from '@/components/AdminHub/Layout';

const stats = [
  { label: 'Voyages en cours', value: 2 },
  { label: 'Ports visités cette année', value: 7 },
  { label: 'Temps moyen de livraison', value: '6j 3h' },
  { label: 'Total de conteneurs expédiés', value: 14 },
];

const MerchantAnalytics = () => (
  <AdminHubLayout userType="merchant">
    <div style={{ padding: '2rem' }}>
      <h2>Statistiques</h2>
      <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: '#cfe2ff', padding: 24, borderRadius: 12, minWidth: 180 }}>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#003366' }}>{stat.value}</div>
            <div style={{ marginTop: 8 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </AdminHubLayout>
);

export default MerchantAnalytics;
