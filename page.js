"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const API_KEY = "444352b1a08d79a11aab5aefa6b11be3"; // Replace with your OpenWeather API key

  // Function to fetch weather data
  const fetchWeather = async (query) => {
    try {
      setError("");
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=${API_KEY}`
      );
      setWeather(response.data);
      fetchForecast(query);
    } catch (error) {
      setError("City not found. Please try again.");
      console.error("Error fetching weather:", error);
    }
  };

  // Function to fetch 5-day forecast
  const fetchForecast = async (query) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${query}&units=metric&appid=${API_KEY}`
      );
      setForecast(response.data.list.filter((_, index) => index % 8 === 0)); // Get one entry per day
    } catch (error) {
      console.error("Error fetching forecast:", error);
    }
  };

  // Function to get weather using location
  const fetchWeatherByLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
          );
          setWeather(response.data);
          fetchForecast(response.data.name);
        } catch (error) {
          console.error("Error fetching location weather:", error);
        }
      });
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  // Auto-fetch location-based weather on mount
  useEffect(() => {
    fetchWeatherByLocation();
  }, []);

  return (
    <div className="container">
      <h1>Weather App</h1>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
      />
      <button onClick={() => fetchWeather(city)}>Get Weather</button>
      <button onClick={fetchWeatherByLocation}>Use My Location</button>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>{weather.name}</h2>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Condition: {weather.weather[0].description}</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="Weather icon"
          />
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-container">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-item">
                <p>{new Date(day.dt_txt).toLocaleDateString()}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt="Weather icon"
                />
                <p>{day.main.temp}°C</p>
                <p>{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
