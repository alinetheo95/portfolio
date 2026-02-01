// historical ecology

// Initialize the second map
const map2 = new maplibregl.Map({
    container: 'map2',
    style: 'style.json',
    center: [-73.952778, 40.798120],
    zoom: 11
});

// Add navigation controls
map2.addControl(new maplibregl.NavigationControl(), 'top-left');

// Wait for map to fully load
map2.on('load', () => {
    console.log('Map 2 loaded');
    
    // Load your GeoJSON file
    fetch('georef-export.geojson')  // Replace with your filename
        .then(response => response.json())
        .then(data => {
            console.log('Data loaded:', data);
            
            // Add source
            map2.addSource('georef-export', {
                type: 'geojson',
                data: data
            });
            
            // Add layer - adjust type based on your geometry
            // For POINTS use 'circle':
            /*
            map2.addLayer({
                id: 'georef-export-layer',
                type: 'circle',  // or 'line' for lines, 'fill' for polygons
                source: 'georef-export',
                paint: {
                    'circle-color': '#ff6b6b',
                    'circle-radius': 6,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff'
                }
            });
            
            // For LINES use this instead:
            /*
            map2.addLayer({
                id: 'my-data-layer',
                type: 'line',
                source: 'my-data',
                paint: {
                    'line-color': '#ff6b6b',
                    'line-width': 2
                }
            });
            */
            
            // For POLYGONS use this:
            map2.addLayer({
                id: 'georef-export-layer',
                type: 'fill',
                source: 'georef-export',
                paint: {
                    'fill-color': '#77c049',
                    'fill-opacity': 0.5,
                }
            });
            
            // Add click popup
            const popup2 = new maplibregl.Popup({
                closeButton: true,
                closeOnClick: true
            });
            
            map2.on('click', 'georef-export-layer', (e) => {
                if (e.features.length > 0) {
                    const properties = e.features[0].properties;
                    const coordinates = e.lngLat;
                    
                    // Build content from your properties
                    let content = '<h5>Feature Info</h5>';
                    for (let key in properties) {
                        content += `<p>${key}: ${properties[key]}</p>`;
                    }
                    
                    popup2.setLngLat(coordinates)
                        .setHTML(content)
                        .addTo(map2);
                }
            });
            
            // Cursor change on hover
            map2.on('mouseenter', 'georef-export-layer', () => {
                map2.getCanvas().style.cursor = 'pointer';
            });
            
            map2.on('mouseleave', 'georef-export-layer', () => {
                map2.getCanvas().style.cursor = '';
            });
            
            // Toggle functionality
            const toggleCheckbox2 = document.getElementById('layer-toggle2');
            if (toggleCheckbox2) {
                toggleCheckbox2.addEventListener('change', (e) => {
                    const visibility = e.target.checked ? 'visible' : 'none';
                    map2.setLayoutProperty('georef-export-layer', 'visibility', visibility);
                });
            }
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
});

// Error handling
map2.on('error', (e) => {
    console.error('Map 2 error:', e);
});
