import React, { useState, ReactNode } from 'react';
import AdminHubSidebar from './Sidebar';
import AdminHubNavbar from './Navbar';
import '../../styles/adminhub.css';

interface AdminHubLayoutProps {
  children: ReactNode;
  userType: 'admin' | 'merchant';
}

const AdminHubLayout: React.FC<AdminHubLayoutProps> = ({ children, userType }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleMenuToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Implement search functionality
  };

  return (
    <div className="adminhub-container">
      <AdminHubSidebar 
        userType={userType}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleMenuToggle}
      />
      
      <section className="adminhub-content">
        <AdminHubNavbar 
          onMenuToggle={handleMenuToggle}
          onSearch={handleSearch}
          userType={userType}
        />
        
        <main>
          {children}
        </main>
      </section>
    </div>
  );
};

export default AdminHubLayout;
