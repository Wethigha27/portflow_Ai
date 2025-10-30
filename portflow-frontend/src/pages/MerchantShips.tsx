import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import AdminHubLayout from '@/components/AdminHub/Layout';

// Données mock: navires, conteneurs, ports et trajets
const mockShips = [
  {
    id: 1,
    name: 'Mariner Express',
    imo: 'IMO9811200',
    containers: ['CMAU1234567', 'MSCU7654321'],
    status: 'En route',
    driver: { name: 'Cap. Brandon', avatar: 'https://randomuser.me/api/portraits/men/72.jpg', role: 'Capitaine' },
    position: { lat: 35.999, lng: -5.603 },
    route: [
      { name: 'Le Havre', lat: 49.4939, lng: 0.1079 },
      { name: 'Lisbonne', lat: 38.7223, lng: -9.1393 },
      { name: 'Détroit de Gibraltar', lat: 35.995, lng: -5.603 },
      { name: 'Casablanca', lat: 33.5731, lng: -7.5898 },
    ],
    completed: false,
  },
  {
    id: 2,
    name: 'Ocean Voyager',
    imo: 'IMO9811301',
    containers: ['TEMU6543210'],
    status: 'En transit',
    driver: { name: 'Cap. Martin', avatar: 'https://randomuser.me/api/portraits/men/65.jpg', role: 'Capitaine' },
    position: { lat: 36.1, lng: -6.0 },
    route: [
      { name: 'Rotterdam', lat: 51.9244, lng: 4.4777 },
      { name: 'Tanger Med', lat: 35.89, lng: -5.5 },
      { name: 'Abidjan', lat: 5.348, lng: -4.027 },
    ],
    completed: false,
  },
];

function StatusChip({ status }) {
  const color = status.includes('transit') ? '#ffe066' : '#32be7e';
  return (
    <span style={{ padding: '2px 10px', fontSize: 12, borderRadius: 14, background: color, color: '#23253a', fontWeight: 600 }}>{status}</span>
  );
}

function ShipCard({ ship, active, onClick }) {
  return (
    <div onClick={onClick} style={{ padding: 18, borderRadius: 13, background: active ? '#f7f9fb' : 'white', marginBottom: 14, boxShadow: active ? '0 2px 8px #6399ef0c' : '0 1px 3px #e9eaf0', border: active ? '1.5px solid #3f51b5' : '1px solid #f0f1f7', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, transition: 'background .22s, border .22s' }}>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{ship.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#9ca0b1', fontWeight: 500 }}>{ship.imo}</span>
        <StatusChip status={ship.status} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
        <img src={ship.driver.avatar} alt={ship.driver.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
        <div style={{ fontSize: 13, color: '#7a8291' }}>{ship.driver.name}</div>
      </div>
      <div style={{ fontSize: 12, color: '#7a8291' }}>Conteneurs: {ship.containers.join(', ')}</div>
    </div>
  );
}

const MerchantShips = () => {
  const [selectedId, setSelectedId] = useState(1);
  const selected = useMemo(() => mockShips.find(s => s.id === selectedId)!, [selectedId]);

  // Ports à afficher sur la carte = tous les ports de toutes les routes
  const allPorts = useMemo(() => {
    const list = [] as { name: string; lat: number; lng: number }[];
    mockShips.forEach(s => s.route.forEach(p => list.push(p)));
    // dédupliquer par nom + coords
    const key = (p: {name:string;lat:number;lng:number}) => `${p.name}-${p.lat}-${p.lng}`;
    const map = new Map(list.map(p => [key(p), p]));
    return Array.from(map.values());
  }, []);

  return (
    <AdminHubLayout userType="merchant">
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#f6f8fb', fontFamily: 'Inter, sans-serif' }}>
        {/* Liste à gauche */}
        <aside style={{ width: 360, borderRight: '1px solid #eceff1', background: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 20px 12px 20px', borderBottom: '1px solid #eceff1' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Mes Navires</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
            {mockShips.map(ship => (
              <ShipCard key={ship.id} ship={ship} active={selectedId === ship.id} onClick={() => setSelectedId(ship.id)} />
            ))}
          </div>
        </aside>

        {/* Carte: ports, bateaux et trajet du bateau sélectionné */}
        <main style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <MapContainer center={selected.position} zoom={5} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Trajet du navire sélectionné */}
            <Polyline positions={[...selected.route.map(p => [p.lat, p.lng] as [number, number])]} color="#3f51b5" weight={4} opacity={0.8} />

            {/* Marqueurs des ports */}
            {allPorts.map((p, i) => (
              <CircleMarker key={i} center={{ lat: p.lat, lng: p.lng }} pathOptions={{ color: '#ff7043' }} radius={6}>
                <Popup>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Marqueurs des navires */}
            {mockShips.map(ship => (
              <Marker key={ship.id} position={ship.position}>
                {selectedId === ship.id && (
                  <Popup closeButton={false}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={ship.driver.avatar} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #fff' }} alt="capitaine" />
                      <div>
                        <div style={{ fontWeight: 700 }}>{ship.name}</div>
                        <div style={{ fontSize: 12, color: '#667' }}>{ship.imo}</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}><b>Conteneurs:</b> {ship.containers.join(', ')}</div>
                      </div>
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}
          </MapContainer>
        </main>
      </div>
    </AdminHubLayout>
  );
};

export default MerchantShips;
