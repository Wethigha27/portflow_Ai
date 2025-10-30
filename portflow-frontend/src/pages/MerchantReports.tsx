import React from 'react';
import AdminHubLayout from '@/components/AdminHub/Layout';

const mockReport = [
  { ship: 'Mariner Express', eta: '2025-10-24', container: 'CMAU1234567', progress: '89%', status: 'À quai (Casablanca)', weather: 'Ensoleillé, 27°C' },
  { ship: 'Ocean Voyager', eta: '2025-10-27', container: 'TEMU6543210', progress: '32%', status: 'En mer (large Maroc)', weather: 'Chaud, 29°C' },
];

const MerchantReports = () => (
  <AdminHubLayout userType="merchant">
    <div style={{ padding: '2rem' }}>
      <h2>Rapports de livraison</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr style={{ background: '#cfe2ff' }}>
            <th>Navire</th>
            <th>Conteneur</th>
            <th>Avancement</th>
            <th>ETA</th>
            <th>Statut</th>
            <th>Météo</th>
          </tr>
        </thead>
        <tbody>
          {mockReport.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td>{item.ship}</td>
              <td>{item.container}</td>
              <td>{item.progress}</td>
              <td>{item.eta}</td>
              <td>{item.status}</td>
              <td>{item.weather}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminHubLayout>
);

export default MerchantReports;
