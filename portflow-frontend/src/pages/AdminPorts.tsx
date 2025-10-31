import React, { useState, useEffect } from 'react';
import { Search, MapPin, Globe, Calendar, Edit, Trash2, Plus } from 'lucide-react';
import AdminHubLayout from '@/components/AdminHub/Layout';
import { shipService, Port } from '@/services/shipService';

const AdminPorts: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  useEffect(() => {
    loadPorts();
  }, []);

  const loadPorts = async () => {
    try {
      setLoading(true);
      const data = await shipService.getPorts();
      setPorts(data);
    } catch (error) {
      console.error('Error loading ports:', error);
      // Fallback to static data
      setPorts([
        {
          id: 1,
          name: 'Port de Marseille',
          country: 'France',
          city: 'Marseille',
          code: 'FRMRS',
          latitude: 43.2965,
          longitude: 5.3698,
        },
        {
          id: 2,
          name: 'Port de Rotterdam',
          country: 'Netherlands',
          city: 'Rotterdam',
          code: 'NLRTM',
          latitude: 51.9225,
          longitude: 4.4781,
        },
        {
          id: 3,
          name: 'Port de Tanger-Med',
          country: 'Morocco',
          city: 'Tangier',
          code: 'MATGM',
          latitude: 35.8967,
          longitude: -5.5127,
        },
      ] as Port[]);
    } finally {
      setLoading(false);
    }
  };

  const countries = Array.from(new Set(ports.map(p => p.country))).sort();
  const filteredPorts = ports.filter(port => {
    const matchesSearch = port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         port.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         port.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || port.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

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
          <h1>Gestion des Ports</h1>
          <ul className="breadcrumb">
            <li><a href="#">Admin</a></li>
            <li> / </li>
            <li><a className="active" href="#">Ports</a></li>
          </ul>
        </div>
        <a href="#" className="btn-download" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} />
          <span className="text">Ajouter un Port</span>
        </a>
      </div>

      <div className="table-data">
        <div className="order" style={{ width: '100%' }}>
          <div className="head">
            <h3>Ports Connectés ({filteredPorts.length})</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="form-input" style={{ width: '300px', margin: 0 }}>
                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="search"
                  placeholder="Rechercher port..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
              <select
                title="Filtrer par pays"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="all">Tous les pays</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredPorts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <p>Aucun port trouvé</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Ville</th>
                  <th>Pays</th>
                  <th>Code</th>
                  <th>Coordonnées</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPorts.map((port) => (
                  <tr key={port.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapPin size={20} color="#3b82f6" />
                        <strong>{port.name}</strong>
                      </div>
                    </td>
                    <td>{port.city}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Globe size={14} />
                        {port.country}
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#1976d2'
                      }}>
                        {port.code}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {port.latitude.toFixed(4)}, {port.longitude.toFixed(4)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
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

export default AdminPorts;
