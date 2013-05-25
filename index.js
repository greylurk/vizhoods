var geojson = [
  { "geometry": { "type": "Point", "coordinates": [-93.2526, 44.9781] },
    "properties": { "id": "cover", "zoom": 17 } },
  { "geometry": { "type": "Point", "coordinates": [-0.15591514, 51.51830379] },
    "properties": { "id": "baker" } },
  { "geometry": { "type": "Point", "coordinates": [-0.07571203, 51.51424049] },
    "properties": { "id": "aldgate" } },
  { "geometry": { "type": "Point", "coordinates": [-0.08533793, 51.50438536] },
    "properties": { "id": "london-bridge" } },
  { "geometry": { "type": "Point", "coordinates": [0.05991101, 51.48752939] },
    "properties": { "id": "woolwich" } },
  { "geometry": { "type": "Point", "coordinates": [-0.18335806, 51.49439521] },
    "properties": { "id": "gloucester" } },
  { "geometry": { "type": "Point", "coordinates": [-0.19684993, 51.5033856] },
    "properties": { "id": "caulfield-gardens" } },
  { "geometry": { "type": "Point", "coordinates": [-0.10669358, 51.51433123] },
    "properties": { "id": "telegraph" } },
  { "geometry": { "type": "Point", "coordinates": [-0.12416858, 51.50779757] },
    "properties": { "id": "charing-cross" } }
];
var tiles = mapbox.layer().tilejson({
  tiles: [ "http://a.tiles.mapbox.com/v3/andrewulven.map-gy04rold/{z}/{x}/{y}.png" ]
});
var spots = mapbox.markers.layer()
  // Load up markers from geojson data.
  .features(geojson)
  // Define a new factory function. Takes geojson input and returns a
  // DOM element that represents the point.
  .factory(function(f) {
    var el = document.createElement('div');
    el.className = 'spot spot-' + f.properties.id;
    return el;
  });

// Creates the map with tile and marker layers and
// no input handlers (mouse drag, scrollwheel, etc).
var map = mapbox.map('map', [tiles, spots], null, []);

// Array of story section elements.
var sections = document.getElementsByTagName('section');

// Array of marker elements with order matching section elements.
var markers = _(sections).map(function(section) {
  return _(spots.markers()).find(function(m) {
    return m.data.properties.id === section.id;
  });
});

// Helper to set the active section.
var setActive = function(index, ease) {
  // Set active class on sections, markers.
  _(sections).each(function(s) { s.className = s.className.replace(' active', '') });
  _(markers).each(function(m) { m.element.className = m.element.className.replace(' active', '') });
  sections[index].className += ' active';
  markers[index].element.className += ' active';

  // Set a body class for the active section.
  document.body.className = 'section-' + index;

  // Ease map to active marker.
  if (!ease) {
    map.centerzoom(markers[index].location, markers[index].data.properties.zoom||14);
  } else {
    map.ease.location(markers[index].location).zoom(markers[index].data.properties.zoom||14).optimal(0.5, 1.00);
  }

  return true;
};

// Bind to scroll events to find the active section.
window.onscroll = _(function() {
  // IE 8
  if (window.pageYOffset === undefined) {
    var y = document.documentElement.scrollTop;
    var h = document.documentElement.clientHeight;
  } else {
    var y = window.pageYOffset;
    var h = window.innerHeight;
  }

  // If scrolled to the very top of the page set the first section active.
  if (y === 0) return setActive(0, true);

  // Otherwise, conditionally determine the extent to which page must be
  // scrolled for each section. The first section that matches the current
  // scroll position wins and exits the loop early.
  var memo = 0;
  var buffer = (h * 0.3333);
  var active = _(sections).any(function(el, index) {
    memo += el.offsetHeight;
    return y < (memo-buffer) ? setActive(index, true) : false;
  });

  // If no section was set active the user has scrolled past the last section.
  // Set the last section active.
  if (!active) setActive(sections.length - 1, true);
}).debounce(10);

// Set map to first section.
setActive(0, false);
