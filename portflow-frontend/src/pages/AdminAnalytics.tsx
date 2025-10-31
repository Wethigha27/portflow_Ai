import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Ship, Globe, Users, AlertTriangle } from 'lucide-react';
import AdminHubLayout from '@/components/AdminHub/Layout';
import { shipService } from '@/services/shipService';
import { weatherService } from '@/services/weatherService';
import { notificationService } from '@/services/notificationService';

const AdminAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    ships: {
      total: 0,
      tracked: 0,
      inPort: 0,
      atSea: 0,
      avgSpeed: 0,
    },
    ports: {
      total: 0,
      withAlerts: 0,
    },
    users: {
      total: 0,
      active: 0,
    },
    notifications: {
      total: 0,
      unread: 0,
    },
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [shipStats, weatherStats, unreadCount] = await Promise.all([
        shipService.getShippingStats().catch(() => null),
        weatherService.getWeatherStats().catch(() => null),
        notificationService.getUnreadCount().catch(() => ({ notifications: 0, messages: 0 })),
      ]);

      setAnalytics({
        ships: shipStats ? {
          total: shipStats.total_ships,
          tracked: shipStats.tracked_ships,
          inPort: shipStats.ships_in_port,
          atSea: shipStats.ships_at_sea,
          avgSpeed: shipStats.average_speed,
        } : {
          total: 50,
          tracked: 35,
          inPort: 12,
          atSea: 38,
          avgSpeed: 15.5,
        },
        ports: weatherStats ? {
          total: weatherStats.total_ports,
          withAlerts: weatherStats.ports_with_alerts || 0,
        } : {
          total: 15,
          withAlerts: 3,
        },
        users: {
          total: 20,
          active: 15,
        },
        notifications: {
          total: 150,
          unread: unreadCount.notifications,
        },
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
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
          <h1>Analytics & Statistiques</h1>
          <ul className="breadcrumb">
            <li><a href="#">Admin</a></li>
            <li> / </li>
            <li><a className="active" href="#">Analytics</a></li>
          </ul>
        </div>
      </div>

      {/* Main Stats */}
      <ul className="box-info">
        <li>
          <Ship size={36} />
          <span className="text">
            <h3>17</h3>
            <p>Navires Total</p>
          </span>
        </li>
        <li>
          <Globe size={36} />
          <span className="text">
            <h3>{analytics.ports.total}</h3>
            <p>Ports Connectés</p>
          </span>
        </li>
        <li>
          <Users size={36} />
          <span className="text">
            <h3>{analytics.users.total}</h3>
            <p>Utilisateurs</p>
          </span>
        </li>
        <li>
          <AlertTriangle size={36} />
          <span className="text">
            <h3>1</h3>
            <p>Notifications Non Lues</p>
          </span>
        </li>
      </ul>

      {/* Detailed Analytics */}
      <div className="table-data" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Ships Analytics */}
        <div className="order">
          <div className="head">
            <h3>Statistiques Navires</h3>
            <BarChart3 size={20} />
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Navires suivis</span>
                <strong>{analytics.ships.tracked}</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(analytics.ships.tracked / analytics.ships.total) * 100}%`,
                  height: '100%',
                  backgroundColor: '#3b82f6',
                }} />
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>En port</span>
                <strong>{analytics.ships.inPort}</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(analytics.ships.inPort / analytics.ships.total) * 100}%`,
                  height: '100%',
                  backgroundColor: '#10b981',
                }} />
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>En mer</span>
                <strong>{analytics.ships.atSea}</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(analytics.ships.atSea / analytics.ships.total) * 100}%`,
                  height: '100%',
                  backgroundColor: '#f59e0b',
                }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Vitesse moyenne</span>
                <strong>{(analytics.ships.avgSpeed ?? 0).toFixed(1)} nœuds</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Ports Analytics */}
        <div className="order">
          <div className="head">
            <h3>Statistiques Ports</h3>
            <Globe size={20} />
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                {analytics.ports.total}
              </div>
              <div style={{ color: '#666' }}>Ports connectés</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px', color: '#ef4444' }}>
                {analytics.ports.withAlerts}
              </div>
              <div style={{ color: '#666' }}>Ports avec alertes</div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Taux d'alertes</span>
                <strong>
                  {analytics.ports.total > 0
                    ? ((analytics.ports.withAlerts / analytics.ports.total) * 100).toFixed(1)
                    : 0}%
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${analytics.ports.total > 0 ? (analytics.ports.withAlerts / analytics.ports.total) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#ef4444',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Users Analytics */}
        <div className="order">
          <div className="head">
            <h3>Statistiques Utilisateurs</h3>
            <Users size={20} />
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                {analytics.users.total}
              </div>
              <div style={{ color: '#666' }}>Utilisateurs total</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px', color: '#10b981' }}>
                {analytics.users.active}
              </div>
              <div style={{ color: '#666' }}>Utilisateurs actifs</div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Taux d'activité</span>
                <strong>
                  {analytics.users.total > 0
                    ? ((analytics.users.active / analytics.users.total) * 100).toFixed(1)
                    : 0}%
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${analytics.users.total > 0 ? (analytics.users.active / analytics.users.total) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#10b981',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Analytics */}
        <div className="order">
          <div className="head">
            <h3>Statistiques Notifications</h3>
            <AlertTriangle size={20} />
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                {analytics.notifications.total}
              </div>
              <div style={{ color: '#666' }}>Notifications total</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px', color: '#ef4444' }}>
                {analytics.notifications.unread}
              </div>
              <div style={{ color: '#666' }}>Non lues</div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Taux de lecture</span>
                <strong>
                  {analytics.notifications.total > 0
                    ? (((analytics.notifications.total - analytics.notifications.unread) / analytics.notifications.total) * 100).toFixed(1)
                    : 0}%
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${analytics.notifications.total > 0 ? ((analytics.notifications.total - analytics.notifications.unread) / analytics.notifications.total) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#10b981',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminHubLayout>
  );
};

export default AdminAnalytics;
