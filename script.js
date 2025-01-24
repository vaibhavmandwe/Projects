// Replace with your OpenWeatherMap API key
const API_KEY = '429485bf4517b41c09bbe9800bd70a1d';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorBox = document.getElementById('error-box');
const weatherBox = document.getElementById('weather-box');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherIcon = document.getElementById('weather-icon');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const suggestionsContainer = document.getElementById('suggestions-container');

// Cities data (we'll use this for suggestions)
let cities = [];

// Fetch cities data from a JSON file
async function fetchCities() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json');
        cities = await response.json();
    } catch (error) {
        console.error('Error loading cities:', error);
    }
}

// Initialize cities data
fetchCities();

// Debounce function to limit API calls
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

// Function to show suggestions
function showSuggestions(input) {
    if (!input) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('active');
        return;
    }

    const matchingCities = cities
        .filter(city => 
            city.name.toLowerCase().startsWith(input.toLowerCase()) ||
            city.name.toLowerCase().includes(input.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions

    if (matchingCities.length > 0) {
        suggestionsContainer.innerHTML = matchingCities
            .map(city => `
                <div class="suggestion-item" data-city="${city.name}">
                    <span class="city-name">${city.name}</span>
                    <span class="country-name">${city.country}</span>
                </div>
            `)
            .join('');
        suggestionsContainer.classList.add('active');
    } else {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('active');
    }
}

// Event listener for input changes
cityInput.addEventListener('input', debounce((e) => {
    showSuggestions(e.target.value);
}, 300));

// Event listener for suggestion clicks
suggestionsContainer.addEventListener('click', (e) => {
    const suggestionItem = e.target.closest('.suggestion-item');
    if (suggestionItem) {
        const cityName = suggestionItem.dataset.city;
        cityInput.value = cityName;
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('active');
        getWeather();
    }
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        suggestionsContainer.classList.remove('active');
    }
});

// Event Listeners
searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        suggestionsContainer.classList.remove('active');
        getWeather();
    }
});

// Function to fetch weather data
async function getWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
        console.log('Fetching weather from:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                showError('API key error. Please wait a few minutes for the API key to activate.');
            } else if (response.status === 404) {
                showError('City not found. Please check the spelling and try again.');
            } else {
                showError(`Error: ${data.message || 'Something went wrong'}`);
            }
            console.error('API Error:', response.status, data);
            hideWeather();
            return;
        }

        console.log('Weather data:', data);
        displayWeather(data);
        hideError();
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please check your internet connection.');
        hideWeather();
    }
}

// Function to display weather data
function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = Math.round(data.main.temp);
    weatherDescription.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    
    // Set weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    // Show weather box
    weatherBox.style.display = 'block';
    
    // Update background based on weather condition (optional)
    updateBackground(data.weather[0].main);
}

// Function to show error message
function showError(message) {
    errorBox.style.display = 'block';
    errorBox.querySelector('p').textContent = message;
}

// Function to hide error message
function hideError() {
    errorBox.style.display = 'none';
}

// Function to hide weather box
function hideWeather() {
    weatherBox.style.display = 'none';
}

// Function to update background based on weather condition (optional)
function updateBackground(weatherCondition) {
    const body = document.body;
    let gradient;

    switch (weatherCondition.toLowerCase()) {
        case 'clear':
            gradient = 'linear-gradient(135deg, #00feba, #5b548a)';
            break;
        case 'clouds':
            gradient = 'linear-gradient(135deg, #7f8c8d, #34495e)';
            break;
        case 'rain':
        case 'drizzle':
            gradient = 'linear-gradient(135deg, #3498db, #2c3e50)';
            break;
        case 'thunderstorm':
            gradient = 'linear-gradient(135deg, #2c3e50, #1a1a1a)';
            break;
        case 'snow':
            gradient = 'linear-gradient(135deg, #ecf0f1, #bdc3c7)';
            break;
        default:
            gradient = 'linear-gradient(135deg, #00feba, #5b548a)';
    }

    body.style.background = gradient;
}
