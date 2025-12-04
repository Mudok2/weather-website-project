// Configuration
// process.env를 사용하여 Vercel에 설정된 환경 변수를 불러옵니다.
const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY; 
const API_BASE_URL = 'https://api.openweathermap.org';

// State
let currentLocation = { lat: 40.4168, lon: -3.7038 }; // Default: Madrid
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let weatherData = null;

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadWeather();
});

// Event Listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchResults.classList.add('hidden');
        }, 200);
    });
}

// Weather API Functions
async function loadWeather() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/data/2.5/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const current = await response.json();

        // Get forecast
        const forecastResponse = await fetch(
            `${API_BASE_URL}/data/2.5/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${API_KEY}&units=metric`
        );
        
        const forecast = await forecastResponse.json();

        weatherData = {
            current,
            forecast: forecast.list
        };

        updateWeatherDisplay();
    } catch (error) {
        console.error('Error loading weather:', error);
        showError('Failed to load weather data. Please check your API key.');
    }
}

function updateWeatherDisplay() {
    if (!weatherData) return;

    const current = weatherData.current;

    // Update current weather
    document.getElementById('city-name').textContent = current.name;
    document.getElementById('current-temp').textContent = `${Math.round(current.main.temp)}°`;
    document.getElementById('feels-like').textContent = `${Math.round(current.main.feels_like)}°`;
    document.getElementById('wind-speed').textContent = `${current.wind.speed.toFixed(1)} km/h`;
    document.getElementById('humidity').textContent = `${current.clouds.all}%`;
    document.getElementById('rain-chance').textContent = `Chance of rain: ${current.clouds.all}%`;
    document.getElementById('uv-index').textContent = '3'; // Not available in free tier

    // Update weather icon
    updateWeatherIcon(current.weather[0].id);

    // Update hourly forecast
    updateHourlyForecast();

    // Update daily forecast
    updateDailyForecast();
}

function updateWeatherIcon(weatherId) {
    const iconElement = document.getElementById('weather-icon');
    iconElement.innerHTML = getWeatherIconLarge(weatherId);
}

