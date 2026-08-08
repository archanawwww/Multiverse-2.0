import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind, Thermometer } from 'lucide-react';

const weatherIcons = {
  0: Sun,         // Clear sky
  1: Sun,         // Mainly clear
  2: Cloud,       // Partly cloudy
  3: Cloud,       // Overcast
  45: Cloud,      // Foggy
  48: Cloud,      // Rime fog
  51: CloudDrizzle, // Light drizzle
  53: CloudDrizzle, // Moderate drizzle
  55: CloudDrizzle, // Dense drizzle
  61: CloudRain,  // Slight rain
  63: CloudRain,  // Moderate rain
  65: CloudRain,  // Heavy rain
  71: CloudSnow,  // Slight snow
  73: CloudSnow,  // Moderate snow
  75: CloudSnow,  // Heavy snow
  80: CloudRain,  // Slight rain showers
  81: CloudRain,  // Moderate rain showers
  82: CloudRain,  // Violent rain showers
  95: CloudLightning, // Thunderstorm
  96: CloudLightning, // Thunderstorm with hail
  99: CloudLightning, // Thunderstorm with heavy hail
};

const weatherLabels = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Rime Fog', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Dense Drizzle',
  61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Light Snow', 73: 'Snow',
  75: 'Heavy Snow', 80: 'Rain Showers', 81: 'Rain Showers', 82: 'Heavy Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Severe Storm',
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
        );
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (err) {
        console.error('Weather fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Fallback to a default location (New Delhi)
          fetchWeather(28.6139, 77.2090);
        }
      );
    } else {
      fetchWeather(28.6139, 77.2090);
    }
  }, []);

  if (loading || !weather) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.05] border border-white/[0.08] animate-pulse">
        <Thermometer size={16} className="text-gray-500" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  const WeatherIcon = weatherIcons[weather.weathercode] || Cloud;
  const label = weatherLabels[weather.weathercode] || 'Unknown';
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm">
      <WeatherIcon size={18} className="text-blue-300" />
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-white">{Math.round(weather.temperature)}°C</span>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 leading-tight">{label}</span>
          <span className="text-[10px] text-gray-500 leading-tight">{dateStr}</span>
        </div>
      </div>
      <div className="text-sm font-semibold text-white/70 ml-2">{timeStr}</div>
    </div>
  );
};

export default WeatherWidget;
