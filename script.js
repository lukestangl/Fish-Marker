// Remember, we're gonna use strict mode in all scripts now!
'use strict';

// Lat/Long for Washington DC
/*
const DEFAULT_MAP_LONG = -77.050636;
const DEFAULT_MAP_LAT =  38.889248;
*/
const DEFAULT_MAP_LONG = -81.00000;
const DEFAULT_MAP_LAT = 24.7260;


let fishingSpots = new Array();
let map;

class FishSpot {
    id = Date.now()
    date = Date()

    constructor (rating, numFish, lat, lng, weatherInfo) {
        this.rating = rating;
        this.numFish = numFish;
        this.lat = lat;
        this.lng = lng;
        this.weather = weatherInfo;
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


  function openForm() {
    document.getElementById("myForm").style.display = "block";
  }
  
  function closeForm() {
    document.getElementById("myForm").style.display = "none";
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

function loadMap (Pos) {
    if (Pos) {
        map = L.map('mapid').setView([Pos.coords.latitude, Pos.coords.longitude], 13);
    }
    else {
        map = L.map('mapid').setView([DEFAULT_MAP_LAT, DEFAULT_MAP_LONG], 13);
    }
    
    /*L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map); */

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map); 

    map.on('click', addEntry.bind(this))

}
function addEntry(pos) {

    let title = "Fishing Entry";
    let rating = "5";
    let numFish = 5;

    weather(pos.latlng.lat,pos.latlng.lng).then(weatherInfo => {
        const tempSpot = new FishSpot(rating, numFish, pos.latlng.lat, pos.latlng.lng, weatherInfo )
        
        fishingSpots.push(tempSpot);
        openForm();
        addMarker(pos.latlng.lat, pos.latlng.lng, title);
    })
    
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
