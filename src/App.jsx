import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import ForecastGraph from "./ForecastGraph";
import MapView from "./MapView";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const App = () => {
  const { t, i18n } = useTranslation();

  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [dateTime, setDateTime] = useState("");
  const [isCelsius, setIsCelsius] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [aiClothing, setAiClothing] = useState("");
  const [aiTravel, setAiTravel] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const weatherApiKey = "93ca131f7d3e4974813153729252106";
  const geoApiKey = "a357b57b6ff24dd1a4583de681a66a74";
  const openRouterKey = "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";
  const geoDbKey = "5ef9d22ed9msh78774102cf1d2fep10dfdajsn3433516c332a";

  useEffect(() => {
    const tick = () => setDateTime(new Date().toLocaleString());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=5&namePrefix=${query}`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": geoDbKey,
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        }
      );
      const data = await res.json();
      const results = data.data.map((item) => `${item.city}, ${item.countryCode}`);
      setSuggestions(results);
    } catch (err) {
      console.error("Suggestion error:", err);
      setSuggestions([]);
    }
  };

  const getWeather = async (cityName) => {
    try {
      const res = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${cityName}&days=7&aqi=no&alerts=yes`
      );
      const astro = res.data.forecast.forecastday[0].astro;
      res.data.sunrise = astro.sunrise;
      res.data.sunset = astro.sunset;
      setWeather(res.data);
      setForecast(res.data.forecast.forecastday);
      setAlerts(res.data.alerts && res.data.alerts.alert ? res.data.alerts.alert : []);
      setIsCelsius(true);
      setAiTip("");

      const newHistoryItem = {
        city: res.data.location.name,
        country: res.data.location.country,
        date: new Date().toLocaleString()
      };
      setWeatherHistory(prevHistory => {
        if (prevHistory.length > 0 && prevHistory[0].city === newHistoryItem.city && prevHistory[0].country === newHistoryItem.country) {
          return prevHistory;
        }
        return [newHistoryItem, ...prevHistory];
      });

    } catch (err) {
      console.error(err);
      alert("City not found or API error.");
      setWeather(null);
      setForecast([]);
      setAlerts([]);
    }
  };

  const getMyLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const geoRes = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${geoApiKey}`
          );
          const c = geoRes.data.results[0]?.components;
          const detected = c?.city || c?.town || c?.village || c?.state_district;
          if (detected) {
            setCity(detected);
            getWeather(detected);
          } else {
            alert("City not detected accurately.");
          }
        } catch (e) {
          console.error(e);
          alert("Location error!");
        }
      },
      (err) => alert(`Location access denied: ${err.message}`)
    );
  };

  const speakResult = () => {
    if (!weather) {
      const noWeatherMsg = t("please_search_weather_first");
      const u = new SpeechSynthesisUtterance(noWeatherMsg);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
      u.onend = () => setSpeaking(false);
      return;
    }

    let msg = `${t("app_title")} - ${weather.location.name}, ${weather.current.condition.text}, ${weather.current.temp_c}°C, ${t("temperature")}, ${t("sunrise")}: ${weather.sunrise}, ${t("sunset")}: ${weather.sunset}`;

    if (alerts && alerts.length > 0) {
        msg += `. ${t("alert_intro")}: `;
        alerts.forEach((alert) => {
          msg += `${alert.event}. ${alert.description}. `;
        });
    }

    const u = new SpeechSynthesisUtterance(msg);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
    u.onend = () => setSpeaking(false);
  };

  const getAiTip = async () => {
    if (!weather) return;
    const prompt = `
You are a smart weather assistant. Give a 2-line safety/weather tip for the following data:
Location: ${weather.location.name}, ${weather.location.country}
Condition: ${weather.current.condition.text}
Temperature: ${weather.current.temp_c}°C
Humidity: ${weather.current.humidity}%
Wind: ${weather.current.wind_kph} kph
Respond only with the advice in 2 short lines.
    `.trim();

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            { role: "system", content: "You are a helpful weather assistant." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await res.json();
      const message = data.choices?.[0]?.message?.content || "No tip available.";
      setAiTip(message);
    } catch (error) {
      console.error("AI tip error:", error);
      setAiTip("Failed to load tip.");
    }
  };

  const getClothingSuggestion = async () => {
    if (!weather) return;
    const prompt = `
