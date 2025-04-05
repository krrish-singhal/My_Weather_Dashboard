
const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const cityEl = document.getElementById("city");
const countryEl = document.getElementById("country");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const weatherIconEl = document.getElementById("weather-icon");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const aqiLevelEl = document.getElementById("aqi-level");
const aqiTextEl = document.getElementById("aqi-text");
const forecastEl = document.getElementById("forecast");
const searchButton = document.getElementById("search-button");
const cityInput = document.getElementById("city-input");
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
function updateDateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const day = now.getDay();
  const date = now.getDate();
  const month = now.getMonth();
  timeEl.textContent = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  dateEl.textContent = `${days[day]}, ${date} ${months[month]}`;
}
setInterval(updateDateTime, 1000);
updateDateTime();
async function getWeatherData(city) {
  try {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    const weatherData = await weatherResponse.json();
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    const forecastData = await forecastResponse.json();
    const airQualityResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`
    );
    const airQualityData = await airQualityResponse.json();
    updateWeatherUI(weatherData);
    updateForecastUI(forecastData);
    updateAirQualityUI(airQualityData);
    document.querySelector(".app-container").style.opacity = "1";
  } catch (error) {
    console.error("Error fetching weather data:", error);
    cityEl.textContent = "City not found";
    countryEl.textContent = "Please try again";
  }
}
function updateWeatherUI(data) {
  cityEl.textContent = data.name;
  countryEl.textContent = data.sys.country;
  tempEl.textContent = Math.round(data.main.temp);
  conditionEl.textContent =
    data.weather[0].description.charAt(0).toUpperCase() +
    data.weather[0].description.slice(1);
  weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${Math.round(data.wind.speed)} km/h`;
  pressureEl.textContent = `${data.main.pressure} hPa`;
  const sunrise = new Date(data.sys.sunrise * 1000);
  const sunset = new Date(data.sys.sunset * 1000);
  sunriseEl.textContent = sunrise.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  sunsetEl.textContent = sunset.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function updateForecastUI(data) {
  forecastEl.innerHTML = "";
  const dailyForecasts = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );
  dailyForecasts.slice(0, 5).forEach((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = days[date.getDay()];
    const temp = Math.round(day.main.temp);
    const icon = day.weather[0].icon;
    const description =
      day.weather[0].description.charAt(0).toUpperCase() +
      day.weather[0].description.slice(1);
    forecastEl.innerHTML += `<div class="forecast-item"><span class="day">${dayName}</span><div class="forecast-info"><img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather"><span class="forecast-desc">${description}</span></div><span class="temp">${temp}°C</span></div>`;
  });
}
function updateAirQualityUI(data) {
  const aqi = data.list[0].main.aqi;
  const aqiColors = ["#22c55e", "#84cc16", "#eab308", "#ef4444", "#7c3aed"];
  const aqiTexts = ["Excellent", "Good", "Moderate", "Poor", "Very Poor"];
  aqiLevelEl.style.width = `${(aqi / 5) * 100}%`;
  aqiLevelEl.style.backgroundColor = aqiColors[aqi - 1];
  aqiTextEl.textContent = aqiTexts[aqi - 1];
}
searchButton.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    document.querySelector(".app-container").style.opacity = "0.6";
    setTimeout(() => getWeatherData(city), 1000);
  }
});
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) {
      document.querySelector(".app-container").style.opacity = "0.6";
      setTimeout(() => getWeatherData(city), 1000);
    }
  }
});
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
      );
      const [data] = await response.json();
      if (data) getWeatherData(data.name);
    } catch (error) {
      console.error("Error getting location:", error);
      getWeatherData("London");
    }
  });
} else {
  getWeatherData("London");
}
setTimeout
