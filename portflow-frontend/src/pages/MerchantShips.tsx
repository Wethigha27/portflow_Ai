import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import AdminHubLayout from '@/components/AdminHub/Layout';
import { shipService } from '@/services/shipService';
import { weatherService } from '@/services/weatherService';
import L from 'leaflet';
import { mstService, MSTVessel } from '@/services/mstService';
import { useMapEvents } from 'react-leaflet';

// Icônes Leaflet basiques par type
const shipIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

type Port = Awaited<ReturnType<typeof shipService.getPorts>>[number];
type Ship = Awaited<ReturnType<typeof shipService.getShips>>[number];

function StatusChip({ status }: { status: string }) {
  const color = status.includes('transit') ? '#ffe066' : '#32be7e';
  return (
    <span style={{ padding: '2px 10px', fontSize: 12, borderRadius: 14, background: color, color: '#23253a', fontWeight: 600 }}>{status}</span>
  );
}

function ShipCard({ ship, active, onClick }: { ship: Ship; active: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ padding: 18, borderRadius: 13, background: active ? '#f7f9fb' : 'white', marginBottom: 14, boxShadow: active ? '0 2px 8px #6399ef0c' : '0 1px 3px #e9eaf0', border: active ? '1.5px solid #3f51b5' : '1px solid #f0f1f7', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, transition: 'background .22s, border .22s' }}>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{ship.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#9ca0b1', fontWeight: 500 }}>{ship.imo_number}</span>
        <StatusChip status={ship.status || '—'} />
      </div>
      <div style={{ fontSize: 12, color: '#7a8291' }}>Vitesse: {ship.current_speed ?? 0} kn • Cap: {ship.current_heading ?? 0}°</div>
      {ship.destination_name ? (
        <div style={{ fontSize: 12, color: '#7a8291' }}>Destination: {ship.destination_name}</div>
      ) : null}
    </div>
  );
}

