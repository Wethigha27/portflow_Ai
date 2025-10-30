import React from 'react';
import AdminHubLayout from '@/components/AdminHub/Layout';

const mockPorts = [
  { name: 'Le Havre', country: 'France', lastVisit: '2025-10-20', details: 'Grand port maritime, dédouanement rapide.' },
  { name: 'Lisbonne', country: 'Portugal', lastVisit: '2025-10-22', details: "Escale technique rapide, météo clémente." },
  { name: 'Casablanca', country: 'Maroc', lastVisit: '2025-10-24', details: "Déchargement et retrait de conteneur." },
  { name: 'Rotterdam', country: 'Pays-Bas', lastVisit: '2025-10-19', details: "Premier port d'embarquement pour la saison." },
];

const MerchantPorts = () => (
  <AdminHubLayout userType="merchant">
    <div style={{ padding: '2rem' }}>
      <h2>Ports Suivis</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr style={{ background: '#cfe2ff' }}>
            <th>Port</th>
            <th>Pays</th>
            <th>Date de passage</th>
            <th>Détails</th>
          </tr>
        </thead>
        <tbody>
          {mockPorts.map((port, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td>{port.name}</td>
              <td>{port.country}</td>
              <td>{port.lastVisit}</td>
              <td>{port.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminHubLayout>
);

export default MerchantPorts;
