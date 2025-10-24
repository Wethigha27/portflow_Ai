import { apiService } from './api';

// Interfaces pour l'authentification
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  user_type: 'admin' | 'merchant';
  phone_number?: string;
  company_name?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'admin' | 'merchant';
  phone_number: string;
  company_name: string;
  points: number;
  email_verified: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

class AuthService {
  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/users/token/', credentials);
    
    // Stocker les tokens
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    
    return response;
  }

  // Inscription
  async register(userData: RegisterData): Promise<User> {
    const response = await apiService.post<User>('/users/register/', userData);
    return response;
  }

  // Vérification de l'email
  async verifyEmail(verificationCode: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/users/verify-email/', {
      verification_code: verificationCode,
    });
    return response;
  }

  // Obtenir le profil utilisateur
  async getProfile(): Promise<User> {
    const response = await apiService.get<User>('/users/profile/');
    return response;
  }

  // Mettre à jour le profil
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<User>('/users/profile/', userData);
    return response;
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Obtenir le token d'accès
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Obtenir le token de rafraîchissement
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
}

export const authService = new AuthService();
