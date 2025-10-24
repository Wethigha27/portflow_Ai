import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService, Notification, Message, UnreadCount } from '../services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  messages: Message[];
  unreadCount: UnreadCount;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  markNotificationRead: (notificationId: number) => Promise<void>;
  markMessageRead: (messageId: number) => Promise<void>;
  sendMessage: (messageData: {
    to_user: number;
    subject: string;
    content: string;
    message_type?: 'inquiry' | 'support' | 'alert' | 'general';
    related_ship?: number;
  }) => Promise<void>;
  replyToMessage: (messageId: number, content: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState<UnreadCount>({ notifications: 0, messages: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        refreshNotifications(),
        refreshMessages(),
        refreshUnreadCount(),
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const refreshMessages = async () => {
    try {
      const data = await notificationService.getMessages();
      setMessages(data);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const refreshUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de notifications non lues:', error);
    }
  };

  const markNotificationRead = async (notificationId: number) => {
    try {
      await notificationService.markNotificationRead(notificationId);
      await refreshNotifications();
      await refreshUnreadCount();
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  };

  const markMessageRead = async (messageId: number) => {
    try {
      await notificationService.markMessageRead(messageId);
      await refreshMessages();
      await refreshUnreadCount();
    } catch (error) {
      console.error('Erreur lors du marquage du message comme lu:', error);
      throw error;
    }
  };

  const sendMessage = async (messageData: {
    to_user: number;
    subject: string;
    content: string;
    message_type?: 'inquiry' | 'support' | 'alert' | 'general';
    related_ship?: number;
  }) => {
    try {
      await notificationService.sendMessage(messageData);
      await refreshMessages();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  };

  const replyToMessage = async (messageId: number, content: string) => {
    try {
      await notificationService.replyToMessage(messageId, content);
      await refreshMessages();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
      throw error;
    }
  };

  const value: NotificationContextType = {
    notifications,
    messages,
    unreadCount,
    isLoading,
    refreshNotifications,
    refreshMessages,
    markNotificationRead,
    markMessageRead,
    sendMessage,
    replyToMessage,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications doit être utilisé dans un NotificationProvider');
  }
  return context;
};
