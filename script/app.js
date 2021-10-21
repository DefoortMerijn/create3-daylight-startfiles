// _ = helper functions
const API_KEY = `e3d23dd949fb859736684fd1572ae1c1`;
const nul = '0';
function _parseMillisecondsIntoReadableTime(timestamp) {
  //Get hours from milliseconds
  const date = new Date(timestamp * 1000);
  // Hours part from the timestamp
  const hours = '0' + date.getHours();
  // Minutes part from the timestamp
  const minutes = '0' + date.getMinutes();
  // Seconds part from the timestamp (gebruiken we nu niet)
  // const seconds = '0' + date.getSeconds();

  // Will display time in 10:30(:23) format
  return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

// 5 TODO: maak updateSun functie
const updateSun = (sun, left, bottom, today) => {
  sun.style.setProperty('--global-sun-position-left', `${left}%`);
  sun.style.setProperty('--global-sun-position-bottom', `${bottom}%`);
  sun.setAttribute('data-time', `${today.getHours()}:${today.getMinutes()}`);
};

let itBeNight = () => {
  console.log(document.documentElement);
  document.querySelector('html').classList.add('is-night');
};
// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
const placeSunAndStartMoving = (totalMinutes, sunrise) => {
  // In de functie moeten we eerst wat zaken ophalen en berekenen.
  // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
  const sun = document.querySelector('.js-sun'),
    minutesleft = document.querySelector('.js-time-left');

  let today = new Date(),
    sunriseDate = new Date(today.getTime() - sunrise * 1000);
  // Bepaal het aantal minuten dat de zon al op is.
  let sunUp = sunriseDate.getHours() * 60 + sunriseDate.getMinutes();
  console.log(sunUp);
  let percentage = (100 / totalMinutes) * sunUp,
    sunleft = percentage,
    sunbottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2;
  // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
  updateSun(sun, sunleft, sunbottom, today);
  // We voegen ook de 'is-loaded' class toe aan de body-tag.
  const body = document.querySelector('body');
  body.classList.add('is-loaded');
  // Vergeet niet om het resterende aantal minuten in te vullen.
  minutesleft.innerHTML = totalMinutes - sunUp;

  const t = setInterval(() => {
    today = new Date();

    if (sunUp < 0) {
      itBeNight();
    } else if (sunUp > totalMinutes) {
      clearInterval(t);
      itBeNight();

      minutesleft.innerHTML = nul;
    } else if (sunUp < totalMinutes) {
      percentage = (100 / totalMinutes) * sunUp;
      sunleft = percentage;
      sunbottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2;
      updateSun(sun, sunleft, sunbottom, today);
      minutesleft.innerHTML = totalMinutes - sunUp;
      sunUp++;
    }
  }, 60000);
  // Nu maken we een functie die de zon elke minuut zal updaten
  // Bekijk of de zon niet nog onder of reeds onder is
  // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
  // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
};

// 3 Met de data van de API kunnen we de app opvullen
const showResult = (queryResponse) => {
  // We gaan eerst een paar onderdelen opvullen
  console.log(queryResponse.city.name, _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise), _parseMillisecondsIntoReadableTime(queryResponse.city.sunset));
  // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
  const location = document.querySelector('.js-location');
  location.innerHTML = `${queryResponse.city.name}, ${queryResponse.city.country}`;
  // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
  const sunrise = document.querySelector('.js-sunrise');
  sunrise.innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);

  const sunset = document.querySelector('.js-sunset');
  sunset.innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset);
  // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
  const timeDifference = new Date(queryResponse.city.sunset * 1000 - queryResponse.city.sunrise * 1000);

  placeSunAndStartMoving(timeDifference.getHours() * 60 + timeDifference.getMinutes(), queryResponse.city.sunrise);
  // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
const getAPI = async (lat, lon) => {
  // Eerst bouwen we onze url op
  const endpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=nl&cnt=1`;
  await fetch(endpoint) // Met de fetch API proberen we de data op te halen.
    .then((response) => response.json())
    .then((data) => showResult(data));

  // Als dat gelukt is, gaan we naar onze showResult functie.
};

document.addEventListener('DOMContentLoaded', function () {
  // 1 We will query the API with longitude and latitude.
  getAPI(50.8027841, 3.2097454);
});
