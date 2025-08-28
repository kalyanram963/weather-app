☁️ My Weather App
A modern and interactive weather application built with React, providing real-time weather data, a 7-day forecast, AI-powered suggestions, and more.

✨ Features
Current Weather Display: ☀️ Get up-to-date weather conditions for any city.

7-Day Forecast: 🗓️ View a detailed temperature forecast for the upcoming week, including a graphical representation.

City Search & Suggestions: 🔍 Easily find cities with an intelligent auto-suggestion feature.

Geolocation: 📍 Automatically detect and display weather for your current location.

Unit Conversion: 🌡️ Seamlessly switch between Celsius and Fahrenheit.

Dark/Light Mode: 🌓 Toggle between different visual themes for comfortable viewing.

Speech Output: 🔊 Listen to the current weather summary.

AI-Powered Insights:

Weather Safety Tips: 💡 Get AI-generated safety advice based on current conditions.

Clothing Suggestions: 👕 Receive recommendations on what to wear.

Travel Destination Ideas: ✈️ Discover ideal travel spots based on the current weather.

Severe Weather Alerts: 🚨 Stay informed with official weather alerts.

Search History: 📚 Keep track of your recently searched cities.

PDF Export: 📄 Generate and download a PDF report of the current weather and forecast.

Multilingual Support: 🌐 The application is internationalized, supporting multiple languages (English, Hindi, Telugu, Tamil, Kannada, French, Spanish).

Interactive Map: 🗺️ View the selected city's location on an interactive map powered by Leaflet.

🛠️ Technologies Used
React: Frontend JavaScript library for building user interfaces.

Axios: Promise-based HTTP client for making API requests.

Recharts: A composable charting library built on React components for displaying forecast graphs.

React-Leaflet: React components for Leaflet maps.

jsPDF & html2canvas: For client-side PDF generation from HTML content.

react-i18next: Internationalization framework for React.

🌐 API Integrations
This application relies on several external APIs to fetch data and provide AI functionalities. Please note that you will need to obtain your own API keys for full functionality.

WeatherAPI.com:

Purpose: Current weather conditions, 7-day forecast, and weather alerts.

Key (example): 93ca131f7d3e4974813153729252106

OpenCage Data:

Purpose: Reverse geocoding (converting latitude/longitude to city names).

Key (example): a357b57b6ff24dd1a4583de681a66a74

WFT-Geo-DB (via RapidAPI):

Purpose: City suggestions during search.

Key (example): 5ef9d22ed9msh78774102cf1d2fep10dfdajsn3433516c332a

Google Gemini API (via generativelanguage.googleapis.com endpoint):

Purpose: AI-powered weather tips, clothing suggestions, and travel recommendations.

Key (placeholder): AIzaSyBUJ8utUD0DROMULBWSnUreZ6XJXv-OX0U

⚠️ IMPORTANT: This is a placeholder key. You MUST replace this with your actual Google Gemini API Key for AI features to work.

🚀 Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js (LTS version recommended)

npm or Yarn

Installation
Clone the repository:

git clone <your-repository-url>
cd my-weather-app

(Replace <your-repository-url> with the actual URL if this project is in a Git repository.)

Install dependencies:

npm install
# or
yarn install

Set up API Keys:
Open src/App.jsx and locate the API key declarations. It is crucial to replace the placeholder geminiApiKey with your actual Google Gemini API Key.

// In src/App.jsx
const geminiApiKey = "YOUR_ACTUAL_GEMINI_API_KEY"; // <--- REPLACE THIS!

Security Note: For a production environment, it's highly recommended to use environment variables (e.g., .env files with REACT_APP_GEMINI_API_KEY) and potentially a backend proxy to protect your API keys from being exposed in the client-side code.

Running the Application
Start the development server:

npm start
# or
yarn start

This will open the application in your browser at http://localhost:3000 (or another available port).

📂 Project Structure
my-weather-app/
├── public/
│   ├── index.html
│   └── weather_ai_logo.png  (Assumed logo file)
├── src/
│   ├── App.css              (Main CSS for the application's styling)
│   ├── App.jsx              (Core React component: handles state, API calls, and main layout)
│   ├── ForecastCard.jsx     (Component for displaying individual forecast days)
│   ├── ForecastGraph.jsx    (Component for the 7-day temperature chart visualization)
│   ├── index.css            (Global CSS styles for the application)
│   ├── index.js             (Entry point for the React application)
│   ├── MapView.jsx          (Component for displaying the interactive map)
│   ├── WeatherCard.jsx      (Component for displaying current weather details)
│   └── i18n/                (Internationalization setup, containing translation files)
│       └── i18n.js
├── package.json             (Project dependencies and scripts)
├── README.md                (This documentation file)
└── ...other configuration files

🤝 Contributing
Contributions are always welcome! If you have suggestions for improvements, find a bug, or want to add new features, please feel free to:

Fork the repository.

Create a new branch (git checkout -b feature/your-feature-name).

Make your changes.

Commit your changes (git commit -m 'feat: Add new feature X').

Push to the branch (git push origin feature/your-feature-name).

Open a Pull Request.

📝 License
This project is open source and available under the MIT License.

Made with ❤️ by kalyan ram