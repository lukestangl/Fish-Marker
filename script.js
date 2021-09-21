// Remember, we're gonna use strict mode in all scripts now!
'use strict';

// Lat/Long for Washington DC
/*
const DEFAULT_MAP_LONG = -77.050636;
const DEFAULT_MAP_LAT =  38.889248;
*/
const DEFAULT_MAP_LONG = -81.00000;
const DEFAULT_MAP_LAT = 24.7260;
const EARTH_R = 3958.756;
const PI_DIV_180 = 0.017453292519943295;  
const DATE_OPTIONS = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

const formDisplay = document.querySelector('.modal');
const overlayDisplay = document.querySelector('.overlay');
const form = document.querySelector('.form');
const formLat = document.querySelector('.form__lat');
const formLong = document.querySelector('.form__long');
const formRating = document.querySelector('.form__rating'); 
const formFish = document.querySelector('.form__fish');
const markList = document.querySelector('.list__marks');
const formComment = document.querySelector('.form__comments');

let userLat;
let userLong;

function closeModule() {
  formDisplay.classList.add('hidden');
  overlayDisplay.classList.add('hidden');
}
function openModule() {
  formDisplay.classList.remove('hidden');
  overlayDisplay.classList.remove('hidden');
}

form.addEventListener('submit', addEntry.bind(this));
form.addEventListener('reset', closeModule);


let fishingSpots = new Array();
let map;

class FishSpot {
    id = Date.now();
    date = new Date();

    constructor (rating, numFish, lat, lng, comment, {fahrenheit}) {
        this.rating = rating;
        this.numFish = numFish;
        this.lat = lat;
        this.lng = lng;
        this.comment = comment;
        this.fahrenheit = fahrenheit.toFixed(0);
    } 
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
    loadMap.bind(this),
    function () {
        alert('Cannot access your current position');
        loadMap();
    }
)}
else {
    alert('Your browser is not compatable with this website')
}


function weather(lat, lng) {
    const api = "94dfa18b4b8f1585f15fadb3c6b325c5";
    const base = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${api}&units=metric`;

    // Using fetch to get data
    return fetch(base)
        .then((response) => {
        return response.json();
        })
        .then((data) => {
        const { temp } = data.main;
        const { icon } = data.weather[0];

        const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;
        const fahrenheit = (temp * 9) / 5 + 32;
        
        return {iconUrl, fahrenheit}
        });
}


/*function weather(lat, lng) {
    var url1 = 'https://cors-anywhere.herokuapp.com/'
    var url = `https://www.metaweather.com/api/location/search/?lattlong=${lat},${lng}`;

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", console.log('What'))
    oReq.open("GET", url1 + url);
    oReq.send();


};

weather(10,10);
*/
function renderSpinner() {
  const markup = `
    <div class="spinner">
      <svg>
        <use href="Icon.png"></use>
      </svg>
    </div>
  `;
  this._clear();
  this._parentElement.insertAdjacentHTML('afterbegin', markup);
}

function loadMap (Pos) {
    if (Pos) {
       userLat = Pos.coords.latitude;
       userLong = Pos.coords.longitude;
    }

    map = L.map('mapid').setView([userLat || DEFAULT_MAP_LAT, userLong || DEFAULT_MAP_LONG], 13);
    
    /*L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map); */

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map); 

    map.on('click', saveLatLong.bind(this))

}
function saveLatLong(pos) {
  formLat.value = pos.latlng.lat.toFixed(3);
  formLong.value = pos.latlng.lng.toFixed(3);
  openModule();
}

function addSideMark(mark) {
  
  const html = 
  `<li class="side__entries">
    <h3>${mark.date.toLocaleDateString("en-US", DATE_OPTIONS)}</h2>
    <div>
      <span>${mark.rating}</span>
    </div>
    <div class="mid__row">` + (mark.numFish && `
      <span class="side__emoji">
        <span class='icon_row'>🐟</span>
        <span class='val_row text_row'>${mark.numFish}</span>
      </span>`) +
      `<span class="side__emoji">
        <span class="icon_row">☀️</span>
        <span class="val_row">${mark.fahrenheit}</span>
        <span class="text_row">°F</span>            
      </span>
      <span class="side__emoji">
        <span class="icon_row">📍</span> 
        <span class="val_row text_row">${distance(mark.lat, mark.lng, userLat, userLong)}</span>
      </span>
    </div>
    <div>
      <span>${mark.comment}</span>
    </div>
  </li>`

  markList.insertAdjacentHTML('beforeend', html);
}

function addEntry(e) {
    
    e.preventDefault();

    weather(formLat.value,formLong.value ).then(weatherInfo => {
        console.log(formRating);
        const tempSpot = new FishSpot(formRating.value, formFish.value, formLat.value, formLong.value, formComment.value, weatherInfo);
        addSideMark(tempSpot);
        fishingSpots.push(tempSpot);
        addMarker(formLat.value, formLong.value, `${tempSpot.lat}° ${tempSpot.lng}°`);
        form.reset();
    });
    closeModule();
}
function addMarker(lat, lng, title) {

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        L.popup({
          maxWidth: 100,
          minWidth: 100,
          autoClose: false,
          closeOnClick: true,
          className : 'popupCustom'
        })
      )
      .setPopupContent(
        `${title}`
      )
      .openPopup();
}

function distance(lat1, lon1, lat2, lon2) {

  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * PI_DIV_180)/2 + 
          c(lat1 * PI_DIV_180) * c(lat2 * PI_DIV_180) * 
          (1 - c((lon2 - lon1) * PI_DIV_180))/2;
  const distance = 2 * EARTH_R * Math.asin(Math.sqrt(a));

  if (distance < 1) {
    return "less than a mile away"
  }
  if (distance > 100) {
    return "over 100 miles away"
  }
  if (Math.round(distance) === 1) {
    return "1 mile away"
  }
  return `${Math.round(distance)} miles away`;
}

function setLocalStorage() {
  localStorage.setItem('marks', JSON.stringify(fishingSpots));
}