import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Map, Satellite, Search, Layers, Navigation, ChevronDown, Check } from 'lucide-react';
import {
  TAMIL_NADU_DISTRICTS,
  DEFAULT_DISTRICT,
  DistrictHierarchy,
  LocationPlace,
  searchAllPlaces,
} from '../data/tamilNaduHierarchy.js';
import { getUniversalLocalitiesForDistrict } from '../data/tamilNaduLocalities.js';
import { InfrastructureAsset } from '../services/api.js';

interface TamilNaduMapProps {
  location?: string;
  district?: string;
  city?: string;
  town?: string;
  village?: string;
  selectedAsset?: string;
  latitude?: number;
  longitude?: number;
  affectedRadiusMeters?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  onPlaceSelect?: (place: { district: string; name: string; latitude: number; longitude: number; type: string }) => void;
  infrastructureAssets?: InfrastructureAsset[];
}

function AutoResizeMap() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    const t1 = setTimeout(handleResize, 100);
    const t2 = setTimeout(handleResize, 350);
    const t3 = setTimeout(handleResize, 750);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);
  return null;
}

function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.0,
      easeLinearity: 0.25,
    });
  }, [center[0], center[1], zoom, map]);
  return null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => onLocationSelect?.(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

function createPrecisionPinIcon() {
  return L.divIcon({
    className: 'custom-precision-pin-wrapper',
    html: `
      <div style="position: relative; width: 36px; height: 48px; pointer-events: auto;">
        <!-- Pulsing Ground Radar Target directly under the needle tip -->
        <div style="position: absolute; left: 18px; top: 48px; transform: translate(-50%, -50%); width: 32px; height: 32px; border-radius: 50%; background: rgba(30, 64, 175, 0.25); border: 2px solid #1d4ed8; animation: radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
        <div style="position: absolute; left: 18px; top: 48px; transform: translate(-50%, -50%); width: 10px; height: 10px; border-radius: 50%; background: #1e40af; box-shadow: 0 0 8px rgba(30, 64, 175, 0.9); pointer-events: none;"></div>

        <!-- Precision Teardrop Pin pointing straight down to (18px, 48px) -->
        <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45)); cursor: pointer;">
          <path d="M18 0C8.05887 0 0 8.05887 0 18C0 29.5 18 48 18 48C18 48 36 29.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="url(#precisionNavyGrad)" stroke="#ffffff" stroke-width="2"/>
          <circle cx="18" cy="18" r="8" fill="white"/>
          <circle cx="18" cy="18" r="4.5" fill="#1d4ed8"/>
          <defs>
            <linearGradient id="precisionNavyGrad" x1="18" y1="0" x2="18" y2="48" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3b82f6"/>
              <stop offset="1" stop-color="#1e40af"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -50],
  });
}

export const TamilNaduMap: React.FC<TamilNaduMapProps> = ({
  location,
  district = 'Namakkal',
  city,
  town,
  village,
  selectedAsset,
  latitude,
  longitude,
  affectedRadiusMeters = 2200,
  onLocationSelect,
  onPlaceSelect,
  infrastructureAssets = [],
}) => {
  const [basemap, setBasemap] = useState<'satellite' | 'osm' | 'voyager'>('satellite');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>(district);
  const [selectedCityOrTown, setSelectedCityOrTown] = useState<string>(city || town || '');
  const [selectedVillage, setSelectedVillage] = useState<string>(village || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync state with incoming props
  useEffect(() => {
    if (district) setSelectedDistrictName(district);
    if (city || town) setSelectedCityOrTown(city || town || '');
    if (village) setSelectedVillage(village || '');
  }, [district, city, town, village]);

  const currentDistrict = useMemo(() => {
    return (
      TAMIL_NADU_DISTRICTS.find((d) => d.district.toLowerCase() === selectedDistrictName.toLowerCase()) ||
      DEFAULT_DISTRICT
    );
  }, [selectedDistrictName]);

  // Derived ground center coordinate
  const center: [number, number] = useMemo(() => {
    if (latitude !== undefined && longitude !== undefined && Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return [latitude, longitude];
    }
    // Try matching selected village
    if (selectedVillage) {
      const v = currentDistrict.villages.find((vl) => vl.name === selectedVillage);
      if (v) return [v.latitude, v.longitude];
    }
    // Try matching selected city or town
    if (selectedCityOrTown) {
      const c = [...currentDistrict.cities, ...currentDistrict.towns].find((ct) => ct.name === selectedCityOrTown);
      if (c) return [c.latitude, c.longitude];
    }
    // Default to district centroid
    return [currentDistrict.latitude, currentDistrict.longitude];
  }, [latitude, longitude, selectedVillage, selectedCityOrTown, currentDistrict]);

  const zoomLevel = useMemo(() => {
    if (selectedVillage) return 15;
    if (selectedCityOrTown) return 14;
    return 11;
  }, [selectedVillage, selectedCityOrTown]);

  const activeLabel = useMemo(() => {
    return [selectedVillage, selectedCityOrTown, currentDistrict.district, 'Tamil Nadu'].filter(Boolean).join(', ');
  }, [selectedVillage, selectedCityOrTown, currentDistrict]);

  const handleDistrictChange = (dName: string) => {
    setSelectedDistrictName(dName);
    setSelectedCityOrTown('');
    setSelectedVillage('');
    const d = TAMIL_NADU_DISTRICTS.find((item) => item.district === dName) || DEFAULT_DISTRICT;
    onPlaceSelect?.({
      district: d.district,
      name: d.district,
      latitude: d.latitude,
      longitude: d.longitude,
      type: 'district',
    });
  };

  const handleCityTownChange = (placeName: string) => {
    setSelectedCityOrTown(placeName);
    setSelectedVillage('');
    const match = [...currentDistrict.cities, ...currentDistrict.towns].find((p) => p.name === placeName);
    if (match) {
      onPlaceSelect?.({
        district: currentDistrict.district,
        name: match.name,
        latitude: match.latitude,
        longitude: match.longitude,
        type: match.type,
      });
    }
  };

  const localityData = useMemo(() => {
    return getUniversalLocalitiesForDistrict(currentDistrict.district);
  }, [currentDistrict.district]);

  const handleVillageChange = (villageName: string) => {
    setSelectedVillage(villageName);
    if (!villageName.trim()) return;
    const match = currentDistrict.villages.find((v) => v.name.toLowerCase() === villageName.toLowerCase());
    onPlaceSelect?.({
      district: currentDistrict.district,
      name: match?.name || villageName,
      latitude: match?.latitude || currentDistrict.latitude,
      longitude: match?.longitude || currentDistrict.longitude,
      type: 'village',
    });
  };

  const searchResults = useMemo(() => searchAllPlaces(searchQuery), [searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Top Controls: Tamil Nadu District / City / Town / Village Hierarchy */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Navigation className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Tamil Nadu Policy Simulation Map
            </h3>
            <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              38 Districts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hierarchical geospatial navigation across Tamil Nadu. Automatic flyTo zoom and affected-area highlight.
          </p>
        </div>

        {/* Multi-Layer Basemap Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 shadow-2xs text-xs">
            <button
              type="button"
              onClick={() => setBasemap('satellite')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 font-bold transition-all ${
                basemap === 'satellite'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Satellite className="h-3.5 w-3.5" /> Satellite (Esri)
            </button>
            <button
              type="button"
              onClick={() => setBasemap('osm')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 font-bold transition-all ${
                basemap === 'osm'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="h-3.5 w-3.5" /> Streets (OSM)
            </button>
            <button
              type="button"
              onClick={() => setBasemap('voyager')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 font-bold transition-all ${
                basemap === 'voyager'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Voyager
            </button>
          </div>
        </div>
      </div>

      {/* Hierarchical Selection Bar: District → City/Town → Village + Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        {/* 1. District Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            1. District (38 in TN)
          </label>
          <select
            value={selectedDistrictName}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-1.5 px-2 text-xs font-semibold text-slate-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {TAMIL_NADU_DISTRICTS.map((d) => (
              <option key={d.district} value={d.district}>
                {d.district}
              </option>
            ))}
          </select>
        </div>

        {/* 2. City / Town Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            2. City / Town
          </label>
          <select
            value={selectedCityOrTown}
            onChange={(e) => handleCityTownChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-1.5 px-2 text-xs font-semibold text-slate-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- All / District Hub --</option>
            <optgroup label="Cities">
              {currentDistrict.cities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} (City)
                </option>
              ))}
            </optgroup>
            <optgroup label="Towns">
              {currentDistrict.towns.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} (Town)
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* 3. Village / Locality / Ward Selector */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            3. Village / Ward / Locality (Optional)
          </label>
          <select
            value={selectedVillage}
            onChange={(e) => handleVillageChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-1.5 px-2 text-xs font-semibold text-slate-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- All Localities / Whole Town --</option>
            {localityData.localities && localityData.localities.length > 0 && (
              <optgroup label="Localities & Neighborhoods">
                {localityData.localities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </optgroup>
            )}
            {localityData.wards && localityData.wards.length > 0 && (
              <optgroup label="Municipal / Corporation Wards">
                {localityData.wards.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </optgroup>
            )}
            {localityData.villages && localityData.villages.length > 0 && (
              <optgroup label="Revenue Villages & Habitations">
                {localityData.villages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <input
            type="text"
            placeholder="Or type custom Ward/Village..."
            value={selectedVillage}
            onChange={(e) => handleVillageChange(e.target.value)}
            className="w-full mt-1 rounded-md border border-slate-200 py-1 px-2 text-[11px] font-medium text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-blue-500"
          />
        </div>

        {/* 4. Instant Search Box */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Quick Search (Tamil Nadu)
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              placeholder="Search any town, dam..."
              className="w-full rounded-lg border border-slate-300 py-1.5 pl-8 pr-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 top-full z-[3000] mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                {searchResults.map((p) => (
                  <button
                    type="button"
                    key={`${p.name}-${p.district}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedDistrictName(p.district);
                      if (p.type === 'village') {
                        setSelectedVillage(p.name);
                      } else {
                        setSelectedCityOrTown(p.name);
                        setSelectedVillage('');
                      }
                      setSearchQuery(p.name);
                      setIsSearchOpen(false);
                      onPlaceSelect?.({
                        district: p.district,
                        name: p.name,
                        latitude: p.latitude,
                        longitude: p.longitude,
                        type: p.type,
                      });
                    }}
                    className="block w-full text-left px-3 py-1.5 rounded text-xs hover:bg-blue-50 hover:text-blue-900"
                  >
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">({p.district} • {p.type})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[440px] w-full rounded-xl overflow-hidden border border-slate-200 relative shadow-inner">
        <MapContainer center={center} zoom={zoomLevel} scrollWheelZoom={false} className="h-full w-full">
          <AutoResizeMap />
          <MapCenterUpdater center={center} zoom={zoomLevel} />
          <MapClickHandler onLocationSelect={onLocationSelect} />

          {/* Satellite Layer with transparent road and boundary labels */}
          {basemap === 'satellite' && (
            <>
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a> World Transportation and Places'
                opacity={0.95}
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </>
          )}

          {/* OSM Streets */}
          {basemap === 'osm' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {/* Carto Voyager */}
          {basemap === 'voyager' && (
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
          )}

          {/* AFFECTED AREA HIGHLIGHT: Dynamic Buffer Zone Circle */}
          <Circle
            center={center}
            radius={affectedRadiusMeters}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#3b82f6',
              fillOpacity: 0.18,
              weight: 2,
              dashArray: '6, 6',
            }}
          >
            <Tooltip permanent={false} direction="center">
              <span className="text-xs font-bold text-blue-900 bg-white px-2 py-1 rounded shadow">
                Impact Zone (~{(affectedRadiusMeters / 1000).toFixed(1)} km buffer)
              </span>
            </Tooltip>
          </Circle>

          {/* PRECISION TARGET MARKER */}
          <Marker position={center} icon={createPrecisionPinIcon()}>
            <Tooltip permanent direction="top" offset={[0, -48]}>
              <span className="font-bold text-xs text-blue-950 flex items-center gap-1 bg-white px-2 py-0.5 rounded shadow">
                <span>📍</span>
                <span>{selectedAsset || activeLabel}</span>
              </span>
            </Tooltip>
            <Popup>
              <div className="p-2 min-w-[220px] text-xs">
                <div className="border-b border-slate-100 pb-1 mb-1 font-bold text-blue-800 uppercase text-[10px]">
                  Simulated Policy Target Pin
                </div>
                <div className="font-extrabold text-slate-900 text-sm">{activeLabel}</div>
                <div className="mt-1 font-mono text-[11px] text-slate-600 bg-slate-50 p-1 rounded border border-slate-200">
                  Lat: {center[0].toFixed(5)}° N, Lon: {center[1].toFixed(5)}° E
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  Impact Radius Buffer: ~{(affectedRadiusMeters / 1000).toFixed(1)} km
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <a
                    href={`https://www.google.com/maps?q=${center[0]},${center[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Google Maps ↗
                  </a>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${center[0]}&mlon=${center[1]}#map=16/${center[0]}/${center[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    OpenStreetMap ↗
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Footer Info & Ground Truth Attribution */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-100 pt-2.5">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block shadow-xs"></span>
            <span className="font-bold text-slate-800">Target Asset Pin (📍)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full border border-dashed border-blue-600 bg-blue-200 inline-block"></span>
            <span>Affected Policy Impact Buffer</span>
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Center GPS: {center[0].toFixed(5)}° N, {center[1].toFixed(5)}° E ({currentDistrict.district}, TN)
        </div>
      </div>
    </div>
  );
};

export default TamilNaduMap;
