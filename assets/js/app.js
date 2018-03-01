'use strict';

$(document).ready(function() {
  // Vista Día
  $('#locate').click(function() {
    $('#initial').hide();
    $('#second').show();
    $('#week').hide();
  });

  $('#refresh').click(function() {
    window.location.reload(true);
  });
  
  // Vista Semana
  $('#weekBtn').click(function() {
    $('#initial').hide();
    $('#second').hide();
    $('#week').show();
  });

  $('#back').click(function() {
    $('#initial').hide();
    $('#second').show();
    $('#week').hide();
  });

  // API UNSPLASH: 
  $.ajax({
    url: 'https://api.unsplash.com/photos/random',
    datatype: 'json',
    type: 'GET',
    data: {
      client_id: 'a6754a2085f644043bcc28c43a1258e2beec1ec487afc627e352d4585ed020e4',
      query: 'summer, scenery'
    }
  })
    .done(function(response) {
      console.log(response);
      console.log(response.links.html);
      const data = response;
      $('.unsplash').css('background-image', `url(${data.urls.regular})`);
      $('.unsplash').addClass('photo');
    })
    .fail(function(error) {
      console.log('error al cargar la api');
      $('.unsplash').css({
        'background-color': '#212121',
      });
    });
});

// Geolocalización usuario
$('#locate').click(function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    $('#userLocation').append = 'Este navegador no soporta geolocalización.';
  }
});

function showPosition(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  let location = '';
  
  // Geocodificación inversa (devuelve una localidad para la posición):                            
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=locality&key=AIzaSyD3ITDAeNFr0MvgoNVODFh0JJHIxdbch_M`)                          
    .then(function(response) {
      return response.json();
    })
    .then(function(data3) {
      location = data3.results[0].address_components[0].short_name;
    });  

  // Genera el pronóstico para la ubicación del usuario:
  fetch(`https://api.darksky.net/forecast/ddd476a250882ec17bf7b60f9d91689e/${latitude},${longitude}?lang=es&units=auto`)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log(data);
      const actual = data.currently;
      const daily = data.daily.data;

      // Datos actuales:
      let icon = actual.icon;
      let summary = actual.summary;
      let temperature = parseInt(actual.temperature);
      let apparent = parseInt(actual.apparentTemperature); // sensación térmica
      let precipProb = actual.precipProbability * 100; // probabilidad de precipitaciones
      let humidity = actual.humidity * 100;
      let uvIndex = actual.uvIndex; // indice UV
      let windSpeed = actual.windSpeed; // velocidad del viento
      let tempMax = parseInt(daily[0].temperatureMax);
      let tempMin = parseInt(daily[0].temperatureMin);

      // Genera contenidos dinámicos vista Día Actual
      $('#actual').append(`
        <div class="row">  
          <div class="col s12 center">
            <p class="city">${location}<p>
          </div>
          <div>  
            <canvas id="iconActual" width="128" height="128"></canvas>
          </div>
          <div class="center temperature">  
            <p>${temperature} °</p>
          </div>
          <div class="col s12 center summary">  
            <p>${summary}</p>
          </div>
        </div>
        <div class="row">  
          <div class="col s7 left-align detailWeather">
            <p class="data">Temperatura ambiente</p>
          </div>
          <div class="col s5 rigth-align detailWeather">
            <p class="data">${apparent} °C</p>
          </div>
        </div>
        <div class="row">  
          <div class="col s7 left-align detailWeather">
            <p class="data">Probabilidad de lluvia</p>
          </div>
          <div class="col s5 rigth-align detailWeather">
            <p class="data">${precipProb} %</p>
          </div>
        </div>
        <div class="row">  
          <div class="col s7 left-align detailWeather">
            <p class="data">Humedad ambiente</p> 
          </div>
          <div class="col s5 rigth-align detailWeather">
            <p class="data">${humidity} %</p>
          </div>
        </div>
        <div class="row">  
          <div class="col s7 left-align detailWeather">
            <p class="data">Índice UV</p>
          </div>
          <div class="col s5 rigth-align detailWeather">
            <p class="data">${uvIndex}</p>
          </div>
        </div>
        <div class="row">  
          <div class="col s7 left-align detailWeather">
            <p class="data">Velocidad del viento</p> 
          </div>
          <div class="col s5 rigth-align detailWeather">
            <p class="data">${windSpeed} km/hr</p>
          </div>
        </div>         
      `);

      // Agrega ícono actual:
      const skycons = new Skycons({ 
        'color': 'rgba(255, 255, 255, 0.6)',
        'resizeClear': true
      });
      skycons.add('iconActual', icon);
      skycons.play();

      // PRONÓSTICO SEMANAL
      let weekForecast = daily.map(el => {
        let dayWeek = convertUnixDate(el.time);
        let minTempDay = parseInt(el.temperatureMin);
        let maxTempDay = parseInt(el.temperatureMax);
        let iconDay = el.icon;

        // Genera contenido dinámico Week Forecast:
        $('#days').append(`
          <div class="row">
            <div class="col s6 left-align"><p class="data">${dayWeek}</p></div>
            <div class="col s6 right-align"><p class="data">mín ${minTempDay}° - ${maxTempDay}° máx</p></div>
          </div>  
        `);

        // Agrega ícono diario:
        const skycons = new Skycons({
          'color': 'rgba(255, 255, 255, 0.6)',
          'resizeClear': false
        });
        skycons.add('iconWeek', `${iconDay}`);
        skycons.play();

      });
      
      function convertUnixDate(unix) {
        let timestamp = unix;
        let pubDate = new Date(timestamp * 1000);
        const week = new Array('Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sáb');
        let formattedDate = week[pubDate.getDay()] + ' ' + pubDate.getDate();
        return formattedDate;
      }
    });
}