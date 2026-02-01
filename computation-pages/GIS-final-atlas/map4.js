//impervious surfaces + land cover

// Initialize the map
const map4 = new maplibregl.Map({
    container: 'map4',
    style: 'style.json',
    center: [-73.952778, 40.798120],
    zoom: 11
});

// Add navigation controls
map4.addControl(new maplibregl.NavigationControl(), 'top-left');

// Wait for map to fully load
map4.on('load', () => {
    console.log('Map 4 loaded');
    
    // Add raster tile source
    map4.addSource('building-tiles', {
        type: 'raster',
        tiles: [
            'Tiles/{z}/{x}/{y}.png'  // Corrected path
        ],
        tileSize: 256,
        minzoom: 12,
        maxzoom: 14
    });
    
    // Add raster layer
    map4.addLayer({
        id: 'building-tiles-layer',
        type: 'raster',
        source: 'building-tiles',
        paint: {
            'raster-opacity': 0.8
        }
    });
    
    // Toggle functionality
    const toggleCheckbox3 = document.getElementById('layer-toggle3');
    if (toggleCheckbox3) {
        toggleCheckbox3.addEventListener('change', (e) => {
            const visibility = e.target.checked ? 'visible' : 'none';
            map4.setLayoutProperty('building-tiles-layer', 'visibility', visibility);
        });
    }
});

// Error handling
map4.on('error', (e) => {
    console.error('Map 3 error:', e);
});