var map = tt.map({
  key: TOMTOMTOKEN,
  container: 'map',
  center: [24.9384, 60.1695], // Coordinates for Helsinki
  zoom: 6,
  // dragPan: !isMobileOrTablet()
});

// Set coordinates which cover the Europe and some surrounding areas
var southwest = new tt.LngLat(-25, 35); // Adjust as needed
var northeast = new tt.LngLat(45, 70);
var bounds = new tt.LngLatBounds(southwest, northeast);

map.on('load', function () {
  map.setMaxBounds(bounds);
});

map.addControl(new tt.FullscreenControl());
map.addControl(new tt.NavigationControl());

var markersOnTheMap = {};
var eventListenersAdded = false;

var points = products.features.map(function (point, index) {
  return {
    coordinates: [point.location.coordinates[0], point.location.coordinates[1]],

    properties: {
      id: index,
      name: point.deviceType,
      img: point.images.length > 0 ? point.images[0].url : 'images/icons/battery.jpg',
      productId: point._id,
    },
  };
});

var geoJson = {
  type: 'FeatureCollection',
  features: points.map(function (point) {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: point.coordinates,
      },
      properties: point.properties,
    };
  }),
};

let productCoordinatesAll = document.querySelectorAll('.product-coordinates');
productCoordinatesAll.forEach((item) => {
  item.addEventListener('click', (e) => {
    // Get a reference to the target div
    const targetDiv = document.getElementById('map');

    // Scroll to the target div
    targetDiv.scrollIntoView({
      behavior: 'smooth', // Add smooth scrolling animation
    });

    const productCoordinates = e.target.getAttribute('data-productCoordinates');
    const coordinatesArrayLngLat = productCoordinates.split(',');

    map.easeTo({
      center: coordinatesArrayLngLat,
      zoom: 12,
    });
  });
});

function refreshMarkers() {
  Object.keys(markersOnTheMap).forEach(function (id) {
    markersOnTheMap[id].remove();
    delete markersOnTheMap[id];
  });

  map.querySourceFeatures('point-source').forEach(function (feature) {
    if (feature.properties && !feature.properties.cluster) {
      var id = parseInt(feature.properties.id, 10);
      if (!markersOnTheMap[id]) {
        var markerElement = document.createElement('div');
        markerElement.className = 'marker';

        var markerContentElement = document.createElement('div');
        markerContentElement.className = 'marker-content';
        markerContentElement.style.backgroundColor = '#FF0000';
        markerElement.appendChild(markerContentElement);

        var iconElement = document.createElement('div');
        // add more types
        if (feature.properties.deviceType === 'PC') {
          iconElement.className = 'marker-icon';
          iconElement.style.backgroundImage = 'url(images/icons/device.png)';
          markerContentElement.appendChild(iconElement);
          // add more types
        } else if (feature.properties.deviceType === 'Mobile') {
          iconElement.className = 'marker-icon';
          iconElement.style.backgroundImage = 'url(images/icons/device.png)';
          markerContentElement.appendChild(iconElement);
          // now only this will work
        } else {
          iconElement.className = 'marker-icon';
          iconElement.style.backgroundImage = 'url(images/icons/device.png)';
          markerContentElement.appendChild(iconElement);
        }

        var newMarker = new tt.Marker({
          element: markerElement, // pass the custom icon to the marker
          anchor: 'bottom', // set the anchor point for the marker
          draggable: false, // enable dragging of the marker
          color: '#FF0000', // set the color of the marker
        }).setLngLat(feature.geometry.coordinates);

        newMarker.addTo(map);
        newMarker.setPopup(
          // new tt.Popup({ offset: 30 }).setText(feature.properties.name)

          new tt.Popup({ offset: 30, closeButton: false }).setHTML(
            `<div style="text-align: center; display:flex; flex-direction: column; align-items: center;justify-content: center;font-weight:700">
            <div style="width: 120px; height: 120px; overflow: hidden;">
            <a href='/products/${feature.properties.productId}'>
              <div style="width: 120px; height: 120px; overflow: hidden; border: 3px solid white;
              background-image: url(${feature.properties.img});
              background-size: cover;
              background-position: center;">
              </div>
            </a>
          </div>
          <p style="text-transform: uppercase;">${feature.properties.name}</p>
          </div>`,
          ),
        );

        markersOnTheMap[id] = newMarker;
      }
    }
  });
}

map.on('load', function () {
  map.addSource('point-source', {
    type: 'geojson',
    data: geoJson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'point-source',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#EC619F', 4, '#008D8D', 7, '#004B7F'],
      'circle-radius': ['step', ['get', 'point_count'], 15, 4, 20, 7, 25],
      'circle-stroke-width': 1,
      'circle-stroke-color': 'white',
      'circle-stroke-opacity': 1,
    },
  });

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'point-source',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 16,
    },
    paint: {
      'text-color': 'white',
    },
  });

  map.on('data', function (e) {
    if (e.sourceId !== 'point-source' || !map.getSource('point-source').loaded()) {
      return;
    }

    refreshMarkers();

    if (!eventListenersAdded) {
      map.on('move', refreshMarkers);
      map.on('moveend', refreshMarkers);
      eventListenersAdded = true;
    }
  });

  map.on('click', 'clusters', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    var clusterId = features[0].properties.cluster_id;
    map.getSource('point-source').getClusterExpansionZoom(clusterId, function (err, zoom) {
      if (err) {
        return;
      }

      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom + 0.5,
      });
    });
  });

  map.on('mouseenter', 'clusters', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'clusters', function () {
    map.getCanvas().style.cursor = '';
  });
});

////////////////
// DISPLAY YOUR LOCATION ANIMATED POINT

if ('geolocation' in navigator) {
  // geolocation is available
  navigator.geolocation.getCurrentPosition((position) => {
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;

    var size = 200;

    // implementation of CustomLayer to draw animated location icon on the map
    var locationPoint = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),

      // get rendering context for the map canvas when layer is added to the map
      onAdd: function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
      },

      // called once before every frame where the icon will be used
      render: function () {
        var duration = 1100;
        var t = (performance.now() % duration) / duration;

        var radius = 18 + 2 * this.easeInOutSine(t);
        var outerRadius = 80 * this.easeInOutSine(t) + radius;
        var context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(0, 145, 255,' + this.easeInOutSine(1 - t) + ')';
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(0, 145, 255, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 3 + this.easeInOutSine(1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(0, 0, this.width, this.height).data;

        // continuously repaint the map, resulting in the smooth animation of the dot
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
      },

      easeInOutSine: function (x) {
        return -(Math.cos(Math.PI * x) - 1) / 2;
      },
    };

    map.on('load', function () {
      map.addImage('pulsing-dot', locationPoint, { pixelRatio: 2 });

      map.addSource('points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [userLng, userLat],
              },
            },
          ],
        },
      });
      map.addLayer({
        id: 'points',
        type: 'symbol',
        source: 'points',
        layout: {
          'icon-image': 'pulsing-dot',
        },
      });
    });
  });
}
