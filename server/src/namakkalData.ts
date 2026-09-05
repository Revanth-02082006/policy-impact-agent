export interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'school' | 'police' | 'fire' | 'shelter' | 'market';
  location: string;
  lat: number;
  lng: number;
  criticality: 'high' | 'medium' | 'critical';
  servesZone: string;
}

export interface RoadAsset {
  id: string;
  name: string;
  type: 'bridge' | 'arterial' | 'connector' | 'highway';
  capacityVehiclesPerHour: number;
  coordinates: Array<[number, number]>;
  status: 'normal' | 'closed' | 'congested' | 'diverted';
}

export interface PopulationZone {
  id: string;
  name: string;
  population: number;
  vulnerabilityIndex: 'low' | 'moderate' | 'high';
  description: string;
}

export const NAMAKKAL_DATA = {
  cityName: "Namakkal, Tamil Nadu",
  disclaimer: "Demo Simulation Data — Namakkal",

  assets: [
    {
      id: "asset_riverside_bridge",
      name: "Riverside Bridge",
      type: "bridge",
      capacityVehiclesPerHour: 4500,
      coordinates: [[11.2176, 78.1659], [11.2201, 78.1690]],
      status: "normal"
    },
    {
      id: "asset_north_expressway",
      name: "North Expressway Viaduct",
      type: "bridge",
      capacityVehiclesPerHour: 6000,
      coordinates: [[11.2300, 78.1580], [11.2330, 78.1660]],
      status: "normal"
    },
    {
      id: "asset_old_town_bridge",
      name: "Old Town Arch Bridge",
      type: "bridge",
      capacityVehiclesPerHour: 2000,
      coordinates: [[11.2050, 78.1510], [11.2080, 78.1560]],
      status: "normal"
    },
    {
      id: "asset_east_connector",
      name: "East Connector Road",
      type: "connector",
      capacityVehiclesPerHour: 3000,
      coordinates: [[11.2158, 78.1725], [11.2230, 78.1760]],
      status: "normal"
    },
    {
      id: "asset_riverfront_blvd",
      name: "Riverfront Boulevard",
      type: "arterial",
      capacityVehiclesPerHour: 3800,
      coordinates: [[11.2120, 78.1630], [11.2180, 78.1640]],
      status: "normal"
    }
  ] as RoadAsset[],

  facilities: [
    {
      id: "fac_hosp_riverside",
      name: "Riverside General Hospital",
      type: "hospital",
      location: "Riverside East Bank",
      lat: 11.2211,
      lng: 78.1707,
      criticality: "critical",
      servesZone: "Zone B & Zone E"
    },
    {
      id: "fac_hosp_central",
      name: "Central Namakkal Hospital",
      type: "hospital",
      location: "City Center",
      lat: 11.2139,
      lng: 78.1611,
      criticality: "high",
      servesZone: "Zone A"
    },
    {
      id: "fac_hosp_north",
      name: "North Suburban Health Clinic",
      type: "hospital",
      location: "North Suburbs",
      lat: 11.2330,
      lng: 78.1620,
      criticality: "medium",
      servesZone: "Zone D"
    },
    {
      id: "fac_school_high",
      name: "Namakkal Model High School",
      type: "school",
      location: "Riverside West",
      lat: 11.2160,
      lng: 78.1650,
      criticality: "medium",
      servesZone: "Zone B"
    },
    {
      id: "fac_school_stjude",
      name: "St. Jude Academy",
      type: "school",
      location: "East Connector North",
      lat: 11.2240,
      lng: 78.1740,
      criticality: "medium",
      servesZone: "Zone C"
    },
    {
      id: "fac_police_central",
      name: "Central Police Precinct",
      type: "police",
      location: "Civic Plaza",
      lat: 11.2150,
      lng: 78.1630,
      criticality: "high",
      servesZone: "Zone A & Zone B"
    },
    {
      id: "fac_fire_stn1",
      name: "Namakkal Fire Station 1",
      type: "fire",
      location: "West Bank Promenade",
      lat: 11.2190,
      lng: 78.1620,
      criticality: "critical",
      servesZone: "Entire Riverside Corridor"
    },
    {
      id: "fac_shelter_main",
      name: "Namakkal Central Emergency Shelter",
      type: "shelter",
      location: "East District Complex",
      lat: 11.2260,
      lng: 78.1760,
      criticality: "high",
      servesZone: "Zone E & Zone C"
    }
  ] as Facility[],

  zones: [
    {
      id: "zone_a",
      name: "Zone A — Civic & Commercial Core",
      population: 85000,
      vulnerabilityIndex: "low",
      description: "Dense commercial high-rises and administrative offices."
    },
    {
      id: "zone_b",
      name: "Zone B — Riverside West Residential",
      population: 62000,
      vulnerabilityIndex: "moderate",
      description: "Medium-density residential neighborhood relying heavily on Riverside Bridge for east hospital access."
    },
    {
      id: "zone_c",
      name: "Zone C — East Industrial District",
      population: 45000,
      vulnerabilityIndex: "low",
      description: "Logistics, freight transport hubs, and manufacturing facilities."
    },
    {
      id: "zone_d",
      name: "Zone D — North Suburban Extension",
      population: 92000,
      vulnerabilityIndex: "low",
      description: "Residential suburbs with commuters heading south towards City Core."
    },
    {
      id: "zone_e",
      name: "Zone E — Riverside Vulnerable Settlement",
      population: 28000,
      vulnerabilityIndex: "high",
      description: "High-density vulnerable community reliant on public bus transport and local emergency coverage."
    }
  ] as PopulationZone[]
};
