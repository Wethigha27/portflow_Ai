import React, { useEffect, useState } from 'react';
import AdminHubLayout from '@/components/AdminHub/Layout';

const OPEN_WEATHER_KEY = '' // laisse vide pour demo
const DEFAULT_CITY = 'Paris';
const UNITS = 'metric';

const iconMap = {
  Clear: '☀️',
  Clouds: '🌥️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Snow: '❄️',
  Thunderstorm: '⛈️',
  Mist: '🌫️',
  Smoke: '🌫️',
  Haze: '🌫️',
  Fog: '🌫️',
  Dust: '🏜️',
  Sand: '🏜️',
  Ash: '🌫️',
  Squall: '💨',
  Tornado: '🌪️',
};

function getWeatherIcon(main, detailed) {
  if(main === "Clear" && detailed && detailed.toLowerCase().includes("cloud")) return iconMap.Clouds;
  return iconMap[main] || '🌡️';
}

const indicatorCardStyle = {
  background: 'rgba(255,255,255,0.72)',
  borderRadius: 18,
  padding: '18px 20px',
  minWidth: 124,
  boxShadow: '0 6px 28px #c3d0e85d',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  border: '1.5px solid #e8eefe',
  transition: 'box-shadow .18s',
};

export default function MerchantWeather() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [search, setSearch] = useState('');
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState('today');
  const [error, setError] = useState('');

  const fetchWeather = (ville) => {
    let url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(ville)}&cnt=9&units=${UNITS}`;
    if (OPEN_WEATHER_KEY) url += `&appid=${OPEN_WEATHER_KEY}`;
    setIsLoading(true);
    setError('');
    Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ville)}&units=${UNITS}${OPEN_WEATHER_KEY ? `&appid=${OPEN_WEATHER_KEY}`:''}`)
        .then(r=>r.ok?r.json():Promise.reject('fail')), 
      fetch(url).then(r=>r.ok?r.json():Promise.reject('fail'))
    ]).then(([w, h]) => {
      setWeather(w);
      setHourly(h.list);
      setIsLoading(false);
    }).catch(() => {
      setError("Ville ou port non trouvé ou limite API !\nEssayez une autre ville ou réessayez plus tard.");
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchWeather(city);
    // eslint-disable-next-line
  }, [city]);

  const handleSearch = (e) => {
    e.preventDefault();
    if(search.trim()) {
      setCity(search.trim());
    }
  };

  return (
    <AdminHubLayout userType="merchant">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, height: '100%', minHeight: 'calc(100vh - 64px)', width: '100%', padding: 0, margin: 0, background: 'linear-gradient(123deg,#e7effa 62%,#f3f6fb 100%)', boxSizing: 'border-box' }}>
        <form onSubmit={handleSearch} style={{ position: 'absolute', left: 0, right: 0, margin: '0 auto', top: 28, zIndex: 2, maxWidth: 440, width: '90%' }}>
          <input 
            placeholder="Entrez une ville, port... (ex: Casablanca)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '14px 22px', borderRadius: 25, boxShadow: '0 2px 16px #e5f0fc3c', border: '1.5px solid #e7ebf6', outline: 'none', fontSize: 17, fontWeight: 500, color:'#354a66', marginBottom: 17, letterSpacing: '.02em', background:'#fff', transition:'box-shadow .19s',
            }}
          />
          <button type="submit" style={{display:'none'}}>Rechercher</button>
        </form>
        <div style={{ flex: 2, minWidth: 0, width: '100%', maxWidth: 'none', alignSelf: 'stretch', marginTop: 70 }}>
          <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: '25px 36px 18px', marginBottom: 28, boxShadow: '0 8px 32px #c7e3fe3b', border: '1.5px solid #e8eefe', width: '100%', boxSizing:'border-box' }}>
            {isLoading ? (
              <div style={{textAlign:'center',padding:42,fontSize:18}}>Chargement météo {city}...</div>
            ) : error ? (
              <div style={{textAlign:'center',color:'#db2e30',fontWeight:500,padding:'22px 0'}}>{error}</div>
            ) : weather ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 19, marginBottom: 10 }}>
                  <div style={{ fontSize: 60 }}>{getWeatherIcon(weather.weather[0].main,weather.weather[0].description)}</div>
                  <div style={{ fontSize: 54, fontWeight: 700, color: '#262f45' }}>{Math.round(weather.main.temp)}°<span style={{fontSize:23, fontWeight: 400, color: '#8ea0ba', marginLeft:6}}>{weather.weather[0].main}</span></div>
                </div>
                <div style={{ fontSize: 13, color: '#89a4c6', marginBottom: 4 }}>{weather.name}, {weather.sys.country} • {new Date((weather.dt || Date.now()/1000)*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
                <div style={{ fontSize: 17, marginBottom: 6 }}>{weather.weather[0].description.charAt(0).toUpperCase()+weather.weather[0].description.slice(1)}</div>
                <div style={{ display: 'flex', gap: 16, color: '#7b8699', fontSize: 14, alignItems: 'center' }}>
                  <span>Ressenti <b>{Math.round(weather.main.feels_like)}°</b></span>
                  <span>|</span>
                  <span>Humidité <b>{weather.main.humidity}%</b></span>
                  <span>|</span>
                  <span>Vent <b>{weather.wind.speed} m/s</b></span>
                </div>
              </>
            ): <div>Erreur de chargement météo 😕</div>}
          </div>
          <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap', marginBottom: 22 }}>
            {isLoading ? null : weather && [
              { label: 'Humidité', value: weather.main.humidity+'%' },
              { label: 'Vent', value: weather.wind.speed+' m/s' },
              { label: 'Pression', value: weather.main.pressure+' hPa' },
              { label: 'Visibilité', value: weather.visibility/1000+' km' },
            ].map((ind, i) => (
              <div key={i} style={indicatorCardStyle}>
                <div style={{ color: '#a2aec7', fontWeight: 500, fontSize: 13 }}>{ind.label}</div>
                <div style={{ fontSize: 24, color: '#354a66', fontWeight: 700, marginTop: 2 }}>{ind.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 19, padding: '14px 14px 18px', boxShadow: '0 4px 18px #dde5fb18', border: '1.5px solid #e8eefe', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 32, width:'100%', boxSizing:'border-box' }}>
            <div style={{ flex: '1 1 100px', textAlign:'center' }}>
              <div style={{ color: '#a2aec7', fontWeight: 500, fontSize: 13 }}>Soleil</div>
              <div style={{ fontSize: 17, color: '#384d82', fontWeight: 600, marginTop: 2 }}>Lever {weather && weather.sys && weather.sys.sunrise ? new Date(weather.sys.sunrise*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '--:--'}</div>
              <div style={{ fontSize: 17, color: '#384d82', fontWeight: 600, marginTop: 0 }}>Coucher {weather && weather.sys && weather.sys.sunset ? new Date(weather.sys.sunset*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '--:--'}</div>
            </div>
            <div style={{ flex: '1 1 110px', textAlign:'center' }}>
              <div style={{ color: '#a2aec7', fontWeight: 500, fontSize: 13 }}>Pression</div>
              <div style={{ fontSize: 19, color: '#425b6e', fontWeight: 600, marginTop: 2 }}>{weather?.main?.pressure || '--'} hPa</div>
            </div>
            <div style={{ flex: '1 1 100px', textAlign:'center' }}>
              <div style={{ color: '#a2aec7', fontWeight: 500, fontSize: 13 }}>Visibilité</div>
              <div style={{ fontSize: 19, color: '#425b6e', fontWeight: 600, marginTop: 2 }}>{weather?.visibility ? (weather.visibility/1000)+' km' : '--'}</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, maxWidth: 'none', alignSelf: 'stretch', marginTop: 70 }}>
          <div style={{ marginBottom: 17, display: 'flex', gap:8, borderBottom:'2px solid #f1f7fb' }}>
            <button onClick={()=>setTab('today')} style={{background:'none',border:'none',padding:10,fontWeight:600,color:tab==='today'?'#4c63e7':'#a3aebb',borderBottom:tab==='today'?'2.5px solid #4c63e7':'2.5px solid transparent',cursor:'pointer',fontSize:15,marginRight:4,transition:'all .14s'}}>Aujourd’hui</button>
            <button onClick={()=>setTab('tomorrow')} style={{background:'none',border:'none',padding:10,fontWeight:600,color:tab==='tomorrow'?'#4c63e7':'#a3aebb',borderBottom:tab==='tomorrow'?'2.5px solid #4c63e7':'2.5px solid transparent',cursor:'pointer',fontSize:15,transition:'all .14s'}}>Demain</button>
            <button onClick={()=>setTab('10days')} style={{background:'none',border:'none',padding:10,fontWeight:600,color:tab==='10days'?'#4c63e7':'#a3aebb',borderBottom:tab==='10days'?'2.5px solid #4c63e7':'2.5px solid transparent',cursor:'pointer',fontSize:15,transition:'all .14s'}}>10 jours</button>
          </div>
          {isLoading ? <div style={{textAlign:'center',color:'#888',fontWeight:500}}>Chargement prévisions...</div> : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hourly.slice(0,7).map((h, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 15, boxShadow: '0 1.5px 6px #dde5fb24', display: 'flex', alignItems: 'center', gap: 16, padding: '12px 13px', cursor:'pointer', transition:'box-shadow .13s', border: '1.1px solid #e9eefa' }}>
                <div style={{ width: 54, textAlign:'center', fontWeight: 600, color:'#435ff2', fontSize:18 }}>{h.dt_txt ? h.dt_txt.split(' ')[1].slice(0,5) : '--:--'}</div>
                <div style={{ fontSize: 29 }}>{getWeatherIcon(h.weather[0].main,h.weather[0].description)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#3b434f' }}>{Math.round(h.main.temp)}°</div>
                  <div style={{ fontSize: 12, color: '#a9b0c7', fontWeight: 500 }}>{h.weather[0].description.charAt(0).toUpperCase()+h.weather[0].description.slice(1)}</div>
                </div>
              </div>
            ))}
          </div>}
        </div>
      </div>
    </AdminHubLayout>
  );
}
