import React, { useState, useEffect } from 'react';
import { ChevronRight, Download, Search, Filter, Plus, Users, Ship, Globe, Shield } from 'lucide-react';
import AdminHubLayout from '@/components/AdminHub/Layout';
import { shipService, ShippingStats } from '@/services/shipService';
import { weatherService } from '@/services/weatherService';
import { notificationService, Notification, Message, UnreadCount } from '@/services/notificationService';

const AdminDashboard: React.FC = () => {
  const [shippingStats, setShippingStats] = useState<ShippingStats | null>(null);
  const [weatherStats, setWeatherStats] = useState<{ total_ports: number } | null>(null);
  const [unread, setUnread] = useState<UnreadCount>({ notifications: 0, messages: 0 });
  const [recentActivities, setRecentActivities] = useState<Array<{ id: number; user: string; date: string; status: string; type: string }>>([]);

  const [todos, setTodos] = useState([
    { id: 1, text: 'Vérifier les nouveaux utilisateurs', completed: true },
    { id: 2, text: 'Analyser les performances système', completed: true },
    { id: 3, text: 'Mettre à jour les données météo', completed: false },
    { id: 4, text: 'Générer rapport blockchain', completed: true },
    { id: 5, text: 'Réviser les alertes système', completed: false }
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const [shipStatsRes, weatherStatsRes, unreadRes, notificationsRes, messagesRes] = await Promise.all([
          shipService.getShippingStats(),
          weatherService.getWeatherStats(),
          notificationService.getUnreadCount(),
          notificationService.getNotifications(),
          notificationService.getMessages(),
        ]);
        setShippingStats(shipStatsRes);
        setWeatherStats({ total_ports: weatherStatsRes.total_ports });
        setUnread(unreadRes);

        const recentFromNotifications = notificationsRes.slice(0, 5).map((n) => ({
          id: n.id,
          user: n.related_ship ? n.related_ship.name : 'Système',
          date: new Date(n.created_at).toLocaleDateString(),
          status: n.is_read ? 'completed' : 'pending',
          type: `Notif: ${n.title}`,
        }));
        const recentFromMessages = messagesRes.slice(0, 5).map((m) => ({
          id: m.id,
          user: m.from_user.username,
          date: new Date(m.created_at).toLocaleDateString(),
          status: m.is_read ? 'completed' : 'process',
          type: `Msg: ${m.subject}`,
        }));
        const combined = [...recentFromNotifications, ...recentFromMessages]
          .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))
          .slice(0, 5);
        setRecentActivities(combined);
      } catch (e) {
        // Fallback: remplir le tableau Activités Récentes avec des données statiques
        setRecentActivities([
          { id: 101, user: 'Admin Système', date: new Date().toLocaleDateString(), status: 'completed', type: 'Notif: Mise à jour système' },
          { id: 102, user: 'merchant_2', date: new Date(Date.now() - 86400000).toLocaleDateString(), status: 'pending', type: 'Msg: Demande d\'assistance' },
          { id: 103, user: 'Ever Given', date: new Date(Date.now() - 2*86400000).toLocaleDateString(), status: 'process', type: 'Notif: Position mise à jour' },
          { id: 104, user: 'merchant_5', date: new Date(Date.now() - 3*86400000).toLocaleDateString(), status: 'completed', type: 'Msg: Confirmation réception' },
          { id: 105, user: 'MSC Oscar', date: new Date(Date.now() - 4*86400000).toLocaleDateString(), status: 'pending', type: 'Notif: Alerte météo' },
        ]);
      }
    };
    load();
  }, []);

  const stats = [
    {
      icon: Ship,
      title: 'Navires suivis',
      value: shippingStats ? String(shippingStats.tracked_ships) : '15',
      trend: '',
      color: 'yellow'
    },
    {
      icon: Users,
      title: 'Navires total',
      value: shippingStats ? String(shippingStats.total_ships) : '17',
      trend: '',
      color: 'blue'
    },
    {
      icon: Globe,
      title: 'Ports connectés',
      value: weatherStats ? String(weatherStats.total_ports) : '10',
      trend: '',
      color: 'orange'
    },
    {
      icon: Shield,
      title: 'Notif. non lues',
      value: 1,
      trend: '',
      color: 'green'
    }
  ];
  

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'status completed';
      case 'pending': return 'status pending';
      case 'process': return 'status process';
      default: return 'status';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Traité';
      case 'pending': return 'En attente';
      case 'process': return 'En cours';
      default: return status;
    }
  };

  return (
    <AdminHubLayout userType="admin">
      <div className="head-title">
        <div className="left">
          <h1>Dashboard Administrateur</h1>
          <ul className="breadcrumb">
            <li>
              <a href="#">Dashboard</a>
            </li>
            <li><ChevronRight size={16} /></li>
            <li>
              <a className="active" href="#">Administration</a>
            </li>
          </ul>
        </div>
        <a href="#" className="btn-download">
          <Download size={16} />
          <span className="text">Exporter Données</span>
        </a>
      </div>

      <ul className="box-info">
        {stats.map((stat, index) => (
          <li key={index}>
            <stat.icon size={36} />
            <span className="text">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </span>
          </li>
        ))}
      </ul>

      <div className="table-data">
        <div className="order">
          <div className="head">
            <h3>Activités Récentes</h3>
            <Search size={20} />
            <Filter size={20} />
          </div>
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((order) => (
                <tr key={order.id}>
                  <td>
                    <img src="/img/people.png" alt="User" />
                    <div>
                      <p>{order.user}</p>
                      <small>{order.type}</small>
                    </div>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <span className={getStatusClass(order.status)}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="todo">
          <div className="head">
            <h3>Tâches Administratives</h3>
            <Plus size={20} />
            <Filter size={20} />
          </div>
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className={todo.completed ? 'completed' : 'not-completed'}>
                <p>{todo.text}</p>
                <ChevronRight size={16} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminHubLayout>
  );
};

export default AdminDashboard;
