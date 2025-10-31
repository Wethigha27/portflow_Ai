import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Wind, Droplets, AlertTriangle, RefreshCw } from 'lucide-react';
import AdminHubLayout from '@/components/AdminHub/Layout';
import { weatherService, WeatherData, WeatherAlert } from '@/services/weatherService';

const AdminWeather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const [weather, activeAlerts] = await Promise.all([
        weatherService.getAllWeatherData(),
        weatherService.getActiveWeatherAlerts(),
      ]);
      setWeatherData(weather);
      setAlerts(activeAlerts);
    } catch (error) {
      console.error('Error loading weather data:', error);
      // Fallback to static data
      setWeatherData([
        {
          id: 1,
          port: { id: 1, name: 'Port de Marseille', country: 'France', city: 'Marseille', latitude: 43.2965, longitude: 5.3698, code: 'FRMRS' },
          temperature: 18.5,
          humidity: 65,
          wind_speed: 12.3,
          wind_direction: 180,
          weather_condition: 'Clear',
          description: 'Clear sky',
          visibility: 10000,
          recorded_at: new Date().toISOString(),
        },
      ] as WeatherData[]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      return <Sun size={24} color="#f59e0b" />;
    } else if (conditionLower.includes('cloud')) {
      return <Cloud size={24} color="#6b7280" />;
    } else if (conditionLower.includes('rain')) {
      return <Droplets size={24} color="#3b82f6" />;
    }
    return <Cloud size={24} />;
  };

  const getAlertSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      low: '#f59e0b',
      medium: '#f97316',
      high: '#ef4444',
    };
    return colors[severity] || '#6b7280';
  };

  if (loading) {
    return (
      <AdminHubLayout userType="admin">
        <div className="head-title">
          <h1>Chargement...</h1>
        </div>
      </AdminHubLayout>
    );
  }

  return (
    <AdminHubLayout userType="admin">
      <div className="head-title">
        <div className="left">
          <h1>Gestion Météo</h1>
          <ul className="breadcrumb">
            <li><a href="#">Admin</a></li>
            <li> / </li>
            <li><a className="active" href="#">Météo</a></li>
          </ul>
        </div>
        <button
          onClick={loadWeatherData}
          className="btn-download"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <RefreshCw size={16} />
          <span className="text">Actualiser</span>
        </button>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="#ef4444" />
            Alertes Météo Actives ({alerts.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '15px',
                  borderRadius: '8px',
                  border: `2px solid ${getAlertSeverityColor(alert.severity)}`,
                  backgroundColor: getAlertSeverityColor(alert.severity) + '10',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>{alert.port.name}</div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}>{alert.message}</div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#666' }}>
                  <span>Type: {alert.alert_type}</span>
                  <span>|</span>
                  <span>Severity: {alert.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Data Table */}
      <div className="table-data">
        <div className="order" style={{ width: '100%' }}>
          <div className="head">
            <h3>Données Météo par Port ({weatherData.length})</h3>
          </div>

          {weatherData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <p>Aucune donnée météo disponible</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Pays</th>
                  <th>Condition</th>
                  <th>Température</th>
                  <th>Humidité</th>
                  <th>Vent</th>
                  <th>Visibilité</th>
                  <th>Dernière MAJ</th>
                </tr>
              </thead>
              <tbody>
                {weatherData.map((weather) => (
                  <tr key={weather.id}>
                    <td>
                      <strong>{weather.port.name}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>{weather.port.city}</div>
                    </td>
                    <td>{weather.port.country}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getWeatherIcon(weather.weather_condition)}
                        <span>{weather.description}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{weather.temperature}°C</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Droplets size={14} color="#3b82f6" />
                        {weather.humidity}%
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Wind size={14} />
                        {weather.wind_speed} m/s
                        <span style={{ fontSize: '11px', color: '#666' }}>
                          ({weather.wind_direction}°)
                        </span>
                      </div>
                    </td>
                    <td>{weather.visibility / 1000} km</td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(weather.recorded_at).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminHubLayout>
  );
};

export default AdminWeather;
