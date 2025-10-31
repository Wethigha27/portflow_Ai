import { apiService } from './api';

export interface MSTVessel {
  name?: string;
  mmsi?: string;
  imo?: string;
  lat?: number;
  lon?: number;
  speed?: number;
  course?: number;
  destination?: string;
  eta?: string;
  type?: string;
}

class MSTService {
  async getVesselsInZone(bounds: { min_lat: number; min_lon: number; max_lat: number; max_lon: number }): Promise<MSTVessel[]> {
    const data = await apiService.get<any>(`/ships/mst/vessels-in-zone/`, { params: bounds });
    // Normaliser si besoin
    return (data?.vessels ?? data ?? []) as MSTVessel[];
  }

  async getVesselStatus(params: { mmsi?: string; imo?: string }): Promise<MSTVessel> {
    const data = await apiService.get<any>(`/ships/mst/vessel-status/`, { params });
    return data as MSTVessel;
  }

  async getVesselHistory(params: { mmsi?: string; imo?: string; days?: number }): Promise<any> {
    const data = await apiService.get<any>(`/ships/mst/vessel-history/`, { params });
    return data;
  }
}

export const mstService = new MSTService();



