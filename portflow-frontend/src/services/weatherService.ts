import { apiService } from './api';

// Interfaces pour les données météo
export interface WeatherData {
  id: number;
  port: {
    id: number;
    name: string;
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    code: string;
  };
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  weather_condition: string;
  description: string;
  visibility: number;
  recorded_at: string;
}

export interface WeatherAlert {
  id: number;
  port: {
    id: number;
    name: string;
    country: string;
    city: string;
  };
  alert_type: 'storm' | 'high_wind' | 'fog' | 'heavy_rain' | 'heat_wave';
  severity: 'low' | 'medium' | 'high';
  message: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface WeatherForecast {
  port: {
    id: number;
    name: string;
    country: string;
    city: string;
  };
  forecast_data: Array<{
    date: string;
    temperature: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    weather_condition: string;
    description: string;
    visibility: number;
  }>;
}

class WeatherService {
  // Obtenir les données météo actuelles pour un port
  async getCurrentWeather(portId: number): Promise<WeatherData> {
    const response = await apiService.get<WeatherData>(`/weather/current/${portId}/`);
    return response;
  }

  // Obtenir les données météo pour tous les ports
  async getAllWeatherData(): Promise<WeatherData[]> {
    const response = await apiService.get<WeatherData[]>('/weather/current/');
    return response;
  }

  // Obtenir les alertes météo actives
  async getActiveWeatherAlerts(): Promise<WeatherAlert[]> {
    const response = await apiService.get<WeatherAlert[]>('/weather/alerts/active/');
    return response;
  }

  // Obtenir les alertes météo pour un port spécifique
  async getWeatherAlertsForPort(portId: number): Promise<WeatherAlert[]> {
    const response = await apiService.get<WeatherAlert[]>(`/weather/alerts/port/${portId}/`);
    return response;
  }

  // Obtenir les prévisions météo pour un port
  async getWeatherForecast(portId: number, days: number = 5): Promise<WeatherForecast> {
    const response = await apiService.get<WeatherForecast>(`/weather/forecast/${portId}/?days=${days}`);
    return response;
  }

  // Obtenir l'historique météo pour un port
  async getWeatherHistory(portId: number, days: number = 7): Promise<WeatherData[]> {
    const response = await apiService.get<WeatherData[]>(`/weather/history/${portId}/?days=${days}`);
    return response;
  }

  // Créer une alerte météo (pour les administrateurs)
  async createWeatherAlert(alertData: {
    port: number;
    alert_type: 'storm' | 'high_wind' | 'fog' | 'heavy_rain' | 'heat_wave';
    severity: 'low' | 'medium' | 'high';
    message: string;
    start_time: string;
    end_time: string;
  }): Promise<WeatherAlert> {
    const response = await apiService.post<WeatherAlert>('/weather/alerts/', alertData);
    return response;
  }

  // Mettre à jour les données météo (pour les administrateurs)
  async updateWeatherData(): Promise<{ message: string; updated_ports: number }> {
    const response = await apiService.post<{ message: string; updated_ports: number }>('/weather/update/');
    return response;
  }

  // Obtenir les statistiques météo
  async getWeatherStats(): Promise<{
    total_ports: number;
    ports_with_alerts: number;
    average_temperature: number;
    average_humidity: number;
    average_wind_speed: number;
  }> {
    const response = await apiService.get<any>('/weather/stats/');
    return response;
  }
}

export const weatherService = new WeatherService();
