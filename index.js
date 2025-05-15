const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const refreshBtn = document.getElementById("refreshBtn");
const themeToggle = document.getElementById("themeToggle");

const cityName = document.getElementById("cityName");
const flag = document.getElementById("flag");
const icon = document.getElementById("icon");
const description = document.getElementById("description");
const temperature = document.getElementById("temperature");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");
const clouds = document.getElementById("clouds");
const weatherCard = document.getElementById("weatherCard");

const loader = document.getElementById("loader");
const error = document.getElementById("error");

const historyList = document.getElementById("historyList");

let currentCity = "";

function showLoader(state) {
  loader.classList.toggle("hidden", !state);
}

function showError(message = "") {
  error.textContent = message;
  error.classList.toggle("hidden", !message);
  weatherCard.classList.add("hidden");
}

function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem("weatherHistory", JSON.stringify(history));
  }
  renderHistory();
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  historyList.innerHTML = "";
  history.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.onclick = () => fetchWeather(city);
    historyList.appendChild(li);
  });
}

async function fetchWeather(city) {
  showLoader(true);
  showError("");
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) throw new Error("City not found!");
    const data = await response.json();
    currentCity = city;

    cityName.textContent = data.name;
    flag.src = `https://flagsapi.com/${data.sys.country}/flat/64.png`;
    icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    description.textContent = data.weather[0].description;
    temperature.textContent = `${data.main.temp.toFixed(1)} °C`;
    wind.textContent = `${data.wind.speed} m/s`;
    humidity.textContent = `${data.main.humidity}%`;
    clouds.textContent = data.clouds && data.clouds.all !== undefined ? `${data.clouds.all}%` : "N/A";

    weatherCard.classList.remove("hidden");
    saveToHistory(city);
  } catch (err) {
    showError(err.message);
  }
  showLoader(false);
}

function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    showLoader(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      fetchWeather(data.name);
    } catch (err) {
      showError("Failed to detect location.");
    }
    showLoader(false);
  });
}

searchBtn.onclick = () => {
  if (cityInput.value.trim()) {
    fetchWeather(cityInput.value.trim());
    cityInput.value = "";
  }
};

cityInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchBtn.click();
});

geoBtn.onclick = getLocationWeather;
refreshBtn.onclick = () => fetchWeather(currentCity);
themeToggle.onclick = () => document.body.classList.toggle("dark-mode");

renderHistory();
