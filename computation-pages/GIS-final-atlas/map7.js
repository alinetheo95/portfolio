// streams 

// Initialize the map
const map7 = new maplibregl.Map({
    container: 'map7',
    style: 'style.json',
    center: [-73.952778, 40.798120],
    zoom: 11
});

// Add navigation controls
map7.addControl(new maplibregl.NavigationControl(), 'top-left');

// Wait for map to fully load
map7.on('load', () => {
    console.log('Map 7 loaded');
    
    // Load your GeoJSON file
    fetch('streams-webmap.geojson')
        .then(response => response.json())
        .then(data => {
            console.log('Data loaded:', data);
            
            // Debug: Check coordinates and feature count
            console.log('First feature coordinates:', data.features[0].geometry.coordinates[0]);
            console.log('Total features:', data.features.length);
            
            // Add source
            map7.addSource('georef-export', {
                type: 'geojson',
                data: data
            });
            
            // Add line layer
            map7.addLayer({
                id: 'georef-export-layer',
                type: 'line',
                source: 'georef-export',
                paint: {
                    'line-color': '#25baed',
                    'line-width': 1.5
                }
            });
            
            // Add click popup
            const popup7 = new maplibregl.Popup({
                closeButton: true,
                closeOnClick: true
            });
            
            map7.on('click', 'georef-export-layer', (e) => {
                if (e.features.length > 0) {
                    const properties = e.features[0].properties;
                    const coordinates = e.lngLat;
                    
                    // Build content from properties
                    let content = '<h5>Feature Info</h5>';
                    for (let key in properties) {
                        content += `<p><strong>${key}:</strong> ${properties[key]}</p>`;
                    }
                    
                    popup7.setLngLat(coordinates)
                        .setHTML(content)
                        .addTo(map7);
                }
            });
            
            // Cursor change on hover
            map7.on('mouseenter', 'georef-export-layer', () => {
                map7.getCanvas().style.cursor = 'pointer';
            });
            
            map7.on('mouseleave', 'georef-export-layer', () => {
                map7.getCanvas().style.cursor = '';
            });
            
            // Toggle functionality
            const toggleCheckbox7 = document.getElementById('layer-toggle7');
            if (toggleCheckbox7) {
                toggleCheckbox7.addEventListener('change', (e) => {
                    const visibility = e.target.checked ? 'visible' : 'none';
                    map7.setLayoutProperty('georef-export-layer', 'visibility', visibility);
                });
            }
            
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
});

// Error handling
map7.on('error', (e) => {
    console.error('Map 7 error:', e);
});