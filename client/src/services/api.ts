import { SimulationResult, ScenarioInput } from '../types/index.js';

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: string;
  category?: 'road' | 'bridge' | 'hospital' | 'school' | 'emergency' | 'transit' | 'commercial' | 'leisure' | 'civic';
  location: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
  source: 'verified_geographic_data';
}

export interface PopulationContext {
  settlementName: string;
  settlementType: string;
  corridorEstimatedPopulation: number;
  densityCategory: 'High Density Urban' | 'Moderate Density Corridor' | 'Suburban / Peripheral' | 'Semi-Rural / Ghat';
  district: string;
  state: string;
  parentCityPopulation?: number;
  affectedDemographicSummary: string;
}

export interface InfrastructureLookupResponse {
  center: { latitude: number; longitude: number };
  resolvedArea: string;
  assets: InfrastructureAsset[];
  populationContext?: PopulationContext;
  emergencyHospitals?: InfrastructureAsset[];
  schools?: InfrastructureAsset[];
  transitLinks?: InfrastructureAsset[];
  source: 'verified_geographic_data';
  warning?: string;
}

export interface GeocodeResult {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  district: string;
  area: string;
  source: 'verified_geographic_data';
}

const API_BASE = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '');

export async function fetchInfrastructure(
  latitude: number,
  longitude: number,
  district: string,
  area?: string,
  cityName?: string
): Promise<InfrastructureLookupResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    district,
    area: area || '',
    city: cityName || ''
  });
  const response = await fetch(`${API_BASE}/api/infrastructure?${params}`);
  if (!response.ok) throw new Error('Infrastructure lookup failed');
  return response.json();
}

export async function geocodeArea(
  query: string,
  district?: string,
  city?: string,
  latitude?: number,
  longitude?: number
): Promise<GeocodeResult> {
  const params = new URLSearchParams({
    query,
    district: district || '',
    city: city || '',
    latitude: latitude !== undefined ? String(latitude) : '',
    longitude: longitude !== undefined ? String(longitude) : ''
  });
  const response = await fetch(`${API_BASE}/api/geocode?${params}`);
  if (!response.ok) throw new Error('Geocoding lookup failed');
  return response.json();
}

export async function fetchHealth(): Promise<{ status: string; isLiveGeminiAvailable: boolean }> {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) throw new Error('Health check endpoint failed');
  return response.json();
}

export async function runSimulation(input: ScenarioInput): Promise<SimulationResult> {
  const response = await fetch(`${API_BASE}/api/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error(`Simulation failed with HTTP status ${response.status}`);
  return response.json();
}
