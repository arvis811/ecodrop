// Function to initialize the map

const map = tt.map({
  key: TOMTOMTOKEN,
  container: 'map',
  center: product.features.location.coordinates,
  zoom: 12,
  scrollZoom: false,
});

map.addControl(new tt.FullscreenControl());
map.addControl(new tt.NavigationControl());

const marker = new tt.Marker().setLngLat(product.features.location.coordinates).addTo(map);
