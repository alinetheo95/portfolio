// 3D buildings

mapboxgl.accessToken = 'pk.eyJ1IjoiYWxpbmV0aGVvIiwiYSI6ImNtZDZrbzFyeDBhd2Uya3BzejF4ZHh2MDIifQ.vz9lDJXrEO9vAAlfW4ngPQ';

const map5 = new mapboxgl.Map({
    container: 'map5',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-73.9857, 40.7484], // NYC center
    zoom: 15,
    pitch: 60, // 3D viewing angle
    bearing: -17.6,
    antialias: true
});

let rotating = false;
let rotationInterval;

map5.on('load', () => {
    // Add Mapbox's built-in 3D buildings layer
    const layers = map5.getStyle().layers;
    const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
    ).id;

        map5.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 0,
        'maxzoom': 24, // Ensure buildings load at all zoom levels
        'paint': {
            'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'height'],
                0, '#666',
                50, '#888',
                100, '#aaa',
                200, '#ccc'
            ],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 0.9, // More opaque when zoomed out
                18, 0.8  // Slightly transparent when zoomed in
            ]
        }
    }, labelLayerId);

    document.getElementById('status').textContent = '✓ 3D buildings loaded';
});

// Rotate view button
document.getElementById('rotateBtn').addEventListener('click', () => {
    if (!rotating) {
        rotating = true;
        document.getElementById('rotateBtn').textContent = 'Stop Rotation';
        
        function rotateCamera(timestamp) {
            if (rotating) {
                map5.rotateTo((map5.getBearing() + 90) % 360, {
                    duration: 20000,
                    easing: (t) => t
                });
                rotationInterval = setTimeout(() => rotateCamera(timestamp), 20000);
            }
        }
        rotateCamera(Date.now());
    } else {
        rotating = false;
        clearTimeout(rotationInterval);
        document.getElementById('rotateBtn').textContent = 'Rotate View';
    }
});

// Top view button
document.getElementById('topViewBtn').addEventListener('click', () => {
    map5.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
    });
});

// Angled view button
document.getElementById('angleViewBtn').addEventListener('click', () => {
    map5.easeTo({
        pitch: 60,
        bearing: -17.6,
        duration: 1000
    });
});

// Add navigation controls
map5.addControl(new mapboxgl.NavigationControl());