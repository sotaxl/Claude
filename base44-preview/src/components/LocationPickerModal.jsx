import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { POPULAR_CITIES, LOCAL_BUSINESSES } from '@/data/localBusinessData';

/* ── city metadata (coords + stats) ──────────────────────────────────────── */
const CITY_META = {
  'london':      { lat: 51.5074,  lng: -0.1278,   zoom: 11, pop: '9.6M',  region: 'Europe',       timezone: 'GMT',   tagline: 'Most AI-active city in Europe' },
  'manchester':  { lat: 53.4808,  lng: -2.2426,   zoom: 12, pop: '2.8M',  region: 'UK North',     timezone: 'GMT',   tagline: 'Northern UK\'s fastest-growing hub' },
  'birmingham':  { lat: 52.4862,  lng: -1.8904,   zoom: 12, pop: '1.1M',  region: 'UK Midlands',  timezone: 'GMT',   tagline: 'Midlands AI adoption leader' },
  'new-york':    { lat: 40.7128,  lng: -74.006,   zoom: 11, pop: '8.3M',  region: 'East Coast',   timezone: 'EST',   tagline: '#1 US city for local AI adoption' },
  'los-angeles': { lat: 34.0522,  lng: -118.2437, zoom: 11, pop: '4M',    region: 'West Coast',   timezone: 'PST',   tagline: 'Creative industries AI pioneer' },
  'chicago':     { lat: 41.8781,  lng: -87.6298,  zoom: 11, pop: '2.7M',  region: 'Midwest',      timezone: 'CST',   tagline: 'Midwest\'s top AI business city' },
  'miami':       { lat: 25.7617,  lng: -80.1918,  zoom: 12, pop: '470K',  region: 'Southeast US', timezone: 'EST',   tagline: 'Fastest-growing AI city in FL' },
  'sydney':      { lat: -33.8688, lng: 151.2093,  zoom: 12, pop: '5.3M',  region: 'ANZ',          timezone: 'AEST',  tagline: 'Australia\'s AI business capital' },
  'melbourne':   { lat: -37.8136, lng: 144.9631,  zoom: 12, pop: '5.1M',  region: 'ANZ',          timezone: 'AEST',  tagline: 'Victoria\'s local AI leader' },
  'toronto':     { lat: 43.6532,  lng: -79.3832,  zoom: 12, pop: '2.9M',  region: 'Canada',       timezone: 'EST',   tagline: 'Canada\'s #1 AI adoption city' },
  'dubai':       { lat: 25.2048,  lng: 55.2708,   zoom: 12, pop: '3.5M',  region: 'Middle East',  timezone: 'GST',   tagline: 'Fastest-growing in MENA region' },
  'singapore':   { lat: 1.3521,   lng: 103.8198,  zoom: 13, pop: '5.9M',  region: 'Southeast Asia', timezone: 'SGT', tagline: 'Asia\'s most AI-enabled city' },
};

/* ── haversine distance (km) ─────────────────────────────────────────────── */
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371, toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km) {
  return km < 100 ? `${Math.round(km)} km away` : `${Math.round(km / 100) / 10}k km away`;
}

/* ── map fly-to controller ───────────────────────────────────────────────── */
function MapController({ target }) {
  const map = useMap();
  const prevTarget = useRef(null);
  useEffect(() => {
    if (!target) return;
    const meta = CITY_META[target.region];
    if (!meta) return;
    if (prevTarget.current === target.region) return;
    prevTarget.current = target.region;
    map.flyTo([meta.lat, meta.lng], meta.zoom, { duration: 1.6, easeLinearity: 0.2 });
  }, [target, map]);
  return null;
}

/* ── custom pin icon ─────────────────────────────────────────────────────── */
const PIN_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:22px;height:22px;border-radius:50% 50% 50% 0;
    background:#10b981;border:3px solid white;
    transform:rotate(-45deg);
    box-shadow:0 2px 8px rgba(16,185,129,.6),0 0 0 4px rgba(16,185,129,.25);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

