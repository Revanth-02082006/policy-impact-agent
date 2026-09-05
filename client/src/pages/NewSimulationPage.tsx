import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sliders, MapPin, Calendar, Wrench, ShieldCheck, Users, Navigation, Loader2 } from 'lucide-react';
import { ScenarioInput } from '../types/index.js';
import { DEFAULT_PLACE, searchPlaces } from '../data/tamilNaduPlaces.js';
import { getAreaOptions, getAreaSuggestions } from '../data/locationOptions.js';
import { fetchInfrastructure, geocodeArea, InfrastructureAsset, PopulationContext } from '../services/api.js';
import { NamakkalMap } from '../components/NamakkalMap.js';

interface NewSimulationPageProps {
  onSubmitSimulation: (input: ScenarioInput) => void;
  isSimulating: boolean;
}

export const NewSimulationPage: React.FC<NewSimulationPageProps> = ({ onSubmitSimulation, isSimulating }) => {
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [locationQuery, setLocationQuery] = useState(DEFAULT_PLACE.name);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(DEFAULT_PLACE);
  const [area, setArea] = useState(() => getAreaOptions(DEFAULT_PLACE)[0]?.name || '');
  const [customArea, setCustomArea] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [customAsset, setCustomAsset] = useState('');
  const [customAssetCoords, setCustomAssetCoords] = useState<{ latitude: number; longitude: number; label?: string } | null>(null);
  const [isGeocodingAsset, setIsGeocodingAsset] = useState(false);
  const [assetOptions, setAssetOptions] = useState<InfrastructureAsset[]>([]);
  const [populationContext, setPopulationContext] = useState<PopulationContext | null>(null);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetWarning, setAssetWarning] = useState('');
  const [duration, setDuration] = useState('');
  const [reason, setReason] = useState('');
  const [department, setDepartment] = useState('');
  const [constraints, setConstraints] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedAssetDetails = assetOptions.find((asset) => asset.name === selectedAsset);
  const areaOptions = getAreaOptions(selectedPlace);
  const selectedAreaOption = areaOptions.find((option) => option.name === area);
  const infrastructureLatitude = selectedAreaOption?.latitude || selectedPlace.latitude;
  const infrastructureLongitude = selectedAreaOption?.longitude || selectedPlace.longitude;

  // Derive precise asset coordinates for the map pin
  const activeAssetLatitude = selectedAsset === 'Other'
    ? (customAssetCoords?.latitude ?? infrastructureLatitude)
    : (selectedAssetDetails?.latitude ?? infrastructureLatitude);

  const activeAssetLongitude = selectedAsset === 'Other'
    ? (customAssetCoords?.longitude ?? infrastructureLongitude)
    : (selectedAssetDetails?.longitude ?? infrastructureLongitude);

  // Only display an asset label and target pin AFTER the user actually selects an infrastructure asset
  const hasSelectedAsset = selectedAsset === 'Other'
    ? Boolean(customAsset.trim())
    : Boolean(selectedAsset && selectedAsset.trim());

  const activeAssetLabel = selectedAsset === 'Other'
    ? customAsset.trim()
    : selectedAsset;

  useEffect(() => {
    let active = true;
    setIsLoadingAssets(true);
    setAssetWarning('');
    setSelectedAsset(''); // Reset selected asset so previous corridor's asset is not retained
    setCustomAssetCoords(null);

    fetchInfrastructure(
      infrastructureLatitude,
      infrastructureLongitude,
      selectedPlace.district,
      area,
      selectedPlace.name
    ).then((result) => {
      if (!active) return;
      setAssetOptions(result.assets);
      setPopulationContext(result.populationContext || null);
      setAssetWarning(result.warning || '');
      setIsLoadingAssets(false);
    }).catch((err) => {
      if (!active) return;
      console.warn('Infrastructure lookup error:', err);
      setIsLoadingAssets(false);
    });

    return () => { active = false; };
  }, [selectedPlace, area, infrastructureLatitude, infrastructureLongitude]);

  // Debounced geocoder for custom typed infrastructure assets
  useEffect(() => {
    if (selectedAsset !== 'Other' || !customAsset.trim()) {
      setCustomAssetCoords(null);
      return;
    }

    const query = customAsset.trim();
    if (query.length < 2) return;

    // Fast local lookup in loaded assets for this corridor
    const localMatch = assetOptions.find((a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(a.name.toLowerCase())
    );
    if (localMatch) {
      setCustomAssetCoords({
        latitude: localMatch.latitude,
        longitude: localMatch.longitude,
        label: localMatch.name
      });
      return;
    }

    let active = true;
    setIsGeocodingAsset(true);
    const timer = setTimeout(() => {
      geocodeArea(
        query,
        selectedPlace.district,
        selectedPlace.name,
        infrastructureLatitude,
        infrastructureLongitude
      ).then((res) => {
        if (!active) return;
        setCustomAssetCoords({
          latitude: res.latitude,
          longitude: res.longitude,
          label: res.displayName || res.name
        });
        setIsGeocodingAsset(false);
      }).catch((err) => {
        if (!active) return;
        console.warn('Custom asset geocode lookup warning:', err);
        setIsGeocodingAsset(false);
      });
    }, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selectedAsset, customAsset, assetOptions, selectedPlace, infrastructureLatitude, infrastructureLongitude]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const finalArea = area === 'Other' ? customArea : area;
    const finalAsset = selectedAsset === 'Other' ? customAsset : selectedAsset;
    const location = [finalArea.trim(), selectedPlace.name, selectedPlace.district, 'Tamil Nadu'].filter(Boolean).join(', ');
    const finalLat = activeAssetLatitude;
    const finalLon = activeAssetLongitude;

    onSubmitSimulation({
      description,
      location,
      district: selectedPlace.district,
      area: finalArea,
      locationName: selectedPlace.name,
      latitude: finalLat,
      longitude: finalLon,
      selectedAsset: finalAsset || undefined,
      selectedAssetId: selectedAssetDetails?.id,
      selectedAssetSource: selectedAssetDetails?.source || 'verified_geographic_data',
      duration,
      reason,
      department,
      constraints
    });

    navigate('/analysis');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-200">
            Natural Language Decision Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">New Policy Impact Simulation</h1>
        <p className="text-sm text-slate-600 mt-1">
          Describe a blocked or damaged infrastructure asset in plain English to assess how nearby people and essential services will be affected.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tamil Nadu Location Context */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Simulation Location & Real Geographic Corridor</h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded flex items-center gap-1">
              <Navigation className="h-3 w-3" /> Real-life Geographic Assets
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. City / District Search */}
            <div className="relative z-[1000]">
              <label htmlFor="location-search" className="block text-xs font-semibold text-slate-700 mb-1">Search city, town, or district</label>
              <input
                id="location-search"
                value={locationQuery}
                onFocus={() => setIsLocationMenuOpen(true)}
                onBlur={() => setTimeout(() => setIsLocationMenuOpen(false), 150)}
                onChange={(e) => { setLocationQuery(e.target.value); setIsLocationMenuOpen(true); }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Mettupalayam"
              />
              {isLocationMenuOpen && locationQuery.trim() && searchPlaces(locationQuery).length > 0 && (
                <div className="absolute left-0 top-full z-[1100] mt-1 w-full">
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                    {searchPlaces(locationQuery).slice(0, 8).map((place) => (
                      <button
                        type="button"
                        key={`${place.name}-${place.district}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setSelectedPlace(place);
                          setLocationQuery(place.name);
                          setArea(getAreaSuggestions(place)[0]);
                          setCustomArea('');
                          setIsLocationMenuOpen(false);
                        }}
                        className="block w-full rounded px-3 py-2 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <span className="font-semibold">{place.name}</span> <span className="text-slate-500">({place.district})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Specific Area / Corridor */}
            <div>
              <label htmlFor="area" className="block text-xs font-semibold text-slate-700 mb-1">Specific Area / Corridor</label>
              <select
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                {areaOptions.map((option) => (
                  <option key={option.name} value={option.name}>{option.name}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              {area === 'Other' && (
                <input
                  type="text"
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Specify area or location"
                  required
                />
              )}
            </div>

            {/* 3. Nearby Infrastructure Asset */}
            <div>
              <label htmlFor="selected-asset" className="block text-xs font-semibold text-slate-700 mb-1">Nearby Infrastructure Asset</label>
              <select
                id="selected-asset"
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="">No specific asset (Assess entire corridor)</option>
                {isLoadingAssets && <option value="" disabled>Loading nearby real assets...</option>}
                {!isLoadingAssets && assetOptions.map((asset) => (
                  <option key={asset.id} value={asset.name}>
                    {asset.name} ({asset.type} • {asset.distanceMeters !== undefined ? `${asset.distanceMeters}m away` : ''})
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {selectedAsset === 'Other' && (
                <div className="mt-2 space-y-1">
                  <input
                    type="text"
                    value={customAsset}
                    onChange={(e) => setCustomAsset(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Type asset name (e.g. Border Rahmath, Hospital, School)"
                    required
                  />
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {isGeocodingAsset ? (
                      <span className="text-blue-600 flex items-center gap-1 font-semibold">
                        <Loader2 className="h-3 w-3 animate-spin" /> Locating asset coordinates on map...
                      </span>
                    ) : customAssetCoords ? (
                      <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        Pin targeted to: {customAssetCoords.label || customAsset} ({activeAssetLatitude.toFixed(4)}, {activeAssetLongitude.toFixed(4)})
                      </span>
                    ) : customAsset.trim().length > 0 ? (
                      <span className="text-slate-500">
                        Pin default to corridor center. Click map or type to refine.
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Type asset name or click anywhere on the map below to place the pin.
                      </span>
                    )}
                  </div>
                </div>
              )}
              <p className="mt-1 text-[10px] text-slate-500">
                {assetWarning || `${assetOptions.length} real-life geographic assets found within 1.5km of ${area}.`}
              </p>
            </div>
          </div>

          {/* Selected Asset Details Box */}
          {selectedAssetDetails && (
            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{selectedAssetDetails.name}</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                  {selectedAssetDetails.distanceMeters !== undefined ? `${selectedAssetDetails.distanceMeters}m from corridor centre` : 'Local Asset'}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600">
                {selectedAssetDetails.type} • Coordinates: {selectedAssetDetails.latitude.toFixed(5)}, {selectedAssetDetails.longitude.toFixed(5)} • Source: OpenStreetMap Verified Geographic Data
              </div>
            </div>
          )}

          {/* Real Population & Demographic Context Banner */}
          {populationContext && (
            <div className="mt-3 p-3 rounded-lg bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold flex items-center gap-1.5 text-blue-950">
                  <Users className="h-4 w-4 text-blue-700" />
                  Real-Life Corridor Population: ~{populationContext.corridorEstimatedPopulation.toLocaleString()} residents
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 text-[10px] font-bold">
                  {populationContext.densityCategory}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                {populationContext.affectedDemographicSummary}
              </p>
            </div>
          )}

          <p className="text-[11px] text-slate-500 mt-3">
            Selected corridor: <span className="font-semibold text-slate-700">{[area.trim(), selectedPlace.name, selectedPlace.district, 'Tamil Nadu'].filter(Boolean).join(', ')}</span>
            <span className="text-slate-400 ml-2">({infrastructureLatitude.toFixed(4)}, {infrastructureLongitude.toFixed(4)})</span>
          </p>

          {/* Real-time Asset Spatial Map Preview */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-extrabold text-slate-900">
                  Target Infrastructure Asset — Spatial Location Pin:
                </span>
              </div>
              {hasSelectedAsset ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <span>📍</span>
                  <span>{activeAssetLabel}</span>
                  <span className="text-[10px] text-emerald-600 font-mono">({activeAssetLatitude.toFixed(4)}, {activeAssetLongitude.toFixed(4)})</span>
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  Select an infrastructure asset above to display location pin
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              {hasSelectedAsset
                ? `The green pin (📍) is pointing directly to ${activeAssetLabel}. Real-world road, town, and place names remain visible below.`
                : 'Labels for places, cities, towns, and road names stay intact. Select a nearby infrastructure asset from the dropdown above to pinpoint it on the map.'}
            </p>
            <NamakkalMap
              location={area === 'Other' ? customArea : area}
              district={selectedPlace.district}
              locationName={selectedPlace.name}
              selectedAsset={hasSelectedAsset ? activeAssetLabel : undefined}
              latitude={hasSelectedAsset ? activeAssetLatitude : infrastructureLatitude}
              longitude={hasSelectedAsset ? activeAssetLongitude : infrastructureLongitude}
              infrastructureAssets={[]}
              onLocationSelect={(lat, lng) => {
                if (selectedAsset !== 'Other') {
                  setSelectedAsset('Other');
                  setCustomAsset(selectedAssetDetails?.name || 'Pinned Asset Location');
                }
                setCustomAssetCoords({
                  latitude: lat,
                  longitude: lng,
                  label: `Pinned Coordinate (${lat.toFixed(4)}, ${lng.toFixed(4)})`
                });
              }}
            />
          </div>
        </div>

        {/* Main Text Area Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="description" className="block text-sm font-bold text-slate-900">
              Proposed Infrastructure Decision <span className="text-rose-600">*</span>
            </label>
          </div>

          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Close Black Thunder Road for 15 days for essential culvert reconstruction and pipeline laying."
            className="w-full rounded-lg border border-slate-300 p-4 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base leading-relaxed font-medium shadow-inner"
            required
          />

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Natural language decision input is analyzed autonomously across 4 domain agents with real geographic grounding</span>
            <span className="font-mono text-[11px] text-slate-400">{description.length} characters</span>
          </div>
        </div>

        {/* Optional Advanced Parameters Toggle */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Optional Context Parameters</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              {showAdvanced ? 'Hide Fields' : 'Show Fields'}
            </button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>Target Location / Corridor</span>
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Proposed Duration</span>
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 15 days"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Wrench className="h-3.5 w-3.5 text-slate-400" />
                  <span>Stated Reason</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Drainage culvert strengthening before monsoon"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>Key Policy Constraint</span>
                </label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Maintain tourist transit access to Nilgiris ghat road"
                />
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="submit"
            disabled={isSimulating || !description.trim()}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 transform active:scale-95"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>{isSimulating ? 'Running Multi-Agent Simulation...' : 'Run Impact Simulation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
