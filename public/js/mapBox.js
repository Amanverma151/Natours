/* eslint-disable */

// Taking the array of locations as argument
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    "pk.eyJ1Ijoid2lja2VkeG8iLCJhIjoiY2wyOHkyZ3g1MDByMzNicXVhem1janhoYyJ9.94D8sX89g9S51jNPWBzRZQ";

  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/wickedxo/cl290wa0x003l15qlatq8dezg",
    scrollZoom: false,
    // center: [-118.110531, 34.05501],
    // zoom: 10,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Creating the marker to each location
    const el = document.createElement("div");
    el.className = "marker";

    // Adding the marker
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom", // means that the bottom of the pin will the exact location on the GPS.
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Adding Popup
    new mapboxgl.Popup({
      offset: 40, // To avoid the overlapping, 40px
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> ${loc.day}: ${loc.description} </p>`)
      .addTo(map);

    // Extends map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  // this function executes the moving and zooming of the map
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
