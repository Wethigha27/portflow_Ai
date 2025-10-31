import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, User, Menu, Moon, Sun } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';

interface AdminHubNavbarProps {
  onMenuToggle: () => void;
  onSearch: (query: string) => void;
  userType?: 'admin' | 'merchant';
}

const AdminHubNavbar: React.FC<AdminHubNavbarProps> = ({ onMenuToggle, onSearch, userType }) => {
  // const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSearch = (e: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark');
  };

  return (
    <nav className="adminhub-navbar">
      <div className="bx bx-menu" onClick={onMenuToggle}>
        <Menu size={24} />
      </div>
      {/* <a href="#" className="nav-link">Catégories</a> */}
      
      <div className="form-input form-input-centered">
        <div className="search-icon-wrapper">
          <Search size={18} />
        </div>
        <input 
          type="search" 
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
        />
        <button 
          className="search-btn" 
          onClick={handleSearch}
          type="button"
          aria-label="Rechercher"
          title="Rechercher"
        >
          <Search size={16} />
        </button>
      </div>
      
      <input 
        type="checkbox" 
        id="switch-mode" 
        hidden
        checked={isDarkMode}
        onChange={toggleDarkMode}
      />
      <label htmlFor="switch-mode" className="switch-mode"></label>
      
      <Link 
        to={userType === 'admin' ? '/admin/messages' : '/merchant/messages'} 
        className="notification"
      >
        <Bell size={20} />
        <span className="num">1</span>
      </Link>
      
      <a href="#" className="profile">
        <img 
          src="/img/people.png" 
          alt="Profile" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMTgiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDlDMTEuNjU2OSA5IDEzIDEwLjM0MzEgMTMgMTJDMTMgMTMuNjU2OSAxMS42NTY5IDE1IDEwIDE1QzguMzQzMTUgMTUgNyAxMy42NTY5IDcgMTJDNyAxMC4zNDMxIDguMzQzMTUgOSAxMCA5WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEwIDE3QzcuMjM5IDcgNSAxOS4yMzkgNSAyMkgxNUMxNSAxOS4yMzkgMTIuNzYxIDE3IDEwIDE3WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=';
          }}
        />
      </a>
    </nav>
  );
};

export default AdminHubNavbar;
