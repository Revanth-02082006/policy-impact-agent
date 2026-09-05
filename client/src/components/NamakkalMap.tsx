import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Map, Satellite, Search } from 'lucide-react';
import { DEFAULT_PLACE, findPlace, searchPlaces, TamilNaduPlace } from '../data/tamilNaduPlaces.js';
import { fetchInfrastructure, InfrastructureAsset } from '../services/api.js';

interface NamakkalMapProps {
  location?: string;
  district?: string;
  locationName?: string;
  selectedAsset?: string;
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (latitude: number, longitude: number) => void;
  onPlaceSelect?: (place: TamilNaduPlace) => void;
  infrastructureAssets?: InfrastructureAsset[];
  infrastructureSource?: InfrastructureAsset['source'];
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
      duration: 0.75,
      easeLinearity: 0.25
    });
  }, [center[0], center[1], zoom, map]);
  return null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click: (event) => onLocationSelect?.(event.latlng.lat, event.latlng.lng)
  });
  return null;
}

/**
 * Precision Teardrop SVG Pin Marker
 * The needle tip sits at [18, 48] and anchors directly on the exact ground coordinate down to the pixel.
 * Accompanied by a pulsing ground radar target ring centered on the ground point.
 */
function createPrecisionPinIcon() {
  return L.divIcon({
    className: 'custom-precision-pin-wrapper',
    html: `
      <div style="position: relative; width: 36px; height: 48px; pointer-events: auto;">
        <!-- Pulsing Ground Radar Target directly under the needle tip -->
        <div style="position: absolute; left: 18px; top: 48px; transform: translate(-50%, -50%); width: 28px; height: 28px; border-radius: 50%; background: rgba(5, 150, 105, 0.25); border: 2px solid #059669; animation: radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
        <div style="position: absolute; left: 18px; top: 48px; transform: translate(-50%, -50%); width: 8px; height: 8px; border-radius: 50%; background: #047857; box-shadow: 0 0 6px rgba(4, 120, 87, 0.9); pointer-events: none;"></div>

        <!-- Precision Teardrop Pin pointing straight down to (18px, 48px) -->
        <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45)); cursor: pointer;">
          <path d="M18 0C8.05887 0 0 8.05887 0 18C0 29.5 18 48 18 48C18 48 36 29.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="url(#precisionGreenGrad)" stroke="#ffffff" stroke-width="2"/>
          <circle cx="18" cy="18" r="8" fill="white"/>
          <circle cx="18" cy="18" r="4.5" fill="#047857"/>
          <defs>
            <linearGradient id="precisionGreenGrad" x1="18" y1="0" x2="18" y2="48" gradientUnits="userSpaceOnUse">
              <stop stop-color="#10b981"/>
              <stop offset="1" stop-color="#047857"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 48], // Exactly at the needle tip!
    popupAnchor: [0, -50]
  });
}

function createInfrastructureIcon(type: string, category?: string) {
  const normalized = `${type} ${category || ''}`.toLowerCase();
  let color = '#334155';
  let symbol = '•';

  if (normalized.includes('hospital') || normalized.includes('health') || normalized.includes('clinic')) {
    color = '#e11d48'; // Red
    symbol = 'H';
  } else if (normalized.includes('school') || normalized.includes('college') || normalized.includes('education')) {
    color = '#7c3aed'; // Purple
    symbol = 'S';
  } else if (normalized.includes('police') || normalized.includes('emergency') || normalized.includes('fire')) {
    color = '#ea580c'; // Orange
    symbol = 'P';
  } else if (normalized.includes('bridge')) {
    color = '#0284c7'; // Sky Blue
    symbol = 'B';
  } else if (normalized.includes('leisure') || normalized.includes('water') || normalized.includes('park') || normalized.includes('theme')) {
    color = '#059669'; // Emerald Green
    symbol = 'L';
  } else if (normalized.includes('transit') || normalized.includes('railway') || normalized.includes('bus') || normalized.includes('charging')) {
    color = '#4f46e5'; // Indigo
    symbol = 'T';
  } else if (normalized.includes('commercial') || normalized.includes('food') || normalized.includes('hotel') || normalized.includes('bank')) {
    color = '#d97706'; // Amber
    symbol = 'C';
  } else if (normalized.includes('road') || normalized.includes('highway')) {
    color = '#2563eb'; // Blue
    symbol = 'R';
  }

  return L.divIcon({
    className: 'infrastructure-map-marker',
    html: `<div style="background-color: ${color}; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 2px solid white; box-shadow: 0 1px 5px rgba(0,0,0,0.35);">${symbol}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

export const NamakkalMap: React.FC<NamakkalMapProps> = ({
  location,
  district,
  locationName,
  selectedAsset,
  latitude,
  longitude,
  onLocationSelect,
  onPlaceSelect,
  infrastructureAssets: providedInfrastructureAssets
}) => {
  // Default to 'osm' (OpenStreetMap Standard) for maximum ground-truth road, town, and landmark clarity
  const [basemap, setBasemap] = useState<'osm' | 'voyager' | 'satellite'>('osm');
  const initialPlace = (locationName && findPlace(locationName, district)) || DEFAULT_PLACE;
  const [searchText, setSearchText] = useState(locationName || initialPlace.name);
  const [isMapSearchOpen, setIsMapSearchOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<TamilNaduPlace>(initialPlace);

  const activePlace = latitude !== undefined && longitude !== undefined
    ? { ...selectedPlace, name: locationName || selectedPlace.name, district: district || selectedPlace.district, latitude, longitude }
    : selectedPlace;

  useEffect(() => {
    if (locationName) setSearchText(locationName);
    if (locationName && district) {
      const place = findPlace(locationName, district);
      if (place) setSelectedPlace(place);
    }
  }, [locationName, district]);

  const center = useMemo<[number, number]>(() => [activePlace.latitude, activePlace.longitude], [activePlace.latitude, activePlace.longitude]);
  const [fetchedInfrastructureAssets, setFetchedInfrastructureAssets] = useState<InfrastructureAsset[]>([]);
  const infrastructureAssets = providedInfrastructureAssets || fetchedInfrastructureAssets;

  useEffect(() => {
    let active = true;
    if (!providedInfrastructureAssets) {
      fetchInfrastructure(
        activePlace.latitude,
        activePlace.longitude,
        activePlace.district,
        location || locationName,
        activePlace.name
      ).then((result) => {
        if (active) {
          setFetchedInfrastructureAssets(result.assets);
        }
      }).catch((err) => {
        console.warn('Map infrastructure lookup error:', err);
      });
    }
    return () => { active = false; };
  }, [activePlace.latitude, activePlace.longitude, activePlace.district, location, locationName, providedInfrastructureAssets]);

  // Street-level zoom 17 when an infrastructure asset is selected so building and gate are clear
  // Corridor overview zoom 14 when only area is chosen
  const hasSelectedAsset = Boolean(selectedAsset && selectedAsset.trim() !== '');
  const zoomLevel = hasSelectedAsset && latitude !== undefined && longitude !== undefined ? 17 : 14;
  const targetLabel = hasSelectedAsset ? selectedAsset : (location || `${activePlace.name}, ${activePlace.district}`);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              {hasSelectedAsset ? `${selectedAsset} — Spatial Map` : `${location || activePlace.name} — Spatial Overview`}
            </h3>
            {hasSelectedAsset ? (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300 flex items-center gap-1">
                <span>📍</span> Exact Ground-Truth Pin
              </span>
            ) : (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium border border-slate-200">
                Corridor Overview
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {hasSelectedAsset
              ? `The precision pin points directly to the ground location of ${selectedAsset} on real Tamil Nadu roads.`
              : 'Labels for places, cities, towns, and road names stay intact. Select an infrastructure asset above to place the precision pin.'}
          </p>
        </div>
      </div>

      <div className="relative z-[2000] flex flex-wrap items-center justify-between gap-3 mb-4">
        <div
          className="flex items-center gap-2"
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            const match = searchPlaces(searchText)[0];
            if (match) {
              setSelectedPlace(match);
              setSearchText(match.name);
              setIsMapSearchOpen(false);
              onPlaceSelect?.(match);
            }
          }}
        >
          <div className="relative z-[3000]">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <input
              value={searchText}
              onFocus={() => setIsMapSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsMapSearchOpen(false), 150)}
              onChange={(event) => { setSearchText(event.target.value); setIsMapSearchOpen(true); }}
              aria-label="Search Tamil Nadu city or town"
              placeholder="Search city or town"
              className="w-52 rounded-lg border border-slate-300 py-1.5 pl-8 pr-2 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {isMapSearchOpen && searchText.trim() && searchPlaces(searchText).length > 0 && (
              <div className="absolute left-0 top-full z-[4000] mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                {searchPlaces(searchText).slice(0, 8).map((place) => (
                  <button
                    type="button"
                    key={`${place.name}-${place.district}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setSelectedPlace(place);
                      setSearchText(place.name);
                      setIsMapSearchOpen(false);
                      onPlaceSelect?.(place);
                    }}
                    className="block w-full rounded px-3 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span className="font-semibold">{place.name}</span> <span className="text-slate-500">({place.district})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              const match = searchPlaces(searchText)[0];
              if (match) {
                setSelectedPlace(match);
                setSearchText(match.name);
                setIsMapSearchOpen(false);
                onPlaceSelect?.(match);
              }
            }}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs"
          >
            Go
          </button>
        </div>

        {/* Multi-layer Basemap Switcher */}
        <div className="flex items-center gap-2 text-xs">
          {hasSelectedAsset && (
            <span className="font-semibold text-slate-600 hidden sm:inline">
              Target: <span className="text-emerald-800 font-bold">{selectedAsset}</span>
            </span>
          )}
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 shadow-2xs">
            <button
              type="button"
              onClick={() => setBasemap('osm')}
              title="OpenStreetMap Standard: Highest ground-truth detail for street names, highway numbers, and public buildings"
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold transition-all ${basemap === 'osm' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Map className="h-3.5 w-3.5" /> OSM Streets
            </button>
            <button
              type="button"
              onClick={() => setBasemap('voyager')}
              title="Carto Voyager: High-contrast modern vector street cartography"
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold transition-all ${basemap === 'voyager' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Voyager
            </button>
            <button
              type="button"
              onClick={() => setBasemap('satellite')}
              title="Esri Satellite: Real-world high-resolution satellite imagery with highway and street overlays"
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold transition-all ${basemap === 'satellite' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Satellite className="h-3.5 w-3.5" /> Satellite
            </button>
          </div>
        </div>
      </div>

      <div className="h-[430px] w-full rounded-xl overflow-hidden border border-slate-200 relative shadow-inner">
        <MapContainer center={center} zoom={zoomLevel} scrollWheelZoom={false} className="h-full w-full">
          <AutoResizeMap />
          <MapCenterUpdater center={center} zoom={zoomLevel} />
          <MapClickHandler onLocationSelect={onLocationSelect} />
          
          {basemap === 'osm' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {basemap === 'voyager' && (
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
          )}

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

          {/* Primary Target Location Pin: ONLY rendered after selecting an infrastructure asset */}
          {hasSelectedAsset && (
            <Marker position={center} icon={createPrecisionPinIcon()}>
              <Tooltip permanent direction="top" offset={[0, -48]} className="asset-map-label">
                <span className="font-extrabold text-xs text-white flex items-center gap-1 tracking-wide">
                  <span>📍</span>
                  <span>{selectedAsset}</span>
                </span>
              </Tooltip>
              <Popup>
                <div className="p-2.5 min-w-[240px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1.5">
                    <span className="font-extrabold text-emerald-800 text-[10px] uppercase tracking-wider">
                      Ground-Truth Asset Pin
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                      Verified GPS
                    </span>
                  </div>
                  <span className="text-sm text-slate-900 font-black block leading-tight">
                    {selectedAsset}
                  </span>
                  <div className="mt-2 p-1.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-mono space-y-0.5">
                    <div>Lat: <span className="font-bold text-slate-900">{center[0].toFixed(6)}° N</span></div>
                    <div>Lon: <span className="font-bold text-slate-900">{center[1].toFixed(6)}° E</span></div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <a
                      href={`https://www.google.com/maps?q=${center[0]},${center[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-bold underline"
                    >
                      Google Maps ↗
                    </a>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${center[0]}&mlon=${center[1]}#map=18/${center[0]}/${center[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-bold underline"
                    >
                      OpenStreetMap ↗
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Surrounding mapped geographic assets (NO floating labels; road, town & city labels stay intact) */}
          {infrastructureAssets
            .filter((asset) => {
              // Avoid rendering a duplicate icon directly underneath the large green target pin
              const distToCenter = Math.hypot(asset.latitude - center[0], asset.longitude - center[1]);
              return distToCenter > 0.00015;
            })
            .map((asset) => (
              <Marker
                key={asset.id}
                position={[asset.latitude, asset.longitude]}
                icon={createInfrastructureIcon(asset.type, asset.category)}
              >
                {/* No permanent tooltip: keeps road, city, town, and place labels completely unobstructed */}
                <Popup>
                  <div className="p-1.5 min-w-[160px]">
                    <span className="font-bold text-slate-900 text-xs block">{asset.name}</span>
                    <span className="text-[11px] text-blue-700 font-medium block mt-0.5">{asset.type}</span>
                    <span className="text-[10px] text-slate-600 block mt-0.5">
                      Proximity: {asset.distanceMeters !== undefined ? `${asset.distanceMeters}m from target` : 'In proximity'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {asset.latitude.toFixed(6)}, {asset.longitude.toFixed(6)}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <p className="text-[11px] font-semibold text-slate-600">
          {infrastructureAssets.length > 0
            ? `${infrastructureAssets.length} nearby real-life geographic assets mapped around ${targetLabel}.`
            : 'Querying real geographic assets around target asset...'}
        </p>
        <div className="flex items-center gap-3 text-[11px]">
          <a
            href={`https://www.google.com/maps?q=${center[0]},${center[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-semibold"
          >
            Verify on Google Maps ↗
          </a>
          <span className="text-slate-300">•</span>
          <a
            href={`https://www.openstreetmap.org/?mlat=${center[0]}&mlon=${center[1]}#map=18/${center[0]}/${center[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:underline font-semibold"
          >
            Verify on OpenStreetMap ↗
          </a>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 px-1 border-t border-slate-100 pt-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center space-x-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600 inline-block shadow-xs"></span><span className="font-extrabold text-emerald-800">Target Pin (📍)</span></span>
          <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded-full bg-rose-600 inline-block"></span><span>Hospitals (H)</span></span>
          <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded-full bg-purple-600 inline-block"></span><span>Schools (S)</span></span>
          <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded-full bg-indigo-600 inline-block"></span><span>Transit (T)</span></span>
          <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded-full bg-sky-600 inline-block"></span><span>Bridges (B)</span></span>
          <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded-full bg-amber-600 inline-block"></span><span>Commercial (C)</span></span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          Pin Ground GPS: {center[0].toFixed(6)}° N, {center[1].toFixed(6)}° E
        </span>
      </div>
    </div>
  );
};

