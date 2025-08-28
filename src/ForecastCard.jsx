import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ForecastCard = ({ forecast, isCelsius }) => {
  const unit = isCelsius ? "°C" : "°F";

  const data = forecast.map((day) => ({
    name: new Date(day.dt * 1000).toLocaleDateString("en-US", {
      weekday: "short",
    }),
    temp: isCelsius
      ? Math.round(day.temp.day)
      : Math.round(day.temp.day * 1.8 + 32),
  }));

  return (
    <div className="weather-card">
      <h2>7‑Day Forecast</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            label={{ value: `Temp ${unit}`, angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#00e5ff"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastCard;
