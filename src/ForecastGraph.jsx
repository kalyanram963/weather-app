import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ForecastGraph = ({ forecast, isCelsius }) => {
  const data = forecast.map((day) => ({
    date: day.date,
    min: isCelsius ? day.day.mintemp_c : day.day.mintemp_f,
    max: isCelsius ? day.day.maxtemp_c : day.day.maxtemp_f,
  }));

  return (
    <div style={{ marginTop: "30px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "10px" }}>
      <h3 style={{ textAlign: "center", color: "#00e5ff" }}>📊 7-Day Temperature Chart</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid stroke="#00e5ff20" />
          <XAxis dataKey="date" stroke="#00e5ff" />
          <YAxis stroke="#00e5ff" />
          <Tooltip />
          <Line type="monotone" dataKey="min" stroke="#00bcd4" name="Min Temp" />
          <Line type="monotone" dataKey="max" stroke="#ff7043" name="Max Temp" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastGraph;
