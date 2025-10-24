import { apiService } from './api';

// Interfaces pour les navires
export interface Port {
  id: number;
  name: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  code: string;
}

export interface Ship {
  id: number;
  name: string;
  imo_number: string;
  type: 'container' | 'tanker' | 'cargo' | 'passenger' | 'fishing' | 'other';
  current_latitude?: number;
  current_longitude?: number;
  current_speed?: number;
  current_heading?: number;
  status: string;
  destination_port?: Port;
  destination_name?: string;
  expected_arrival?: string;
  tracked_by: number[];
  last_updated: string;
  created_at: string;
  length?: number;
  width?: number;
  draft?: number;
}

export interface ShipPosition {
  imo_number: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: string;
  timestamp: string;
}

export interface ShipTrackingData {
  ship: Ship;
  positions: ShipPosition[];
  route: Array<{ latitude: number; longitude: number }>;
}

export interface SearchShipParams {
  query?: string;
  type?: string;
  status?: string;
  port?: string;
}

export interface ShippingStats {
  total_ships: number;
  tracked_ships: number;
  ships_in_port: number;
  ships_at_sea: number;
  average_speed: number;
}

class ShipService {
  // Obtenir la liste des ports
  async getPorts(): Promise<Port[]> {
    const response = await apiService.get<Port[]>('/ships/ports/');
    return response;
  }

  // Obtenir les détails d'un port
  async getPort(id: number): Promise<Port> {
    const response = await apiService.get<Port>(`/ships/ports/${id}/`);
    return response;
  }

  // Obtenir la liste des navires
  async getShips(params?: SearchShipParams): Promise<Ship[]> {
    const response = await apiService.get<Ship[]>('/ships/ships/', { params });
    return response;
  }

  // Obtenir les détails d'un navire
  async getShip(id: number): Promise<Ship> {
    const response = await apiService.get<Ship>(`/ships/ships/${id}/`);
    return response;
  }

  // Rechercher des navires
  async searchShips(params: SearchShipParams): Promise<Ship[]> {
    const response = await apiService.get<Ship[]>('/ships/search/', { params });
    return response;
  }

  // Suivre un navire
  async trackShip(shipId: number): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`/ships/track/${shipId}/`);
    return response;
  }

  // Arrêter de suivre un navire
  async untrackShip(shipId: number): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`/ships/untrack/${shipId}/`);
    return response;
  }

  // Obtenir les navires suivis par l'utilisateur
  async getTrackedShips(): Promise<Ship[]> {
    const response = await apiService.get<Ship[]>('/ships/my-tracking/');
    return response;
  }

  // Obtenir la position d'un navire
  async getShipPosition(imoNumber: string): Promise<ShipPosition> {
    const response = await apiService.get<ShipPosition>(`/ships/positions/${imoNumber}/`);
    return response;
  }

  // Obtenir les données de suivi d'un navire
  async getShipTracking(shipId: number): Promise<ShipTrackingData> {
    const response = await apiService.get<ShipTrackingData>(`/ships/tracking/${shipId}/`);
    return response;
  }

  // Mettre à jour les positions des navires
  async updateShipPositions(): Promise<{ message: string; updated_count: number }> {
    const response = await apiService.post<{ message: string; updated_count: number }>('/ships/positions/update/');
    return response;
  }

  // Obtenir les statistiques de navigation
  async getShippingStats(): Promise<ShippingStats> {
    const response = await apiService.get<ShippingStats>('/ships/stats/');
    return response;
  }

  // Obtenir les statistiques des ports
  async getPortStats(): Promise<any> {
    const response = await apiService.get<any>('/ships/ports/stats/');
    return response;
  }
}

export const shipService = new ShipService();
