import React, { useState, useEffect } from 'react';
import { ChevronRight, Download, Search, Filter, Plus, Users, Ship, Globe, Shield } from 'lucide-react';
import AdminHubLayout from '@/components/AdminHub/Layout';

const AdminDashboard: React.FC = () => {
  const [recentOrders, setRecentOrders] = useState([
    {
      id: 1,
      user: 'John Doe',
      date: '01-10-2024',
      status: 'completed',
      type: 'Nouveau commerçant'
    },
    {
      id: 2,
      user: 'Jane Smith',
      date: '02-10-2024',
      status: 'pending',
      type: 'Demande de port'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      date: '03-10-2024',
      status: 'process',
      type: 'Mise à jour navire'
    }
  ]);

  const [todos, setTodos] = useState([
    { id: 1, text: 'Vérifier les nouveaux utilisateurs', completed: true },
    { id: 2, text: 'Analyser les performances système', completed: true },
    { id: 3, text: 'Mettre à jour les données météo', completed: false },
    { id: 4, text: 'Générer rapport blockchain', completed: true },
    { id: 5, text: 'Réviser les alertes système', completed: false }
  ]);

  const stats = [
    {
      icon: Users,
      title: 'Utilisateurs Actifs',
      value: '1,234',
      trend: '+15%',
      color: 'blue'
    },
    {
      icon: Ship,
      title: 'Navires Suivis',
      value: '456',
      trend: '+8%',
      color: 'yellow'
    },
    {
      icon: Globe,
      title: 'Ports Connectés',
      value: '89',
      trend: '+12%',
      color: 'orange'
    },
    {
      icon: Shield,
      title: 'Transactions Blockchain',
      value: '2,847',
      trend: '+23%',
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
              {recentOrders.map((order) => (
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
