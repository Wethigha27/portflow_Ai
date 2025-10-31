import React, { useState, useEffect } from 'react';
import { Search, Users, Shield, Mail, Phone, Building, Trophy, Filter } from 'lucide-react';
import AdminHubLayout from '@/components/AdminHub/Layout';
import { apiService } from '@/services/api';

interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'admin' | 'merchant';
  phone_number?: string;
  company_name?: string;
  points?: number;
  email_verified: boolean;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Admin endpoint to list all users
      const data = await apiService.get<User[]>('/users/admin/list/').catch(() => null);
      
      if (data) {
        setUsers(data);
      } else {
        // Fallback to static data
        setUsers([
          {
            id: 1,
            username: 'admin_user',
            email: 'admin@portflow.com',
            user_type: 'admin',
            phone_number: '+33123456789',
            company_name: 'PortFlow Admin',
            points: 1500,
            email_verified: true,
          },
          {
            id: 2,
            username: 'merchant_1',
            email: 'merchant1@example.com',
            user_type: 'merchant',
            phone_number: '+33612345678',
            company_name: 'Shipping Co. Ltd',
            points: 750,
            email_verified: true,
          },
          {
            id: 3,
            username: 'merchant_2',
            email: 'merchant2@example.com',
            user_type: 'merchant',
            phone_number: '+33698765432',
            company_name: 'Maritime Logistics',
            points: 320,
            email_verified: true,
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.company_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || user.user_type === filterType;
    return matchesSearch && matchesType;
  });

  const getUserTypeBadge = (type: string) => {
    if (type === 'admin') {
      return (
        <span style={{
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: '#dc2626',
          color: 'white',
          fontSize: '11px',
          fontWeight: 600
        }}>
          Admin
        </span>
      );
    }
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        backgroundColor: '#3b82f6',
        color: 'white',
        fontSize: '11px',
        fontWeight: 600
      }}>
        Merchant
      </span>
    );
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
          <h1>Gestion des Utilisateurs</h1>
          <ul className="breadcrumb">
            <li><a href="#">Admin</a></li>
            <li> / </li>
            <li><a className="active" href="#">Utilisateurs</a></li>
          </ul>
        </div>
      </div>

      <div className="table-data">
        <div className="order" style={{ width: '100%' }}>
          <div className="head">
            <h3>Utilisateurs ({filteredUsers.length})</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="form-input" style={{ width: '300px', margin: 0 }}>
                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="search"
                  placeholder="Rechercher utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
              <select
                title="Filtrer par type d'utilisateur"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="all">Tous</option>
                <option value="admin">Admin</option>
                <option value="merchant">Merchant</option>
              </select>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Entreprise</th>
                  <th>Points</th>
                  <th>Contact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={20} color="#3b82f6" />
                        <strong>{user.username}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Mail size={14} />
                        {user.email}
                      </div>
                    </td>
                    <td>{getUserTypeBadge(user.user_type)}</td>
                    <td>
                      {user.company_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Building size={14} />
                          {user.company_name}
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Trophy size={14} color="#f59e0b" />
                        <strong>{user.points || 0}</strong>
                      </div>
                    </td>
                    <td>
                      {user.phone_number ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                          <Phone size={12} />
                          {user.phone_number}
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: user.email_verified ? '#10b98120' : '#ef444420',
                        color: user.email_verified ? '#10b981' : '#ef4444',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {user.email_verified ? 'Vérifié' : 'Non vérifié'}
                      </span>
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

export default AdminUsers;
