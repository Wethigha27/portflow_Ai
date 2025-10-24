import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ship,
  Anchor,
  CloudRain,
  Bell,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
  { icon: Ship, label: 'Navires', path: '/ships' },
  { icon: Anchor, label: 'Ports', path: '/ports' },
  { icon: TrendingUp, label: 'Prédictions IA', path: '/predictions' },
  { icon: CloudRain, label: 'Météo', path: '/weather' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Paramètres', path: '/settings' },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col gap-2 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-primary text-sidebar-primary-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};