/* ── main component ──────────────────────────────────────────────────────── */
export default function LocationPickerModal({ onSelect, onClose }) {
  const [query,       setQuery]       = useState('');
  const [preview,     setPreview]     = useState(POPULAR_CITIES[0]);  // city shown on map
  const [locating,    setLocating]    = useState(false);
  const [userCoords,  setUserCoords]  = useState(null);     // { lat, lng }
  const [nearbyCities, setNearbyCities] = useState([]);
  const inputRef = useRef(null);

  /* focus input on mount */
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* filter cities for search */
  const filtered = query.trim()
    ? POPULAR_CITIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase())
      )
    : POPULAR_CITIES;

  /* geolocation handler */
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setLocating(false);
        setUserCoords({ lat, lng });

        // Sort all cities by distance from user
        const sorted = POPULAR_CITIES
          .map(c => {
            const meta = CITY_META[c.region];
            return meta ? { ...c, dist: distKm(lat, lng, meta.lat, meta.lng) } : null;
          })
          .filter(Boolean)
          .sort((a, b) => a.dist - b.dist);

        setNearbyCities(sorted.slice(0, 4));

        // Auto-preview closest city
        if (sorted[0]) setPreview(sorted[0]);
      },
      () => setLocating(false)
    );
  }, []);

  /* stats for the previewed city */
  const previewMeta  = preview ? CITY_META[preview.region] : null;
  const bizCount     = preview ? (LOCAL_BUSINESSES[preview.region] || []).length : 0;
  const bizExamples  = preview ? (LOCAL_BUSINESSES[preview.region] || []).slice(0, 2) : [];
  const startCoords  = previewMeta ? [previewMeta.lat, previewMeta.lng] : [20, 0];
  const startZoom    = previewMeta ? Math.max(previewMeta.zoom - 3, 3) : 3;

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center',
               background:'rgba(0,0,0,0.55)', backdropFilter:'blur(10px)', padding:16 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'100%', maxWidth:560,
          background:'#0f172a',
          borderRadius:24,
          border:'1px solid rgba(255,255,255,0.08)',
          boxShadow:'0 32px 80px rgba(0,0,0,0.6)',
          overflow:'hidden',
          display:'flex', flexDirection:'column',
          maxHeight:'90vh',
        }}
      >
        {/* ── MAP HERO ─────────────────────────────────────────────────── */}
        <div style={{ position:'relative', height:260, flexShrink:0, background:'#020b18' }}>

          {/* Leaflet satellite map */}
          <MapContainer
            center={startCoords}
            zoom={startZoom}
            zoomControl={false}
            attributionControl={false}
            style={{ width:'100%', height:'100%' }}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
            {previewMeta && (
              <Marker position={[previewMeta.lat, previewMeta.lng]} icon={PIN_ICON} />
            )}
            <MapController target={preview} />
          </MapContainer>

          {/* Dark vignette overlay */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none',
            background:'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 55%, rgba(15,23,42,0.9) 100%)' }}
          />

          {/* Close button */}
          <button onClick={onClose} style={{
            position:'absolute', top:14, right:14, zIndex:10,
            width:30, height:30, borderRadius:'50%',
            background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.15)',
            color:'white', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center',
          }}>✕</button>

          {/* City info overlay (bottom of map) */}
          {preview && previewMeta && (
            <div style={{ position:'absolute', bottom:14, left:16, right:16, zIndex:10, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:22 }}>{preview.flag}</span>
                  <span style={{ fontSize:20, fontWeight:800, color:'white', letterSpacing:'-0.5px',
                    textShadow:'0 2px 12px rgba(0,0,0,0.8)' }}>{preview.name}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:'#34d399', background:'rgba(16,185,129,0.2)',
                    border:'1px solid rgba(52,211,153,0.35)', borderRadius:20, padding:'2px 8px' }}>
                    {previewMeta.region}
                  </span>
                </div>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.55)', margin:0,
                  textShadow:'0 1px 4px rgba(0,0,0,0.9)' }}>{previewMeta.tagline}</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                <div style={{ display:'flex', gap:6 }}>
                  <Chip label={`Pop. ${previewMeta.pop}`} />
                  <Chip label={previewMeta.timezone} />
                </div>
                <Chip label={`${bizCount} AI businesses`} green />
              </div>
            </div>
          )}
        </div>

        {/* ── PANEL BODY ───────────────────────────────────────────────── */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px 20px' }}>

          {/* Search */}
          <div style={{ position:'relative', marginBottom:10 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#64748b', fontSize:14 }}>🔍</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search cities…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width:'100%', boxSizing:'border-box',
                paddingLeft:36, paddingRight:12, paddingTop:10, paddingBottom:10,
                borderRadius:12, border:'1px solid rgba(255,255,255,0.1)',
                background:'rgba(255,255,255,0.06)', color:'white',
                fontSize:13, outline:'none',
              }}
            />
          </div>

          {/* Use my location */}
          <button
            onClick={handleGeolocate}
            disabled={locating}
            style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'center',
              gap:8, padding:'10px 0', borderRadius:12,
              border:'1.5px dashed rgba(52,211,153,0.4)',
              background:'rgba(16,185,129,0.07)', color:'#34d399',
              fontSize:13, fontWeight:600, cursor:'pointer',
              marginBottom:16, opacity: locating ? 0.6 : 1, transition:'opacity .15s',
            }}
          >
            {locating ? (
              <>
                <span style={{
                  width:14, height:14, borderRadius:'50%',
                  border:'2px solid #34d399', borderTopColor:'transparent',
                  display:'inline-block', animation:'spin 0.7s linear infinite',
                }} />
                Detecting your location…
              </>
            ) : (
              <>📍 Use my current location</>
            )}
          </button>

          {/* Nearby cities (after geolocation) */}
          {nearbyCities.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <SectionLabel>Nearest to you</SectionLabel>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {nearbyCities.map(city => (
                  <CityRow
                    key={city.region}
                    city={city}
                    meta={CITY_META[city.region]}
                    biz={LOCAL_BUSINESSES[city.region] || []}
                    dist={city.dist}
                    preview={preview}
                    onHover={setPreview}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Business examples for previewed city */}
          {bizExamples.length > 0 && !query && (
            <div style={{ marginBottom:16 }}>
              <SectionLabel>Active in {preview?.name}</SectionLabel>
              <div style={{ display:'flex', gap:8 }}>
                {bizExamples.map(biz => (
                  <div key={biz.id} style={{
                    flex:1, background:'rgba(255,255,255,0.04)', borderRadius:10,
                    border:'1px solid rgba(255,255,255,0.08)', padding:'10px 12px',
                  }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'white', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{biz.name}</div>
                    <div style={{ fontSize:10, color:'#64748b', marginBottom:6 }}>{biz.area}</div>
                    <div style={{ fontSize:11, color:'#34d399', fontWeight:700 }}>{biz.headline}</div>
                    <div style={{ fontSize:9, color:'#64748b' }}>{biz.headlineLabel}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All / searched cities */}
          <SectionLabel>{query ? `Results for "${query}"` : 'Popular cities'}</SectionLabel>

          {filtered.length === 0 ? (
            <p style={{ color:'#64748b', fontSize:13, textAlign:'center', padding:'20px 0' }}>No cities match "{query}"</p>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
              {filtered.map(city => (
                <button
                  key={city.region}
                  onMouseEnter={() => setPreview(city)}
                  onClick={() => onSelect(city)}
                  style={{
                    display:'flex', alignItems:'center', gap:8,
                    padding:'10px 12px', borderRadius:10,
                    border: preview?.region === city.region
                      ? '1px solid rgba(52,211,153,0.5)'
                      : '1px solid rgba(255,255,255,0.07)',
                    background: preview?.region === city.region
                      ? 'rgba(16,185,129,0.12)'
                      : 'rgba(255,255,255,0.04)',
                    cursor:'pointer', textAlign:'left', transition:'all .15s',
                  }}
                >
                  <span style={{ fontSize:18, flexShrink:0 }}>{city.flag}</span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{city.name}</div>
                    <div style={{ fontSize:10, color:'#64748b' }}>{city.country}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .leaflet-container { background: #020b18; }
      `}</style>
    </div>
  );
}

/* ── sub-components ─────────────────────────────────────────────────────── */

function Chip({ label, green }) {
  return (
    <span style={{
      fontSize:10, fontWeight:600,
      color: green ? '#34d399' : 'rgba(255,255,255,0.6)',
      background: green ? 'rgba(16,185,129,0.18)' : 'rgba(0,0,0,0.4)',
      border: green ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.1)',
      borderRadius:20, padding:'3px 9px',
      backdropFilter:'blur(4px)',
    }}>{label}</span>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize:10, fontWeight:800, color:'#475569', textTransform:'uppercase',
      letterSpacing:'0.1em', marginBottom:8 }}>{children}</div>
  );
}

function CityRow({ city, meta, biz, dist, preview, onHover, onSelect }) {
  const isActive = preview?.region === city.region;
  return (
    <button
      onMouseEnter={() => onHover(city)}
      onClick={() => onSelect(city)}
      style={{
        display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
        borderRadius:12, border: isActive ? '1px solid rgba(52,211,153,0.45)' : '1px solid rgba(255,255,255,0.07)',
        background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
        cursor:'pointer', textAlign:'left', transition:'all .15s', width:'100%',
      }}
    >
      <span style={{ fontSize:22 }}>{city.flag}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'white' }}>{city.name}</span>
          <span style={{ fontSize:10, color:'#64748b' }}>{city.country}</span>
        </div>
        {meta && <div style={{ fontSize:10, color:'#475569', marginTop:1 }}>{meta.tagline}</div>}
      </div>
      <div style={{ flexShrink:0, textAlign:'right' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#34d399' }}>{biz.length} businesses</div>
        {dist != null && <div style={{ fontSize:10, color:'#475569' }}>{fmtDist(dist)}</div>}
      </div>
    </button>
  );
}
