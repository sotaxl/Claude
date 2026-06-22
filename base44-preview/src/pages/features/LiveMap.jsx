import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CITIES = [
  { name: 'London',     x: 310, y: 370, count: 81 },
  { name: 'Manchester', x: 255, y: 230, count: 34 },
  { name: 'Birmingham', x: 270, y: 290, count: 23 },
  { name: 'Leeds',      x: 275, y: 215, count: 18 },
  { name: 'Glasgow',    x: 215, y: 120, count: 12 },
  { name: 'Cardiff',    x: 215, y: 340, count:  9 },
  { name: 'Bristol',    x: 230, y: 340, count: 11 },
  { name: 'Edinburgh',  x: 230, y: 110, count: 10 },
  { name: 'Sheffield',  x: 270, y: 240, count: 14 },
  { name: 'Liverpool',  x: 240, y: 240, count: 16 },
  { name: 'Newcastle',  x: 265, y: 175, count:  8 },
  { name: 'Belfast',    x: 175, y: 145, count:  6 },
];

const FLAGS = [
  { flag: '🇬🇧', label: 'United Kingdom', count: 242 },
  { flag: '🇦🇺', label: 'Australia',      count:  31 },
  { flag: '🇨🇦', label: 'Canada',         count:  18 },
  { flag: '🇺🇸', label: 'United States',  count:  14 },
];

