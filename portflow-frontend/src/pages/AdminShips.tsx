import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Ship, MapPin, Clock } from 'lucide-react';
import AdminHubLayout from '@/components/AdminHub/Layout';
import { shipService, Ship as ShipType } from '@/services/shipService';

const AdminShips: React.FC = () => {
  const [ships, setShips] = useState<ShipType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadShips();
  }, []);

  const loadShips = async () => {
    try {
      setLoading(true);
      const data = await shipService.getShips();
      setShips(data);
    } catch (error) {
      console.error('Error loading ships:', error);
      // Fallback to static data
      setShips([
        {
          id: 1,
          name: 'Ever Given',
          imo_number: '9811000',
          type: 'container',
          status: 'Underway',
          current_latitude: 25.5,
          current_longitude: 55.3,
          current_speed: 15.5,
          current_heading: 180,
          tracked_by: [],
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ] as ShipType[]);
    } finally {
      setLoading(false);
    }
  };

  const filteredShips = ships.filter(ship => {
    const matchesSearch = ship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ship.imo_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || ship.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('underway')) return '#3b82f6';
    if (statusLower.includes('anchor')) return '#f59e0b';
    if (statusLower.includes('moored')) return '#10b981';
    return '#6b7280';
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      container: 'Conteneur',
      tanker: 'Tanker',
      cargo: 'Cargo',
      passenger: 'Passager',
      fishing: 'Pêche',
      other: 'Autre'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <AdminHubLayout userType="admin">
        <div className="head-title">
          <h1>Chargement...</h1>
        </div>
      </AdminHubLayout>
    );
  }

  return (
    <AdminHubLayout userType="admin">
      <div className="head-title">
        <div className="left">
          <h1>Gestion des Navires</h1>
          <ul className="breadcrumb">
            <li><a href="#">Admin</a></li>
            <li> / </li>
            <li><a className="active" href="#">Navires</a></li>
          </ul>
        </div>
      </div>

      <div className="table-data">
        <div className="order" style={{ width: '100%' }}>
          <div className="head">
            <h3>Tous les Navires ({filteredShips.length})</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="form-input" style={{ width: '300px', margin: 0 }}>
                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="search"
                  placeholder="Rechercher navire..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
              <select
                title="Filtrer par type de navire"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="all">Tous types</option>
                <option value="container">Conteneur</option>
                <option value="tanker">Tanker</option>
                <option value="cargo">Cargo</option>
                <option value="passenger">Passager</option>
                <option value="fishing">Pêche</option>
              </select>
            </div>
          </div>

          {filteredShips.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <p>Aucun navire trouvé</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>IMO</th>
                  <th>Type</th>
                  <th>Position</th>
                  <th>Statut</th>
                  <th>Suivi par</th>
                  <th>Dernière MAJ</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShips.map((ship) => (
                  <tr key={ship.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Ship size={20} />
                        <strong>{ship.name}</strong>
                      </div>
                    </td>
                    <td>{ship.imo_number}</td>
                    <td>{getTypeLabel(ship.type)}</td>
                    <td>
                      {ship.current_latitude && ship.current_longitude ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={14} />
                          {ship.current_latitude.toFixed(2)}, {ship.current_longitude.toFixed(2)}
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: getStatusColor(ship.status) + '20',
                          color: getStatusColor(ship.status),
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        {ship.status}
                      </span>
                    </td>
                    <td>{ship.tracked_by?.length || 0} utilisateur(s)</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#666' }}>
                        <Clock size={12} />
                        {new Date(ship.last_updated).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button title="Voir les détails" style={{ padding: '6px', border: 'none', background: '#e3f2fd', borderRadius: '4px', cursor: 'pointer' }}>
                          <Eye size={16} color="#1976d2" />
                        </button>
                        <button title="Modifier" style={{ padding: '6px', border: 'none', background: '#fff3e0', borderRadius: '4px', cursor: 'pointer' }}>
                          <Edit size={16} color="#f57c00" />
                        </button>
                        <button title="Supprimer" style={{ padding: '6px', border: 'none', background: '#ffebee', borderRadius: '4px', cursor: 'pointer' }}>
                          <Trash2 size={16} color="#d32f2f" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminHubLayout>
  );
};

export default AdminShips;