const MerchantShips = () => {
  const [ships, setShips] = useState<Ship[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [center, setCenter] = useState<[number, number]>([36, -5.6]);
  const [showPorts, setShowPorts] = useState(true);
  const [showShips, setShowShips] = useState(true);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherByPort, setWeatherByPort] = useState<Record<number, { wind_speed: number; temperature: number }>>({});
  const [trackingPositions, setTrackingPositions] = useState<Record<number, Array<[number, number]>>>({});
  const [useMST, setUseMST] = useState(false);
  const [bounds, setBounds] = useState<{min_lat:number;min_lon:number;max_lat:number;max_lon:number} | null>(null);
  const [mstVessels, setMSTVessels] = useState<MSTVessel[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [p, s] = await Promise.all([
          shipService.getPorts(),
          shipService.getShips()
        ]);
        if (!mounted) return;
        setPorts(p);
        setShips(s);
        if ((!s || s.length === 0)) {
          setUseMST(true);
        }
        const firstWithPos = s.find(sh => sh.current_latitude && sh.current_longitude);
        if (firstWithPos) setCenter([firstWithPos.current_latitude as number, firstWithPos.current_longitude as number]);
        if (s.length && selectedId === null) setSelectedId(s[0].id);
      } catch (e) {
        // noop display errors via toasts in future
      }
    };
    load();
    const interval = setInterval(async () => {
      try {
        // Option 1: trigger server-side update, then refetch list
        await shipService.updateShipPositions();
        const s = await shipService.getShips();
        setShips(s);
      } catch {}
    }, 20000);
    return () => { mounted = false; clearInterval(interval); };
  }, [selectedId]);

  useEffect(() => {
    if (!showWeather) return;
    let cancelled = false;
    const fetchWeather = async () => {
      try {
        const map: Record<number, { wind_speed: number; temperature: number }> = {};
        await Promise.all(
          ports.slice(0, 50).map(async (p) => {
            try {
              // backend exposes weather endpoints by port; fallback gracefully
              const data = await weatherService.getCurrentWeather(p.id);
              if (data?.wind_speed !== undefined) {
                map[p.id] = { wind_speed: data.wind_speed, temperature: data.temperature };
              }
            } catch {}
          })
        );
        if (!cancelled) setWeatherByPort(map);
      } catch {}
    };
    fetchWeather();
  }, [showWeather, ports]);

  useEffect(() => {
    if (selectedId == null) return;
    let stopped = false;
    const poll = async () => {
      try {
        // direct call to tracking endpoint for breadcrumb track
        const data = await (async () => {
          // temporary minimal call using apiService signature from shipService if needed
          return shipService.getShips().then(list => list.find(s => s.id === selectedId));
        })();
        const ship = data as Ship | undefined;
        if (ship && ship.current_latitude && ship.current_longitude) {
          setCenter([ship.current_latitude, ship.current_longitude]);
          setTrackingPositions(prev => {
            const updated: [number, number][] = ([
              ...(prev[ship.id] || []),
              [ship.current_latitude as number, ship.current_longitude as number] as [number, number]
            ].slice(-100)) as [number, number][];
            return { ...prev, [ship.id]: updated };
          });
        }
      } catch {}
      if (!stopped) setTimeout(poll, 15000);
    };
    poll();
    return () => { stopped = true; };
  }, [selectedId]);

  const selected = useMemo(() => ships.find(s => s.id === selectedId) || null, [ships, selectedId]);

  function BoundsWatcher() {
    useMapEvents({
      moveend(e: any) {
        const b = e.target.getBounds();
        setBounds({
          min_lat: b.getSouth(),
          min_lon: b.getWest(),
          max_lat: b.getNorth(),
          max_lon: b.getEast(),
        });
      }
    });
    return null;
  }

  useEffect(() => {
    if (!useMST || !bounds) return;
    let cancelled = false;
    const load = async () => {
      try {
        const data = await mstService.getVesselsInZone(bounds);
        if (!cancelled) setMSTVessels(Array.isArray(data) ? data : []);
      } catch {}
    };
    load();
    const i = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(i); };
  }, [useMST, bounds]);

  return (
    <AdminHubLayout userType="merchant">
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#f6f8fb', fontFamily: 'Inter, sans-serif' }}>
        {/* Liste à gauche */}
        <aside style={{ width: 360, borderRight: '1px solid #eceff1', background: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 20px 12px 20px', borderBottom: '1px solid #eceff1' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Mes Navires</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
            {ships.map(ship => (
              <ShipCard key={ship.id} ship={ship} active={selectedId === ship.id} onClick={() => setSelectedId(ship.id)} />
            ))}
          </div>
        </aside>

        {/* Carte: ports, bateaux et trajet du bateau sélectionné */}
        <main style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <MapContainer {...({
            center,
            zoom: 5,
            scrollWheelZoom: true,
            style: { height: '100%', width: '100%' },
            whenCreated: (map: any) => {
              try {
                const b = map.getBounds();
                setBounds({
                  min_lat: b.getSouth(),
                  min_lon: b.getWest(),
                  max_lat: b.getNorth(),
                  max_lon: b.getEast(),
                });
              } catch {}
            }
          } as any)}>
            <BoundsWatcher />
            <LayersControl {...({ position: 'topright' } as any)}>
              <LayersControl.BaseLayer checked name="Standard">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satellite">
                <TileLayer {...({ url: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', subdomains: ['mt0','mt1','mt2','mt3'] } as any)} />
              </LayersControl.BaseLayer>

              <LayersControl.Overlay checked name="Ports">
                <LayerGroup>
                  {showPorts && ports.map((p) => (
                    <CircleMarker {...({ key: p.id, center: { lat: (p as any).latitude ?? 0, lng: (p as any).longitude ?? 0 }, pathOptions: { color: '#ff7043' }, radius: 6 } as any)}>
                      <Popup>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: 12 }}>{p.city}, {p.country}</div>
                        {weatherByPort[p.id] ? (
                          <div style={{ fontSize: 12, marginTop: 4 }}>Vent: {weatherByPort[p.id].wind_speed} m/s • Temp: {weatherByPort[p.id].temperature}°C</div>
                        ) : null}
                      </Popup>
                    </CircleMarker>
                  ))}
                </LayerGroup>
              </LayersControl.Overlay>

              <LayersControl.Overlay checked name="Navires">
                <LayerGroup>
                  {!useMST && showShips && ships.filter(s => s.current_latitude && s.current_longitude).map(ship => (
                    <Marker {...({ key: ship.id, position: { lat: ship.current_latitude as number, lng: ship.current_longitude as number }, icon: shipIcon as any } as any)}>
                      <Popup>
                        <div style={{ fontWeight: 700 }}>{ship.name}</div>
                        <div style={{ fontSize: 12, color: '#667' }}>IMO: {ship.imo_number}</div>
                        <div style={{ fontSize: 12 }}>Vitesse: {ship.current_speed ?? 0} kn</div>
                        <div style={{ fontSize: 12 }}>Cap: {ship.current_heading ?? 0}°</div>
                        {ship.destination_name ? (<div style={{ fontSize: 12 }}>Destination: {ship.destination_name}</div>) : null}
                        <div style={{ fontSize: 12, marginTop: 4 }}>Maj: {ship.last_updated ? new Date(ship.last_updated).toLocaleString() : '—'}</div>
                      </Popup>
                    </Marker>
                  ))}
                  {useMST && showShips && mstVessels.map((v, idx) => (
                    <Marker {...({ key: v.mmsi || v.imo || idx, position: { lat: Number(v.lat), lng: Number(v.lon) }, icon: shipIcon as any } as any)}>
                      <Popup>
                        <div style={{ fontWeight: 700 }}>{v.name || 'Vessel'}</div>
                        {v.imo ? (<div style={{ fontSize: 12, color: '#667' }}>IMO: {v.imo}</div>) : null}
                        {v.mmsi ? (<div style={{ fontSize: 12, color: '#667' }}>MMSI: {v.mmsi}</div>) : null}
                        <div style={{ fontSize: 12 }}>Vitesse: {v.speed ?? 0} kn</div>
                        <div style={{ fontSize: 12 }}>Cap: {v.course ?? 0}°</div>
                        {v.destination ? (<div style={{ fontSize: 12 }}>Destination: {v.destination}</div>) : null}
                        {v.eta ? (<div style={{ fontSize: 12 }}>ETA: {v.eta}</div>) : null}
                      </Popup>
                    </Marker>
                  ))}
                </LayerGroup>
              </LayersControl.Overlay>

              {showWeather ? (
                <LayersControl.Overlay checked name="Météo (vent)">
                  <LayerGroup>
                    <TileLayer {...({ opacity: 0.45, url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid={API_KEY}' } as any)} />
                  </LayerGroup>
                </LayersControl.Overlay>
              ) : null}
            </LayersControl>

            {/* Trajet (breadcrumb) du navire sélectionné à partir des positions mises à jour */}
            {selected && trackingPositions[selected.id] && trackingPositions[selected.id].length > 1 ? (
              <Polyline {...({ positions: trackingPositions[selected.id], pathOptions: { color: '#3f51b5', weight: 4, opacity: 0.8 } } as any)} />
            ) : null}
          </MapContainer>

          {/* Petits toggles rapides */}
          <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 1000, background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, display: 'flex', gap: 10 }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
              <input type="checkbox" checked={showPorts} onChange={(e) => setShowPorts(e.target.checked)} /> Ports
            </label>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
              <input type="checkbox" checked={showShips} onChange={(e) => setShowShips(e.target.checked)} /> Navires
            </label>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
              <input type="checkbox" checked={showWeather} onChange={(e) => setShowWeather(e.target.checked)} /> Météo
            </label>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
              <input type="checkbox" checked={useMST} onChange={(e) => setUseMST(e.target.checked)} /> Live AIS (MST)
            </label>
          </div>
        </main>
      </div>
    </AdminHubLayout>
  );
};

export default MerchantShips;