function getWeatherIconLarge(weatherId) {
    if (weatherId >= 200 && weatherId < 300) {
        // Thunderstorm
        return `
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
                <defs>
                    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#6b7280;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#4b5563;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <path d="M25 55 Q25 45 35 45 Q40 35 50 35 Q65 35 70 50 Q80 52 80 65 Q80 80 65 80 L25 80 Q15 80 15 70 Q15 58 25 55 Z" fill="url(#cloudGrad)" stroke="none"/>
                <path d="M40 85 L35 95" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
                <path d="M55 85 L50 95" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
            </svg>
        `;
    } else if (weatherId >= 300 && weatherId < 400) {
        // Drizzle
        return `
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
                <defs>
                    <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#9ca3af;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6b7280;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <path d="M25 50 Q25 40 35 40 Q40 30 50 30 Q65 30 70 45 Q80 47 80 60 Q80 75 65 75 L25 75 Q15 75 15 65 Q15 53 25 50 Z" fill="url(#cloudGrad2)" stroke="none"/>
                <line x1="30" y1="80" x2="28" y2="88" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>
                <line x1="45" y1="80" x2="43" y2="88" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>
                <line x1="60" y1="80" x2="58" y2="88" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
    } else if (weatherId >= 500 && weatherId < 600) {
        // Rain
        return `
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
                <defs>
                    <linearGradient id="cloudGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#6b7280;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#4b5563;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <path d="M25 50 Q25 40 35 40 Q40 30 50 30 Q65 30 70 45 Q80 47 80 60 Q80 75 65 75 L25 75 Q15 75 15 65 Q15 53 25 50 Z" fill="url(#cloudGrad3)" stroke="none"/>
                <line x1="25" y1="80" x2="20" y2="92" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
                <line x1="40" y1="80" x2="35" y2="92" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
                <line x1="55" y1="80" x2="50" y2="92" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
                <line x1="70" y1="80" x2="65" y2="92" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
    } else if (weatherId >= 600 && weatherId < 700) {
        // Snow
        return `
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
                <defs>
                    <linearGradient id="cloudGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#cbd5e1;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#94a3b8;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <path d="M25 50 Q25 40 35 40 Q40 30 50 30 Q65 30 70 45 Q80 47 80 60 Q80 75 65 75 L25 75 Q15 75 15 65 Q15 53 25 50 Z" fill="url(#cloudGrad4)" stroke="none"/>
                <circle cx="30" cy="85" r="2.5" fill="#e0f2fe"/>
                <circle cx="45" cy="85" r="2.5" fill="#e0f2fe"/>
                <circle cx="60" cy="85" r="2.5" fill="#e0f2fe"/>
                <circle cx="75" cy="85" r="2.5" fill="#e0f2fe"/>
            </svg>
        `;
    } else if (weatherId === 800) {
        // Clear/Sunny
        return `
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="50" cy="40" r="22" fill="#fbbf24" stroke="none"/>
                <line x1="50" y1="8" x2="50" y2="2" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
                <line x1="50" y1="78" x2="50" y2="84" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
                <line x1="78" y1="40" x2="84" y2="40" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
                <line x1="22" y1="40" x2="16" y2="40" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
                <line x1="72" y1="16" x2="76" y2="12" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
                <line x1="28" y1="68" x2="24" y2="72" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
                <line x1="72" y1="64" x2="76" y2="68" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
                <line x1="28" y1="16" x2="24" y2="12" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
            </svg>
        `;
    } else if (weatherId > 800) {
        // Cloudy
        return `
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
                <defs>
                    <linearGradient id="cloudGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#d1d5db;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#9ca3af;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <path d="M25 55 Q25 45 35 45 Q40 35 50 35 Q65 35 70 50 Q80 52 80 65 Q80 80 65 80 L25 80 Q15 80 15 70 Q15 58 25 55 Z" fill="url(#cloudGrad5)" stroke="none"/>
            </svg>
        `;
    } else {
        // Default
        return `
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="50" cy="40" r="22" fill="#fbbf24" stroke="none"/>
            </svg>
        `;
    }
}

function updateHourlyForecast() {
    const hourlyContainer = document.getElementById('hourly-forecast');
    hourlyContainer.innerHTML = '';

    // Get next 6 forecast items (3-hour intervals)
    const hourlyData = weatherData.forecast.slice(0, 6);

    hourlyData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const temp = Math.round(item.main.temp);
        const weatherId = item.weather[0].id;

        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <div class="hourly-time">${time}</div>
            <div class="hourly-icon">${getWeatherIconSmall(weatherId)}</div>
            <div class="hourly-temp">${temp}°</div>
        `;
        hourlyContainer.appendChild(hourlyItem);
    });
}

function updateDailyForecast() {
    const dailyContainer = document.getElementById('daily-forecast');
    dailyContainer.innerHTML = '';

    // Group forecast by day
    const dailyMap = new Map();
    weatherData.forecast.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyMap.has(date)) {
            dailyMap.set(date, {
                dt: item.dt,
                temps: [item.main.temp],
                weather: item.weather[0],
                description: item.weather[0].description
            });
        } else {
            dailyMap.get(date).temps.push(item.main.temp);
        }
    });

    // Display first 7 days
    Array.from(dailyMap.values()).slice(0, 7).forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const minTemp = Math.round(Math.min(...day.temps));
        const maxTemp = Math.round(Math.max(...day.temps));

        const dailyItem = document.createElement('div');
        dailyItem.className = 'daily-item';
        dailyItem.innerHTML = `
            <div class="daily-day">${dayName}</div>
            <div class="daily-icon">${getWeatherIconSmall(day.weather.id)}</div>
            <div class="daily-description">${day.description}</div>
            <div class="daily-temps">${maxTemp}/${minTemp}</div>
        `;
        dailyContainer.appendChild(dailyItem);
    });
}

function getWeatherIconSmall(weatherId) {
    if (weatherId >= 200 && weatherId < 300) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 20 L12 14 L10 18 L18 8 L15 14 L18 16 L12 20 Z" fill="#fbbf24"/></svg>`;
    } else if (weatherId >= 300 && weatherId < 400) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 14 Q6 10 10 10 Q12 6 16 6 Q22 6 24 12 Q24 18 18 18 L8 18 Q4 18 4 14 Q4 10 6 14 Z" fill="#9ca3af"/></svg>`;
    } else if (weatherId >= 500 && weatherId < 600) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 14 Q6 10 10 10 Q12 6 16 6 Q22 6 24 12 Q24 18 18 18 L8 18 Q4 18 4 14 Q4 10 6 14 Z" fill="#6b7280"/><line x1="8" y1="20" x2="6" y2="24" stroke="#3b82f6" stroke-width="1.5"/><line x1="14" y1="20" x2="12" y2="24" stroke="#3b82f6" stroke-width="1.5"/><line x1="20" y1="20" x2="18" y2="24" stroke="#3b82f6" stroke-width="1.5"/></svg>`;
    } else if (weatherId >= 600 && weatherId < 700) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 14 Q6 10 10 10 Q12 6 16 6 Q22 6 24 12 Q24 18 18 18 L8 18 Q4 18 4 14 Q4 10 6 14 Z" fill="#cbd5e1"/><circle cx="9" cy="21" r="1.5" fill="#e0f2fe"/><circle cx="15" cy="21" r="1.5" fill="#e0f2fe"/><circle cx="21" cy="21" r="1.5" fill="#e0f2fe"/></svg>`;
    } else if (weatherId === 800) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8" fill="#fbbf24"/></svg>`;
    } else {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 14 Q6 10 10 10 Q12 6 16 6 Q22 6 24 12 Q24 18 18 18 L8 18 Q4 18 4 14 Q4 10 6 14 Z" fill="#d1d5db"/></svg>`;
    }
}

// Search Functions
async function handleSearch(e) {
    const query = e.target.value.trim();
    if (!query) {
        searchResults.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
        );
        const cities = await response.json();

        searchResults.innerHTML = '';
        cities.forEach(city => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="search-result-name">${city.name}</div>
                <div class="search-result-country">${city.state ? city.state + ', ' : ''}${city.country}</div>
            `;
            item.addEventListener('click', () => {
                currentLocation = { lat: city.lat, lon: city.lon };
                searchInput.value = '';
                searchResults.classList.add('hidden');
                loadWeather();
            });
            searchResults.appendChild(item);
        });

        searchResults.classList.remove('hidden');
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showError(message) {
    const container = document.querySelector('.page-container');
    if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background-color: #fee2e2;
            color: #991b1b;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;
        `;
        errorDiv.textContent = message;
        container.insertBefore(errorDiv, container.firstChild);
    }
}
