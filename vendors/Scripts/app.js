// =================================================  Global Variables  =================================================

let selectedArabicName = '';
let selectedEnglishName = '';
let selectedCountryCode = '';  
let selectedCity = ''; 

const apiKey = '9664840b5524df2d03337d7a40266358';
const dropdownButton = document.getElementById('dropdownDefaultButton');
const dropdownMenu = document.getElementById('dropdown');
const dropdownList = document.querySelector('#countryId');
const CityBtn = document.querySelector("#CityBtn");
const citiesList = document.querySelector('#citiesList');

const weatherCard = document.getElementById('weatherCard');
const countryNameElement = document.getElementById('countryName');
const cityNameElement = document.getElementById('cityName');
const weatherIconElement = document.getElementById('weatherIcon');
const weatherDescriptionElement = document.getElementById('weatherDescription');
const temperatureElement = document.getElementById('temperature');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('windSpeed');
const flagIconElement = document.getElementById('flagIcon');

// =================================================  Close Dropdown on Outside Click  =================================================

document.addEventListener('click', function(event) {
    if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.add('hidden');
    }

    const citiesDropdown = document.getElementById('CitiesDropDown');
    if (!CityBtn.contains(event.target) && !citiesDropdown.contains(event.target)) {
        citiesDropdown.classList.add('hidden');
    }
});

// =================================================  Fetching Countries  =================================================

dropdownButton.addEventListener('click', (event) => {
    event.stopPropagation(); 
    if (dropdownMenu.classList.contains('hidden')) {
        axios.get('https://restcountries.com/v3.1/all')
            .then(response => {
                const countries = response.data;
                dropdownList.innerHTML = ''; 

                countries.forEach(country => {
                    const arabicName = country.translations?.ara?.common || null;
                    const englishName = country.name.common;
                    const countryCode = country.cca2 ? country.cca2.toLowerCase() : ''; 

                    if (arabicName && countryCode) {
                        const listItem = document.createElement('li');
                        listItem.className = 'dropdown-item';
                        listItem.style.marginBottom = '10px';

                        const flagIcon = document.createElement('span');
                        flagIcon.className = `flag-icon flag-icon-${countryCode} mx-3`;

                        const nameText = document.createElement('span');
                        nameText.textContent = englishName;
                        nameText.classList.add('country-name');

                        listItem.setAttribute('data-english-name', englishName);
                        listItem.setAttribute('data-arabic-name', arabicName);
                        listItem.setAttribute('data-country-code', country.cca2);

                        listItem.addEventListener('click', event => {
                            event.preventDefault();
                            selectedEnglishName = listItem.getAttribute('data-english-name');
                            selectedArabicName = listItem.getAttribute('data-arabic-name');
                            selectedCountryCode = listItem.getAttribute('data-country-code');

                            dropdownButton.textContent = `  Your Location :  ${selectedEnglishName} `;
                            dropdownButton.appendChild(flagIcon.cloneNode(true));

                            dropdownMenu.classList.add('hidden'); 
                        });

                        listItem.appendChild(flagIcon);
                        listItem.appendChild(nameText);
                        dropdownList.appendChild(listItem);
                    }
                });
            })
            .catch(() => alert("Failed to load countries. Please try again later."));
    }
    dropdownMenu.classList.toggle('hidden');
});

// =================================================  Fetching Cities  =================================================

CityBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!selectedCountryCode) {
        alert('Please select a country first!');
        return;
    }
    fetchStates();  
});

function fetchStates() {
    axios.post('https://countriesnow.space/api/v0.1/countries/states', { country: selectedEnglishName })
        .then(response => {
            const states = response.data.data?.states || [];

            if (states.length === 0) {
                alert('No states available for this country.');
                return;
            }

            citiesList.innerHTML = '';

            states.forEach(state => {
                let cityName = state.name.replace(/Governorate/i, '').replace(/District/i, '').trim(); 
                const listItem = document.createElement('li');
                listItem.textContent = cityName; 
                listItem.classList.add('dropdown-item');
                listItem.style.marginBottom = '10px'; 
                
                listItem.addEventListener('click', event => {
                    event.preventDefault();
                    selectedCity = cityName;
                    CityBtn.textContent = selectedCity;
                    fetchWeatherData(selectedCity);
                    document.getElementById('CitiesDropDown').classList.add('hidden'); 
                });

                citiesList.appendChild(listItem);
            });

            document.getElementById('CitiesDropDown').classList.remove('hidden'); 
        })
        .catch(() => alert("Failed to load states. Please try again later."));
}

// =================================================  Fetch Weather Data  =================================================

function fetchWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    axios.get(apiUrl)
        .then(response => {
            const weatherData = response.data;
            countryNameElement.textContent = weatherData.sys.country;  
            cityNameElement.textContent = weatherData.name;
            weatherIconElement.src = getWeatherIcon(weatherData.weather[0].icon); 
            weatherDescriptionElement.textContent = weatherData.weather[0].description;
            temperatureElement.textContent = Math.round(weatherData.main.temp); 
            humidityElement.textContent = `${weatherData.main.humidity}%`; 
            windSpeedElement.textContent = `${weatherData.wind.speed} m/s`; 
            updateFlagIcon(selectedCountryCode.toLowerCase()); 
        })
        .catch(() => alert("Failed to load weather data. Please try again later."));
}
function getWeatherIcon(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`; 
}
function updateFlagIcon(countryCode) {
    flagIconElement.className = '';
    flagIconElement.classList.add('flag-icon', `flag-icon-${countryCode}`);
}
