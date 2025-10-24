import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext.tsx';
import { Notification, Message } from '../services/notificationService.ts';
import './Notifications.css';

const Notifications: React.FC = () => {
  const {
    notifications,
    messages,
    unreadCount,
    isLoading,
    markNotificationRead,
    markMessageRead,
    sendMessage,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to_user: '',
    subject: '',
    content: '',
    message_type: 'general' as 'inquiry' | 'support' | 'alert' | 'general',
  });

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationRead(notificationId);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  const handleMarkMessageAsRead = async (messageId: number) => {
    try {
      await markMessageRead(messageId);
    } catch (error) {
      console.error('Erreur lors du marquage du message:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage({
        to_user: parseInt(composeData.to_user),
        subject: composeData.subject,
        content: composeData.content,
        message_type: composeData.message_type,
      });
      setComposeData({
        to_user: '',
        subject: '',
        content: '',
        message_type: 'general',
      });
      setShowCompose(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      delay: '⏰',
      weather: '🌤️',
      position: '📍',
      arrival: '🚢',
      departure: '🚢',
      eta_change: '⏱️',
      system: '🔧',
    };
    return icons[type] || '🔔';
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      low: '#2ed573',
      medium: '#ffa502',
      high: '#ff4757',
      critical: '#c44569',
    };
    return colors[severity] || '#666';
  };

  const getMessageTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      inquiry: '❓',
      support: '🛠️',
      alert: '⚠️',
      general: '💬',
    };
    return icons[type] || '💬';
  };

  if (isLoading) {
    return (
      <div className="notifications-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="page-header">
          <h1>Notifications & Messages</h1>
          <p>Gérez vos notifications et messages</p>
        </div>

        <div className="notifications-content">
          {/* Onglets */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Notifications ({unreadCount.notifications})
            </button>
            <button
              className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              💬 Messages ({unreadCount.messages})
            </button>
          </div>

          {/* Contenu des notifications */}
          {activeTab === 'notifications' && (
            <div className="notifications-section">
              <div className="section-header">
                <h2>Notifications</h2>
                <button 
                  className="button button-primary"
                  onClick={() => setActiveTab('messages')}
                >
                  Nouveau message
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🔔</div>
                  <h3>Aucune notification</h3>
                  <p>Vous n'avez pas de notifications pour le moment</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="notification-icon">
                        {getNotificationIcon(notification.notification_type)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-header">
                          <h4>{notification.title}</h4>
                          <div className="notification-meta">
                            <span 
                              className="severity-badge"
                              style={{ backgroundColor: getSeverityColor(notification.severity) }}
                            >
                              {notification.severity}
                            </span>
                            <span className="notification-time">
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="notification-message">{notification.message}</p>
                        {notification.related_ship && (
                          <div className="related-ship">
                            <span className="ship-info">
                              🚢 {notification.related_ship.name} (IMO: {notification.related_ship.imo})
                            </span>
                          </div>
                        )}
                      </div>
                      {!notification.is_read && (
                        <div className="unread-indicator"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contenu des messages */}
          {activeTab === 'messages' && (
            <div className="messages-section">
              <div className="section-header">
                <h2>Messages</h2>
                <button 
                  className="button button-primary"
                  onClick={() => setShowCompose(true)}
                >
                  Nouveau message
                </button>
              </div>

              {showCompose && (
                <div className="compose-message">
                  <h3>Composer un message</h3>
                  <form onSubmit={handleSendMessage}>
                    <div className="form-group">
                      <label>Destinataire (ID utilisateur)</label>
                      <input
                        type="number"
                        value={composeData.to_user}
                        onChange={(e) => setComposeData({...composeData, to_user: e.target.value})}
                        required
                        placeholder="ID de l'utilisateur"
                      />
                    </div>
                    <div className="form-group">
                      <label>Sujet</label>
                      <input
                        type="text"
                        value={composeData.subject}
                        onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                        required
                        placeholder="Sujet du message"
                      />
                    </div>
                    <div className="form-group">
                      <label>Type de message</label>
                      <select
                        title="Type de message"
                        aria-label="Type de message"
                        value={composeData.message_type}
                        onChange={(e) => setComposeData({...composeData, message_type: e.target.value as 'inquiry' | 'support' | 'alert' | 'general'})}
                      >
                        <option value="general">Général</option>
                        <option value="inquiry">Question</option>
                        <option value="support">Support</option>
                        <option value="alert">Alerte</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea
                        value={composeData.content}
                        onChange={(e) => setComposeData({...composeData, content: e.target.value})}
                        required
                        placeholder="Contenu du message"
                        rows={4}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="button button-primary">
                        Envoyer
                      </button>
                      <button 
                        type="button" 
                        className="button button-secondary"
                        onClick={() => setShowCompose(false)}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {messages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💬</div>
                  <h3>Aucun message</h3>
                  <p>Vous n'avez pas de messages pour le moment</p>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-item ${!message.is_read ? 'unread' : ''}`}
                      onClick={() => handleMarkMessageAsRead(message.id)}
                    >
                      <div className="message-icon">
                        {getMessageTypeIcon(message.message_type)}
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <h4>{message.subject}</h4>
                          <div className="message-meta">
                            <span className="message-from">
                              De: {message.from_user.username}
                            </span>
                            <span className="message-time">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="message-text">{message.content}</p>
                        {message.related_ship && (
                          <div className="related-ship">
                            <span className="ship-info">
                              🚢 {message.related_ship.name} (IMO: {message.related_ship.imo})
                            </span>
                          </div>
                        )}
                      </div>
                      {!message.is_read && (
                        <div className="unread-indicator"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
