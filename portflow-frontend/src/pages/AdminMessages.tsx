import React, { useState, useEffect } from 'react';
import { Mail, Search, Filter, Clock, User, AlertCircle, Send } from 'lucide-react';
import AdminHubLayout from '@/components/AdminHub/Layout';
import { notificationService, Message } from '@/services/notificationService';

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMessages();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      // Fallback to static data
      setMessages([
        {
          id: 1,
          from_user: { id: 1, username: 'merchant_1', user_type: 'merchant' },
          to_user: { id: 2, username: 'admin', user_type: 'admin' },
          subject: 'Question about shipment delay',
          content: 'Hello, I have a question regarding a delayed shipment.',
          message_type: 'inquiry',
          is_read: false,
          is_urgent: false,
          created_at: new Date().toISOString(),
        },
      ] as Message[]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.from_user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || message.message_type === filterType;
    return matchesSearch && matchesType;
  });

  const getMessageTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      inquiry: '❓',
      support: '🛠️',
      alert: '⚠️',
      general: '💬',
    };
    return icons[type] || '💬';
  };

  const getMessageTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      inquiry: 'Question',
      support: 'Support',
      alert: 'Alerte',
      general: 'Général',
    };
    return labels[type] || type;
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
          <h1>Gestion des Messages</h1>
          <ul className="breadcrumb">
            <li><a href="#">Admin</a></li>
            <li> / </li>
            <li><a className="active" href="#">Messages</a></li>
          </ul>
        </div>
      </div>

      <div className="table-data">
        <div className="order" style={{ width: '100%' }}>
          <div className="head">
            <h3>Messages ({filteredMessages.length})</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="form-input" style={{ width: '300px', margin: 0 }}>
                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="search"
                  placeholder="Rechercher message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
              <select
                title="Filtrer par type de message"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="all">Tous types</option>
                <option value="inquiry">Question</option>
                <option value="support">Support</option>
                <option value="alert">Alerte</option>
                <option value="general">Général</option>
              </select>
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <p>Aucun message trouvé</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>De</th>
                  <th>À</th>
                  <th>Sujet</th>
                  <th>Contenu</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => (
                  <tr key={message.id} style={{ backgroundColor: !message.is_read ? '#f0f9ff' : 'transparent' }}>
                    <td>
                      <span style={{ fontSize: '20px' }}>{getMessageTypeIcon(message.message_type)}</span>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        {getMessageTypeLabel(message.message_type)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={14} />
                        {message.from_user.username}
                        <span style={{ fontSize: '11px', color: '#666' }}>({message.from_user.user_type})</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={14} />
                        {message.to_user.username}
                      </div>
                    </td>
                    <td>
                      <strong>{message.subject}</strong>
                      {message.is_urgent && (
                        <AlertCircle size={14} color="#ef4444" style={{ marginLeft: '5px' }} />
                      )}
                    </td>
                    <td>
                      <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {message.content}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#666' }}>
                        <Clock size={12} />
                        {new Date(message.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: message.is_read ? '#10b98120' : '#ef444420',
                        color: message.is_read ? '#10b981' : '#ef4444',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {message.is_read ? 'Lu' : 'Non lu'}
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

export default AdminMessages;
