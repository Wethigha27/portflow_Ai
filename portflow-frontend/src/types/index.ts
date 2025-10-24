export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'merchant' | 'admin';
}

export interface Port {
  id: number;
  name: string;
  code: string;
  country: string;
  latitude: number;
  longitude: number;
  capacity: number;
}

export interface Ship {
  id: number;
  name: string;
  imo_number: string;
  ship_type: string;
  flag: string;
  current_position?: {
    latitude: number;
    longitude: number;
    speed: number;
    course: number;
    timestamp: string;
  };
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  is_read: boolean;
  created_at: string;
}

export interface Prediction {
  id: number;
  ship: Ship;
  risk_level: 'low' | 'medium' | 'high';
  delay_probability: number;
  factors: string[];
  blockchain_transaction_id?: string;
  created_at: string;
}

export interface WeatherData {
  temperature: number;
  weather_condition: string;
  wind_speed: number;
  wave_height: number;
  visibility: number;
}
