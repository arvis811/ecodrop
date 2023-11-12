var map = tt.map({
  key: TOMTOMTOKEN,
  container: 'map',
  center: [24.9384, 60.1695], // Coordinates for Helsinki
  zoom: 6,
  //dragPan: !isMobileOrTablet(),
});
map.addControl(new tt.FullscreenControl());
map.addControl(new tt.NavigationControl());
var markersOnTheMap = {};
var eventListenersAdded = false;
var points = [
  {
    coordinates: [24.9384, 60.17],
    properties: {
      id: 1,
      name: 'ElectroTech Solutions',
    },
  },
  {
    coordinates: [25.7512, 61.9255],
    properties: {
      id: 2,
      name: 'GadgetHub Innovations',
    },
  },
  {
    coordinates: [27.668, 62.8395],
    properties: {
      id: 3,
      name: 'EcoElectronics Services',
    },
  },
  {
    coordinates: [25.475, 65.015],
    properties: {
      id: 4,
      name: 'TechRecycle Depot',
    },
  },
  {
    coordinates: [23.785, 63.445],
    properties: {
      id: 5,
      name: 'GreenDevice Solutions',
    },
  },
  {
    coordinates: [27.325, 64.95],
    properties: {
      id: 6,
      name: 'NordicTech Recyclers',
    },
  },
  {
    coordinates: [28.1875, 61.07],
    properties: {
      id: 7,
      name: 'EcoInnovate Electronics',
    },
  },
  {
    coordinates: [22.271, 60.453],
    properties: {
      id: 8,
      name: 'SustainableGadgets',
    },
  },
  {
    coordinates: [22.708, 63.728],
    properties: {
      id: 9,
      name: 'EcoCycle Electronics',
    },
  },
  {
    coordinates: [26.035, 64.19],
    properties: {
      id: 10,
      name: 'SmartRecycle Solutions',
    },
  },
  {
    coordinates: [23.763, 61.5],
    properties: {
      id: 11,
      name: 'FutureGadget Innovations',
    },
  },
  {
    coordinates: [23.12, 63.843],
    properties: {
      id: 12,
      name: 'GreenDevice Recyclers',
    },
  },
  {
    coordinates: [26.931, 60.917],
    properties: {
      id: 13,
      name: 'TechCycle Solutions',
    },
  },
  {
    coordinates: [21.617, 63.0705],
    properties: {
      id: 14,
      name: 'EcoTech Recyclers',
    },
  },
  {
    coordinates: [24.1485, 65.8435],
    properties: {
      id: 15,
      name: 'NordicRecycle Innovations',
    },
  },
  {
    coordinates: [28.0225, 61.8555],
    properties: {
      id: 16,
      name: 'GreenGadget Solutions',
    },
  },
  {
    coordinates: [25.056, 60.273],
    properties: {
      id: 17,
      name: 'EcoTech Innovations',
    },
  },
  {
    coordinates: [22.5735, 62.891],
    properties: {
      id: 18,
      name: 'NordicRecycle Electronics',
    },
  },
  {
    coordinates: [24.495, 63.731],
    properties: {
      id: 19,
      name: 'SustainableGadget Solutions',
    },
  },
  {
    coordinates: [27.7325, 66.503],
    properties: {
      id: 20,
      name: 'TechCycle Innovations',
    },
  },
  {
    coordinates: [25.0557, 60.2722],
    properties: {
      id: 21,
      name: 'GreenDevice Recyclers',
    },
  },
  {
    coordinates: [23.7609, 61.4978],
    properties: {
      id: 22,
      name: 'EcoInnovate Electronics',
    },
  },
  {
    coordinates: [21.615, 63.068],
    properties: {
      id: 23,
      name: 'NordicTech Solutions',
    },
  },
  {
    coordinates: [24.1466, 65.8412],
    properties: {
      id: 24,
      name: 'TechRecycle Innovations',
    },
  },
  {
    coordinates: [28.0202, 61.853],
    properties: {
      id: 25,
      name: 'EcoGadget Recyclers',
    },
  },
  {
    coordinates: [24.7935, 60.963],
    properties: {
      id: 26,
      name: 'SustainableTech Solutions',
    },
  },
];
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
function refreshMarkers() {
  Object.keys(markersOnTheMap).forEach(function (id) {
    markersOnTheMap[id].remove();
    delete markersOnTheMap[id];
  });
  map.querySourceFeatures('point-source').forEach(function (feature) {
    if (feature.properties && !feature.properties.cluster) {
      var id = parseInt(feature.properties.id, 10);
      if (!markersOnTheMap[id]) {
        var newMarker = new tt.Marker().setLngLat(feature.geometry.coordinates);
        newMarker.addTo(map);
        newMarker.setPopup(new tt.Popup({ offset: 30 }).setText(feature.properties.name));
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
