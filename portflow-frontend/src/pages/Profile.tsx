import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { User } from '../services/authService';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    company_name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        phone_number: user.phone_number || '',
        company_name: user.company_name || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      await updateProfile(formData);
      setMessage('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (error: any) {
      setMessage('Erreur lors de la mise à jour du profil');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        phone_number: user.phone_number || '',
        company_name: user.company_name || '',
      });
    }
    setIsEditing(false);
    setMessage('');
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <div className="avatar-icon">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="profile-info">
                <h2>{user.username}</h2>
                <p className="user-type">
                  {user.user_type === 'admin' ? '👑 Administrateur' : '🏢 Marchand'}
                </p>
                <p className="user-email">{user.email}</p>
              </div>
              <div className="profile-actions">
                {!isEditing ? (
                  <button 
                    className="button button-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Modifier
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button 
                      className="button button-success"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sauvegarde...' : '💾 Sauvegarder'}
                    </button>
                    <button 
                      className="button button-secondary"
                      onClick={handleCancel}
                    >
                      ❌ Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('succès') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <div className="profile-details">
              <h3>Informations personnelles</h3>
              
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="username">Nom d'utilisateur</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone_number">Numéro de téléphone</label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company_name">Nom de l'entreprise</label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="profile-stats">
              <h3>Statistiques</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-content">
                    <h4>{user.points}</h4>
                    <p>Points</p>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">📧</div>
                  <div className="stat-content">
                    <h4>{user.email_verified ? 'Vérifié' : 'Non vérifié'}</h4>
                    <p>Email</p>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">👤</div>
                  <div className="stat-content">
                    <h4>{user.user_type}</h4>
                    <p>Type d'utilisateur</p>
                  </div>
                </div>
              </div>
            </div>

            {!user.email_verified && (
              <div className="verification-notice">
                <div className="notice-icon">⚠️</div>
                <div className="notice-content">
                  <h4>Email non vérifié</h4>
                  <p>
                    Votre adresse email n'est pas encore vérifiée. 
                    Vérifiez votre boîte de réception pour le lien de vérification.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
