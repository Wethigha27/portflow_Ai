import React, { useState, useEffect } from 'react';
import { ChevronRight, Download, Search, Filter, Plus, Ship, Anchor, TrendingUp, AlertTriangle, Calendar, Users, DollarSign } from 'lucide-react';
import AdminHubLayout from '@/components/AdminHub/Layout';

const MerchantDashboard: React.FC = () => {
  const [recentOrders, setRecentOrders] = useState([
    {
      id: 1,
      user: 'MSC Oscar',
      date: '01-10-2024',
      status: 'completed',
      route: 'Lagos → Abidjan',
      eta: '2h 30min'
    },
    {
      id: 2,
      user: 'Maersk Line',
      date: '02-10-2024',
      status: 'pending',
      route: 'Dakar → Lagos',
      eta: '5h 15min'
    },
    {
      id: 3,
      user: 'CMA CGM',
      date: '03-10-2024',
      status: 'process',
      route: 'Casablanca → Dakar',
      eta: '1h 45min'
    }
  ]);

  const [todos, setTodos] = useState([
    { id: 1, text: 'Vérifier les positions des navires', completed: true },
    { id: 2, text: 'Analyser les prévisions météo', completed: true },
    { id: 3, text: 'Mettre à jour les ETA', completed: false },
    { id: 4, text: 'Contacter les ports partenaires', completed: true },
    { id: 5, text: 'Générer le rapport hebdomadaire', completed: false }
  ]);

  const stats = [
    {
      icon: Ship,
      title: 'Navires Suivis',
      value: '24',
      trend: '+12%',
      color: 'blue'
    },
    {
      icon: Anchor,
      title: 'Ports Actifs',
      value: '8',
      trend: '+3%',
      color: 'yellow'
    },
    {
      icon: TrendingUp,
      title: 'Prédictions IA',
      value: '156',
      trend: '+8%',
      color: 'orange'
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
      case 'completed': return 'En route';
      case 'pending': return 'En attente';
      case 'process': return 'En cours';
      default: return status;
    }
  };

  return (
    <AdminHubLayout userType="merchant">
      <div className="head-title">
        <div className="left">
          <h1>Dashboard Commerçant</h1>
          <ul className="breadcrumb">
            <li>
              <a href="#">Dashboard</a>
            </li>
            <li><ChevronRight size={16} /></li>
            <li>
              <a className="active" href="#">Accueil</a>
            </li>
          </ul>
        </div>
        <a href="#" className="btn-download">
          <Download size={16} />
          <span className="text">Télécharger PDF</span>
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
            <h3>Expéditions Récentes</h3>
            <Search size={20} />
            <Filter size={20} />
          </div>
          <table>
            <thead>
              <tr>
                <th>Navire</th>
                <th>Date Expédition</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <img src="/img/people.png" alt="Ship" />
                    <div>
                      <p>{order.user}</p>
                      <small>{order.route}</small>
                    </div>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <span className={getStatusClass(order.status)}>
                      {getStatusText(order.status)}
                    </span>
                    <br />
                    <small>ETA: {order.eta}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="todo">
          <div className="head">
            <h3>Tâches</h3>
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

export default MerchantDashboard;