You are a smart weather assistant. Suggest appropriate clothing based on the following weather:
Location: ${weather.location.name}, ${weather.location.country}
Condition: ${weather.current.condition.text}
Temperature: ${weather.current.temp_c}°C
Humidity: ${weather.current.humidity}%
Wind: ${weather.current.wind_kph} kph
Give short clothing advice in 1-2 lines only.
    `.trim();

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            { role: "system", content: "You are a helpful weather assistant." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await res.json();
      const suggestion = data.choices?.[0]?.message?.content || "No clothing suggestion available.";
      setAiClothing(suggestion);
    } catch (error) {
      console.error("AI clothing suggestion error:", error);
      setAiClothing("Failed to get suggestion.");
    }
  };

  const getAiTravelSuggestion = async () => {
    if (!weather) return;

    const prompt = `
You are a smart travel assistant.
Suggest one ideal travel destination based on this weather:
Location: ${weather.location.name}, ${weather.location.country}
Condition: ${weather.current.condition.text}
Temperature: ${weather.current.temp_c}°C
Give only 1 suggestion in 1–2 lines.
`.trim();

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            { role: "system", content: "You are a smart travel assistant." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await res.json();
      const suggestion = data.choices?.[0]?.message?.content || "No travel suggestion available.";
      setAiTravel(suggestion);
    } catch (error) {
      console.error("Travel Suggestion Error:", error);
      setAiTravel("Failed to get travel suggestion.");
    }
  };

  const exportToPDF = async () => {
    if (!weather) {
      alert("Please search for weather data first before exporting to PDF.");
      return;
    }

    setIsExporting(true);
    const input = document.getElementById("pdf-content");

    try {
      const canvas = await html2canvas(input, {
        scrollY: -window.scrollY,
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: false,
        foreignObjectRendering: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      let pageNum = 1;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
        pageNum++;
      }

      const totalPages = pageNum;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100);

        pdf.text(`${t("app_title")} - ${weather.location.name} Weather Report`, 10, 10);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, pdfWidth - 60, 10);

        pdf.text(`Page ${i} of ${totalPages}`, pdfWidth / 2, pageHeight - 10, { align: 'center' });
      }

      pdf.save(`${weather.location.name}_Weather_Report.pdf`);
      alert("PDF exported successfully!");

    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again. " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const deleteHistoryItem = (indexToDelete) => {
    setWeatherHistory(prevHistory => prevHistory.filter((_, index) => index !== indexToDelete));
  };

  const clearWeatherHistory = () => {
    setWeatherHistory([]);
  };


  return (
    <div className={`container ${isDark ? "dark" : "light"}`}>
      <div style={{ position: "absolute", top: 20, left: 20 }}>
        <button
          onClick={() => setIsDark(!isDark)}
          style={{
            backgroundColor: "#00e5ff",
            color: "#000",
            padding: "10px 18px",
            borderRadius: "10px",
            fontWeight: "bold",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "0 0 12px rgba(0, 229, 255, 0.7)",
            transition: "0.3s ease",
          }}
        >
          {isDark ? `☀️ ${t("light_mode")}` : `🌙 ${t("dark_mode")}`}
        </button>
      </div>

      <div style={{ position: "absolute", top: 20, right: 80 }}>
        <button
          onClick={() => {
            document.getElementById("lang-options").classList.toggle("show");
            setShowHistory(false);
          }}
          style={{
            fontSize: "18px",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: "#00e5ff",
            color: "#000",
            cursor: "pointer",
            boxShadow: "0 0 8px rgba(0,229,255,0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          🌐
        </button>
        <div
          id="lang-options"
          style={{
            position: "absolute",
            marginTop: "8px",
            right: 0,
            background: "#000000bb",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 255, 255, 0.4)",
            backdropFilter: "blur(12px)",
            display: "none",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
            border: "1px solid rgba(0, 255, 255, 0.3)",
          }}
        >
          {[
            { code: "en", label: "English" },
            { code: "hi", label: "हिन्दी" },
            { code: "te", label: "తెలుగు" },
            { code: "ta", label: "தமிழ்" },
            { code: "kn", label: "ಕನ್ನಡ" },
            { code: "fr", label: "Français" },
            { code: "es", label: "Español" },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                document.getElementById("lang-options").classList.remove("show");
              }}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                textAlign: "left",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                transition: "background 0.3s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            document.getElementById("lang-options").classList.remove("show");
          }}
          style={{
            fontSize: "18px",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: "#00e5ff",
            color: "#000",
            cursor: "pointer",
            boxShadow: "0 0 8px rgba(0,229,255,0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          📚
        </button>
        {showHistory && (
          <div
            id="history-dropdown-panel"
            style={{
              position: "absolute",
              marginTop: "8px",
              right: 0,
              background: "#000000bb",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 255, 255, 0.4)",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              zIndex: 999,
              overflow: "hidden",
              border: "1px solid rgba(0, 255, 255, 0.3)",
              width: "300px",
              maxHeight: "350px",
              overflowY: "auto",
              padding: "10px"
            }}
          >
            <h2 style={{ color: '#00e5ff', fontSize: '1.2em', margin: '15px 0 10px', padding: '0 10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              📚 {t("weather_history")}
            </h2>
            {weatherHistory.length > 0 ? (
              <>
                <button onClick={clearWeatherHistory} style={{
                  background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 12px',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '0.8em', fontWeight: 'bold',
                  margin: '0 auto 10px', width: 'calc(100% - 20px)',
                  boxShadow: '0 4px 10px rgba(255, 77, 77, 0.4)',
                  transition: 'background-color 0.3s ease, transform 0.2s ease'
                }}>
                  🗑️ {t("clear_all_history")}
                </button>
                <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                  {weatherHistory.map((item, index) => (
                    <li key={index} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(0, 229, 255, 0.1)', padding: '8px 10px', marginBottom: '8px',
                      borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.3)', color: '#e0f7fa'
                    }}>
                      <span style={{ flexGrow: 1, textAlign: 'left', fontSize: '0.9em', lineHeight: '1.3', wordBreak: 'break-word' }}>
                        {item.city}, {item.country} - {item.date}
                      </span>
                      <button onClick={() => deleteHistoryItem(index)} style={{
                        background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '50%',
                        width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: '0.9em', cursor: 'pointer', marginLeft: '10px', flexShrink: '0',
                        transition: 'background-color 0.3s ease, transform 0.2s ease'
                      }}>
                        ✖️
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p style={{ color: '#bbb', fontStyle: 'italic', padding: '15px', textAlign: 'center' }}>{t("no_history_yet")}</p>
            )}
          </div>
        )}
      </div>

      {/* This is the updated title tag you requested */}
      <h1>⛅ {t("app_title")}</h1>

      <div className="controls">
        <input
          type="text"
          placeholder={t("search_placeholder")}
          value={city}
          onChange={(e) => {
            const val = e.target.value;
            setCity(val);
            fetchSuggestions(val);
          }}
        />
        <button onClick={() => getWeather(city)}>🔍 {t("search")}</button>
        <button
          onClick={() => {
            const r = new window.webkitSpeechRecognition();
            r.onresult = (e) => {
              const spoken = e.results[0][0].transcript;
              setCity(spoken);
              getWeather(spoken);
            };
            r.start();
          }}
        >
          🎤 {t("speak")}
        </button>
        <button onClick={getMyLocationWeather}>📍 {t("my_location")}</button>

        {suggestions.length > 0 && (
          <ul style={{
              listStyle: "none",
              padding: 0,
              margin: "5px 0",
              background: "rgba(0, 0, 0, 0.7)",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0, 255, 255, 0.5)",
              color: "#e0f7fa",
              position: "absolute",
              width: "calc(100% - 40px)",
              maxWidth: "600px",
              zIndex: 500,
              backdropFilter: "blur(5px)"
          }}>
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => {
                  setCity(s);
                  setSuggestions([]);
                  getWeather(s);
                }}
                style={{
                    padding: "10px 15px",
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(0, 255, 255, 0.2)",
                    transition: "background-color 0.3s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(0, 229, 255, 0.1)"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="date-time">
        <span className="icon-date">📅</span> {dateTime.split(",")[0]} &nbsp;&nbsp;
        <span className="icon-time">⏰</span> {dateTime.split(",")[1]}
      </p>


      {weather && (
        <div id="pdf-content">
          <div className="sun-times">
            ☀️ {t("sunrise")}: {weather.sunrise} &nbsp;&nbsp; 🌅 {t("sunset")}: {weather.sunset}
          </div>

          {alerts.length > 0 && (
            <div className="weather-alerts">
              <div className="alert-title">
                <span role="img" aria-label="shield">🛡️</span> {t("severe_weather_alerts")}
              </div>
              {alerts.map((alert, index) => (
                <div key={index} className="alert-item">
                  <h3>{alert.event}</h3>
                  <p>{alert.description}</p>
                  {alert.instruction && <p>Instructions: {alert.instruction}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="weather-card">
            <h2>{weather.location.name}, {weather.location.country}</h2>
            <p>{weather.current.condition.text}</p>
            <h1>{isCelsius ? `${weather.current.temp_c}°C` : `${weather.current.temp_f}°F`}</h1>
            <p>💧 {t("humidity")}: {weather.current.humidity}%</p>
            <p>🌬️ {t("wind")}: {weather.current.wind_kph} kph</p>
          </div>

          <MapView
            lat={weather.location.lat}
            lon={weather.location.lon}
            city={weather.location.name}
          />

          <div className="forecast-table">
            <div className="forecast-row header">
              <div>{t("date")}</div>
              <div>{t("condition")}</div>
              <div>{t("temperature")}</div>
            </div>
            {forecast.map((day) => (
              <div
                className={`forecast-row ${day.day.avgtemp_c >= 35 ? "hot-day" : ""}`}
                key={day.date}
              >
                <div>{day.date}</div>
                <div>
                  <img src={`https:${day.day.condition.icon}`} alt="icon" className="weather-icon" />
                  {day.day.condition.text}
                </div>
                <div>{isCelsius ? `${day.day.avgtemp_c}°C` : `${day.day.avgtemp_f}°F`}</div>
              </div>
            ))}
          </div>

          <ForecastGraph forecast={forecast} isCelsius={isCelsius} />

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '15px',
            marginTop: '25px',
            marginBottom: '25px',
            padding: '10px'
          }}>
            <button onClick={() => setIsCelsius(!isCelsius)} style={{
                padding: "12px 20px",
                borderRadius: "25px",
                border: "none",
                backgroundColor: "#00e5ff",
                color: "#000",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0, 229, 255, 0.4)",
                transition: "all 0.3s ease",
                flexShrink: 0
            }}>🌡️ {t("switch_temp")}</button>
            <button onClick={speakResult} disabled={speaking} style={{
                padding: "12px 20px",
                borderRadius: "25px",
                border: "none",
                backgroundColor: "#00e5ff",
                color: "#000",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0, 229, 255, 0.4)",
                transition: "all 0.3s ease",
                flexShrink: 0
            }}>🔊 {t("speak_result")}</button>
            <button onClick={getAiTip} style={{
                padding: "12px 20px",
                borderRadius: "25px",
                border: "none",
                backgroundColor: "#00e5ff",
                color: "#000",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0, 229, 255, 0.4)",
                transition: "all 0.3s ease",
                flexShrink: 0
            }}>💡 {t("get_tip")}</button>
            <button onClick={getClothingSuggestion} style={{
                padding: "12px 20px",
                borderRadius: "25px",
                border: "none",
                backgroundColor: "#00e5ff",
                color: "#000",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0, 229, 255, 0.4)",
                transition: "all 0.3s ease",
                flexShrink: 0
            }}>👕 {t("Suggest Clothing")}</button>
            <button onClick={getAiTravelSuggestion} style={{
                padding: "12px 20px",
                borderRadius: "25px",
                border: "none",
                backgroundColor: "#00e5ff",
                color: "#000",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0, 229, 255, 0.4)",
                transition: "all 0.3s ease",
                flexShrink: 0
            }}>✈️ {t("AI Travel Suggestion")}</button>
            <button onClick={exportToPDF} disabled={isExporting} style={{
                padding: "12px 20px",
                borderRadius: "25px",
                border: "none",
                backgroundColor: "#00e5ff",
                color: "#000",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0, 229, 255, 0.4)",
                transition: "all 0.3s ease",
                flexShrink: 0
            }}>
              📄 {isExporting ? t("exporting_pdf") : t("Export PDF")}
            </button>
          </div>

          {aiTip && (
            <div className="ai-tip-box">
              <div className="tip-title">{t("weather_tip")}</div>
              <div className="tip-content">{aiTip}</div>
            </div>
          )}

          {aiClothing && (
            <div className="ai-tip-box">
              <div className="tip-title">👕 {t("clothing_suggestion_title")}</div>
              <div className="tip-content">{aiClothing}</div>
            </div>
          )}
          {aiTravel && (
            <div className="ai-tip-box">
              <div className="tip-title">✈️ {t("travel_suggestion_title")}</div>
              <div className="tip-content">{aiTravel}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;