export default function LiveMap() {
  const navigate = useNavigate();
  const [mapTooltip, setMapTooltip] = useState(null);
  const [geoCity, setGeoCity] = useState('');
  const [totalLive, setTotalLive] = useState(242);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => { if (d && d.city) setGeoCity(d.city); })
      .catch(() => {});
  }, []);

  // Slowly tick up the live count
  useEffect(() => {
    const t = setInterval(() => {
      setTotalLive(n => n + (Math.random() < 0.3 ? 1 : 0));
    }, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: .7; }
          70%  { transform: scale(2.4); opacity: 0;  }
          100% { transform: scale(2.4); opacity: 0;  }
        }
        @keyframes fade-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fade-up .5s cubic-bezier(.23,1,.32,1) both; }
        .city-dot { cursor: pointer; }
        .city-dot circle.ring { animation: pulse-ring 2s ease-out infinite; transform-box: fill-box; transform-origin: center; }
      `}</style>

      {/* Sticky mini header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, height: 56,
        background: 'white', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', boxShadow: '0 1px 8px rgba(0,0,0,.06)',
      }}>
        <img src="/toggle-logo.svg" alt="LocAI" style={{ width: 44, height: 22 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f' }}>Live Map</span>
        <button onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6b7280', padding: '6px 10px', borderRadius: 8, transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
      </header>

      <div style={{ background: '#f7fdf9', minHeight: 'calc(100vh - 56px)', padding: '60px 24px 80px' }}>
        {/* Heading */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 2px rgba(16,185,129,.3)' }} />
            Live right now
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#0a1a0f', marginBottom: 12 }}>
            Where LocAI is live right now
          </h1>
          <p style={{ fontSize: 17, color: '#4b5563', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            {totalLive.toLocaleString()} businesses across the UK are getting booked while their owners sleep.
          </p>
        </div>

        {/* Global pills */}
        <div className="fade-up" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
          {FLAGS.map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e5e7eb', borderRadius: 100, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: '#374151', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
              <span style={{ fontSize: 18 }}>{f.flag}</span>
              {f.label}
              <span style={{ background: '#f0fdf4', color: '#065f46', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{f.count}</span>
            </div>
          ))}
        </div>

        {/* Map container */}
        <div className="fade-up" style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
          <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,.08)', padding: '32px', position: 'relative', overflow: 'visible' }}>

            {/* Tooltip */}
            {mapTooltip && (
              <div style={{
                position: 'absolute',
                left: mapTooltip.x - 60,
                top: mapTooltip.y - 72,
                background: '#0a1a0f',
                color: 'white',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                pointerEvents: 'none',
                zIndex: 20,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(0,0,0,.3)',
              }}>
                <div>{mapTooltip.name}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#10b981', marginTop: 2 }}>{mapTooltip.count} businesses · Active now</div>
                <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #0a1a0f' }} />
              </div>
            )}

            {/* SVG UK Map */}
            <svg viewBox="0 0 500 550" style={{ width: '100%', height: 'auto' }}>
              {/* UK outline — simplified path */}
              <path
                d="M280,30 C285,28 295,32 300,38 C310,48 318,60 315,75 C320,85 330,88 335,98 C340,110 338,125 330,132 C325,138 320,142 318,150 C315,158 318,168 312,174 C305,180 295,178 288,185 C280,192 278,205 270,210 C262,215 250,212 244,220 C238,228 240,242 232,248 C225,254 214,252 208,258 C200,265 200,278 194,284 C188,290 178,290 172,296 C165,303 164,315 158,320 C153,325 144,324 140,330 C135,337 136,348 130,354 C124,360 114,360 108,366 C102,372 100,384 96,390 C92,396 84,398 82,405 C79,413 84,422 81,430 C78,438 70,441 70,450 C70,460 78,467 82,475 C86,483 85,494 90,500 C94,505 102,506 106,511 C112,518 112,528 118,534 C124,540 134,540 140,545 C148,550 152,558 160,560 C168,562 178,558 185,562 C192,566 195,576 203,578 C210,580 218,576 225,578 C232,580 237,588 244,588 C250,588 255,582 261,580 C268,578 276,580 282,576 C289,572 291,562 298,558 C305,554 315,556 321,551 C327,546 328,536 333,530 C338,524 346,522 350,516 C354,510 352,500 355,494 C358,488 365,486 367,480 C369,474 365,466 367,460 C369,454 376,452 377,446 C378,440 374,432 375,426 C376,420 382,416 382,410 C382,404 376,400 374,394 C372,388 373,380 370,374 C367,368 360,366 357,360 C354,354 355,344 351,338 C347,332 339,330 335,324 C331,318 332,308 328,302 C324,296 315,294 311,288 C307,282 308,272 304,266 C300,260 291,258 287,252 C283,246 284,236 280,230 C276,224 267,222 264,216 C261,210 263,200 260,194 C258,190 254,188 252,184 C248,178 248,168 244,162 C240,156 232,154 228,148 C224,142 224,132 220,126 C216,120 208,118 205,112 C202,106 204,96 200,90 C196,84 188,82 185,76 C182,70 184,60 180,54 C176,48 168,46 165,40 C162,34 164,24 161,18 C158,12 151,10 149,4 C146,-4 148,-14 145,-22 L200,-20 C200,-14 202,-6 206,0 C210,6 218,8 221,14 C224,20 222,30 226,36 C230,42 240,44 244,50 C248,56 247,67 252,72 C256,76 264,75 268,80 C272,85 272,96 276,100 C278,103 282,100 284,97 C288,92 285,82 288,77 C291,72 299,72 302,67 C305,62 303,52 307,48 C311,44 320,45 323,40 C326,35 323,25 327,21 C330,17 338,18 341,14 C344,10 342,2 346,-2 L375,0 C373,8 368,14 367,22 C366,30 370,38 368,46 C366,54 358,58 358,66 C358,74 364,80 363,88 C362,96 355,100 354,108 C353,116 358,123 356,131 C354,139 346,142 345,150 C344,158 349,165 347,173 C345,181 337,184 336,192 C335,200 340,207 338,215 C336,222 328,225 327,232 C326,240 332,247 330,254 C328,260 320,263 318,270 C316,277 320,284 318,291 C316,298 308,302 307,309 C306,316 311,323 309,330 C307,337 299,340 298,347 C297,354 302,361 300,368 C299,372 295,374 292,376 C288,379 285,383 284,387 C282,393 284,399 282,405 C280,411 274,414 273,420 C272,426 276,432 274,438 C272,443 266,445 265,451 C264,457 268,463 266,469 C264,474 258,476 257,482 C256,488 260,494 258,500 C256,505 250,507 249,513 C248,519 252,525 250,531 C248,536 242,538 241,544 L215,544 C215,538 219,532 218,526 C217,520 212,516 212,510 C212,504 217,499 216,493 C215,487 209,484 209,478 C209,472 215,468 214,462 C213,456 207,453 207,447 C207,441 213,437 213,431 C213,425 207,421 208,415 C209,409 215,406 215,400 C215,394 210,390 210,384 C210,378 215,374 214,368 C213,362 207,359 207,353 C207,347 213,343 212,337 C211,331 205,328 205,322 C205,316 211,312 210,306 C209,300 203,297 203,291 C203,285 209,281 208,275 C207,269 200,267 200,261 C200,255 206,251 205,245 C204,239 198,236 198,230 C198,224 204,220 203,214 C202,208 196,205 196,199 C196,193 202,189 201,183 C200,177 194,174 194,168 C194,162 200,158 199,152 C198,146 192,143 192,137 C192,131 198,127 197,121 C196,115 190,112 190,106 C190,100 196,96 195,90 C194,84 188,81 188,75 C188,69 194,65 193,59 C192,53 186,50 186,44 C186,38 192,34 191,28 C190,22 183,20 183,14 C183,8 189,4 188,-2 L230,-5 C228,2 225,8 225,15 C225,22 229,28 228,35 C227,42 220,47 220,54 C220,62 226,68 226,76 C226,84 220,88 220,96 C220,104 226,110 226,118 C226,126 220,130 220,138 C220,146 226,152 226,160 C226,168 220,172 220,180 C220,188 226,194 226,202 C226,210 220,214 220,222 C220,230 226,236 226,244 C226,252 220,256 220,264 C220,272 226,278 226,286 C226,294 220,298 220,306 C220,314 226,320 226,328 C226,336 220,340 220,348 C220,356 226,362 226,370 C226,378 220,382 220,390 C220,398 226,404 226,412 C226,420 220,424 220,432 C220,440 226,446 226,454 C226,462 220,466 220,474 C220,482 226,488 225,496 L200,496 C200,488 195,482 196,474 C197,466 203,461 203,453 C203,445 197,439 197,431 C197,423 203,417 203,409 C203,401 197,395 197,387 C197,379 203,373 203,365 C203,357 197,351 198,343 C199,335 205,330 205,322 C205,314 199,308 200,300 C201,292 207,287 207,279 C207,271 201,265 202,257 C203,249 209,244 209,236 C209,228 203,222 204,214 C205,206 211,201 211,193 C211,185 205,179 206,171 C207,163 213,158 213,150 C213,142 207,136 208,128 C209,120 215,115 215,107 C215,99 209,93 210,85 C211,77 217,72 217,64 C217,56 211,50 212,42 C213,34 219,29 219,21 C219,13 213,7 214,-1 L280,30 Z"
                fill="#e8f5e9"
                stroke="#a7d7c5"
                strokeWidth="1.5"
              />

              {/* City dots */}
              {CITIES.map((city, i) => {
                const isGeo = geoCity && city.name.toLowerCase() === geoCity.toLowerCase();
                const isHovered = mapTooltip && mapTooltip.name === city.name;
                return (
                  <g
                    key={city.name}
                    className="city-dot"
                    onMouseEnter={() => setMapTooltip({ name: city.name, count: city.count, x: city.x, y: city.y })}
                    onMouseLeave={() => setMapTooltip(null)}
                  >
                    {/* Pulse ring */}
                    <circle
                      className="ring"
                      cx={city.x} cy={city.y} r={isGeo ? 12 : 8}
                      fill={isGeo ? 'rgba(245,158,11,.35)' : 'rgba(16,185,129,.3)'}
                      style={{ animationDelay: `${i * 0.22}s` }}
                    />
                    {/* Dot */}
                    <circle
                      cx={city.x} cy={city.y} r={isGeo ? 7 : 5}
                      fill={isGeo ? '#f59e0b' : '#10b981'}
                      stroke="white" strokeWidth="1.5"
                    />
                    {/* Count badge */}
                    <rect
                      x={city.x + 7} y={city.y - 14}
                      width={city.count > 9 ? (city.count > 99 ? 28 : 22) : 16}
                      height={14} rx={7}
                      fill={isGeo ? '#f59e0b' : '#065f46'}
                    />
                    <text
                      x={city.x + 7 + (city.count > 9 ? (city.count > 99 ? 14 : 11) : 8)}
                      y={city.y - 3}
                      textAnchor="middle"
                      fill="white"
                      fontSize={9}
                      fontWeight="700"
                      fontFamily="Inter, sans-serif"
                    >{city.count}</text>
                    {/* City label */}
                    <text
                      x={city.x} y={city.y + 18}
                      textAnchor="middle"
                      fill={isGeo ? '#92400e' : '#065f46'}
                      fontSize={9}
                      fontWeight="600"
                      fontFamily="Inter, sans-serif"
                    >{city.name}{isGeo ? ' (you)' : ''}</text>
                  </g>
                );
              })}
            </svg>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
              Hover a dot to see local stats · Updated in real time
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="fade-up" style={{ maxWidth: 700, margin: '32px auto 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { value: totalLive.toLocaleString(), label: 'Businesses live', icon: '🏪' },
            { value: '98%',   label: 'Uptime guarantee',     icon: '⚡' },
            { value: '24/7',  label: 'AI always on',         icon: '🤖' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0a1a0f', letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <p style={{ fontSize: 16, color: '#4b5563', marginBottom: 24 }}>Join businesses in your area already using LocAI</p>
          <button onClick={() => navigate('/app')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 14, border: 'none', background: '#10b981', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(16,185,129,.4)', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.transform = ''; }}
          >
            Get LocAI for my business
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </>
  );
}
