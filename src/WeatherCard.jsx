import React from "react";

const WeatherCard = ({ weather, isCelsius }) => {
  const temp = isCelsius
    ? Math.round(weather.main.temp)
    : Math.round(weather.main.temp * 1.8 + 32);

  const feelsLike = isCelsius
    ? Math.round(weather.main.feels_like)
    : Math.round(weather.main.feels_like * 1.8 + 32);

  const unit = isCelsius ? "°C" : "°F";

  const sunrise = new Date(weather.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(weather.sys.sunset * 1000).toLocaleTimeString();

  return (
    <div className="weather-card">
      <h2>{weather.name}, {weather.sys.country}</h2>
      <h3>{weather.weather[0].main}</h3>
      <p><i>{weather.weather[0].description}</i></p>
      <div className="temp">{temp}{unit}</div>

      <div className="weather-details">
        <p>🎯 Feels like: {feelsLike}{unit}</p>
        <p>💧 Humidity: {weather.main.humidity}%</p>
        <p>🌬️ Wind Speed: {weather.wind.speed} m/s</p>
        <p>🌅 Sunrise: {sunrise}</p>
        <p>🌇 Sunset: {sunset}</p>
      </div>
    </div>
  );
};

export default WeatherCard;
