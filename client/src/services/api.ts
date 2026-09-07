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

import { generateClientSimulation } from './simulationEngine.js';
import { tryClientGeminiSimulation } from './geminiClient.js';

export async function fetchHealth(): Promise<{ status: string; isLiveGeminiAvailable: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error('Health check non-200');
    return response.json();
  } catch {
    return { status: 'client_fallback', isLiveGeminiAvailable: false };
  }
}

export async function runSimulation(input: ScenarioInput): Promise<SimulationResult> {
  // 1. Try backend server
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(`${API_BASE}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (response.ok) {
      return await response.json();
    }
  } catch (err: any) {
    // Backend offline or static hosting
  }

  // 2. Try direct Gemini API in browser
  try {
    const geminiResult = await tryClientGeminiSimulation(input);
    if (geminiResult) {
      console.log('Successfully completed direct live Gemini simulation');
      return geminiResult;
    }
  } catch (e) {
    console.warn('Direct Gemini API simulation fallback:', e);
  }

  // 3. Resilient deterministic client-side V2 simulation engine
  return generateClientSimulation(input);
}

