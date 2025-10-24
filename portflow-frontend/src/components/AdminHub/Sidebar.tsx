import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut,
  Ship,
  Anchor,
  TrendingUp,
  AlertTriangle,
  Globe,
  FileText,
  Shield
} from 'lucide-react';

interface SidebarProps {
  userType: 'admin' | 'merchant';
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminHubSidebar: React.FC<SidebarProps> = ({ userType, isCollapsed, onToggle }) => {
  const location = useLocation();

  // Menu items based on user type
  const getMenuItems = () => {
    if (userType === 'admin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Ship, label: 'Navires', path: '/admin/ships' },
        { icon: Anchor, label: 'Ports', path: '/admin/ports' },
        { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
        { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
        { icon: Globe, label: 'Météo', path: '/admin/weather' },
        { icon: Shield, label: 'Blockchain', path: '/admin/blockchain' },
      ];
    } else {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/merchant/dashboard' },
        { icon: Ship, label: 'Mes Navires', path: '/merchant/ships' },
        { icon: Anchor, label: 'Ports Suivis', path: '/merchant/ports' },
        { icon: BarChart3, label: 'Statistiques', path: '/merchant/analytics' },
        { icon: MessageSquare, label: 'Messages', path: '/merchant/messages' },
        { icon: Globe, label: 'Météo', path: '/merchant/weather' },
        { icon: FileText, label: 'Rapports', path: '/merchant/reports' },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <section 
      id="sidebar" 
      className={`adminhub-sidebar ${isCollapsed ? 'hide' : ''}`}
    >
      <a href="#" className="brand">
        <div className='bx bxs-smile'>
          <Ship size={24} />
        </div>
        <span className="text">PortFlow AI</span>
      </a>
      
      <ul className="side-menu top">
        {menuItems.map((item, index) => (
          <li 
            key={index}
            className={location.pathname === item.path ? 'active' : ''}
          >
            <Link to={item.path}>
              <div className="bx">
                <item.icon size={20} />
              </div>
              <span className="text">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      
      <ul className="side-menu">
        <li>
          <Link to="/settings">
            <div className="bx">
              <Settings size={20} />
            </div>
            <span className="text">Paramètres</span>
          </Link>
        </li>
        <li>
          <Link to="/logout" className="logout">
            <div className="bx">
              <LogOut size={20} />
            </div>
            <span className="text">Déconnexion</span>
          </Link>
        </li>
      </ul>
    </section>
  );
};

export default AdminHubSidebar;
