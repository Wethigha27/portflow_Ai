import { apiService } from './api';

// Interfaces pour les notifications
export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'delay' | 'weather' | 'position' | 'arrival' | 'departure' | 'eta_change' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  is_actionable: boolean;
  created_at: string;
  read_at?: string;
  expires_at?: string;
  related_ship?: {
    id: number;
    name: string;
    imo: string;
    type: string;
  };
  metadata: Record<string, any>;
}

export interface Message {
  id: number;
  from_user: {
    id: number;
    username: string;
    user_type: string;
  };
  to_user: {
    id: number;
    username: string;
    user_type: string;
  };
  subject: string;
  content: string;
  message_type: 'inquiry' | 'support' | 'alert' | 'general';
  is_read: boolean;
  is_urgent: boolean;
  created_at: string;
  read_at?: string;
  related_ship?: {
    id: number;
    name: string;
    imo: string;
  };
  parent_message?: number;
}

export interface UnreadCount {
  notifications: number;
  messages: number;
}

class NotificationService {
  // Obtenir les notifications de l'utilisateur
  async getNotifications(): Promise<Notification[]> {
    const response = await apiService.get<Notification[]>('/notifications/notifications/');
    return response;
  }

  // Marquer une notification comme lue
  async markNotificationRead(notificationId: number): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`/notifications/notifications/${notificationId}/read/`);
    return response;
  }

  // Obtenir le nombre de notifications non lues
  async getUnreadCount(): Promise<UnreadCount> {
    const response = await apiService.get<UnreadCount>('/notifications/notifications/unread-count/');
    return response;
  }

  // Obtenir les messages
  async getMessages(): Promise<Message[]> {
    const response = await apiService.get<Message[]>('/notifications/messages/');
    return response;
  }

  // Envoyer un message
  async sendMessage(messageData: {
    to_user: number;
    subject: string;
    content: string;
    message_type?: 'inquiry' | 'support' | 'alert' | 'general';
    related_ship?: number;
    parent_message?: number;
  }): Promise<{ message: Message }> {
    const response = await apiService.post<{ message: Message }>('/notifications/messages/', messageData);
    return response;
  }

  // Marquer un message comme lu
  async markMessageRead(messageId: number): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`/notifications/messages/${messageId}/read/`);
    return response;
  }

  // Répondre à un message
  async replyToMessage(messageId: number, content: string): Promise<{ message: Message }> {
    const response = await apiService.post<{ message: Message }>(`/notifications/messages/${messageId}/reply/`, {
      content,
    });
    return response;
  }

  // Vérifier les navires en retard (pour les administrateurs)
  async checkDelayedShips(): Promise<{ message: string; delayed_ships: number }> {
    const response = await apiService.post<{ message: string; delayed_ships: number }>('/notifications/check-delays/');
    return response;
  }

  // Vérifier les alertes météo (pour les administrateurs)
  async checkWeatherAlerts(): Promise<{ message: string; alerts_created: number }> {
    const response = await apiService.post<{ message: string; alerts_created: number }>('/notifications/check-weather-alerts/');
    return response;
  }
}

export const notificationService = new NotificationService();
