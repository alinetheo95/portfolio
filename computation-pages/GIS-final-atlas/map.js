// tree coverage

// Initialize the map
const map = new maplibregl.Map({
    container: 'map',
    style: 'style.json',
    center: [-73.935242, 40.730610],
    zoom: 11
});

// Add navigation controls
map.addControl(new maplibregl.NavigationControl(), 'top-left');

// Function to convert forestry data to GeoJSON
function convertToGeoJSON(data) {
    console.log('Converting dataset. Total records:', data.length);
    
    const features = [];
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.location && item.location.coordinates) {
            features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: item.location.coordinates
                },
                properties: {
                    objectid: item.objectid,
                    dbh: item.dbh,
                    genusspecies: item.genusspecies,
                    tpcondition: item.tpcondition,
                    tpstructure: item.tpstructure
                }
            });
        }
        
        // Progress update every 10000 records
        if (i > 0 && i % 10000 === 0) {
            console.log(`Converted ${i} records...`);
        }
    }
    
    console.log(`Conversion complete! Total features: ${features.length}`);
    
    return {
        type: 'FeatureCollection',
        features: features
    };
}

// Wait for map to fully load
map.on('load', async () => {
    console.log('Map loaded, fetching tree data...');
    console.log('Attempting to load maximum trees - this may take a while');
    
    try {
        // Try with a very high limit - Socrata API max is typically around 50,000-100,000
        // but we can try higher
        console.log('Fetching forestry tree dataset with high limit...');
        const startTime = performance.now();
        
        const response = await fetch('https://data.cityofnewyork.us/resource/hn5i-inap.json?$limit=250000');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Response received, parsing JSON...');
        const treeData = await response.json();
        const fetchTime = performance.now() - startTime;
        console.log(`Tree data loaded in ${(fetchTime / 1000).toFixed(2)} seconds`);
        console.log(`Number of records: ${treeData.length}`);
        
        // Convert to GeoJSON
        console.log('Starting conversion to GeoJSON...');
        const conversionStart = performance.now();
        const geojsonData = convertToGeoJSON(treeData);
        const conversionTime = performance.now() - conversionStart;
        console.log(`Conversion completed in ${(conversionTime / 1000).toFixed(2)} seconds`);
        console.log(`GeoJSON features: ${geojsonData.features.length}`);
        
        if (geojsonData.features.length === 0) {
            console.error('No features were converted!');
            return;
        }
        
        // Add the source
        console.log('Adding source to map...');
        const sourceStart = performance.now();
        map.addSource('trees', {
            type: 'geojson',
            data: geojsonData
        });
        const sourceTime = performance.now() - sourceStart;
        console.log(`Source added in ${(sourceTime / 1000).toFixed(2)} seconds`);

        // Add simple circle layer with your styling
        console.log('Adding layer to map...');
        const layerStart = performance.now();
        map.addLayer({
            id: 'trees-layer',
            type: 'circle',
            source: 'trees',
            paint: {
                'circle-color': '#77c049',
                'circle-radius': 2,
                'circle-opacity': 0.8
            }
        });
        const layerTime = performance.now() - layerStart;
        console.log(`Layer added in ${(layerTime / 1000).toFixed(2)} seconds`);
        
        const totalTime = performance.now() - startTime;
        console.log(`TOTAL TIME: ${(totalTime / 1000).toFixed(2)} seconds`);
        console.log(`✅ Successfully loaded ${geojsonData.features.length} trees!`);

        // Popup for trees
        const treePopup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true
        });

        map.on('click', 'trees-layer', (e) => {
            if (e.features.length > 0) {
                const properties = e.features[0].properties;
                const coordinates = e.features[0].geometry.coordinates.slice();

                const content = `
                    <h5>Tree Info</h5>
                    <p><strong>Species:</strong> ${properties.genusspecies || 'N/A'}</p>
                    <p><strong>Diameter:</strong> ${properties.dbh || 'N/A'}</p>
                    <p><strong>Condition:</strong> ${properties.tpcondition || 'N/A'}</p>
                    <p><strong>Structure:</strong> ${properties.tpstructure || 'N/A'}</p>
                `;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                treePopup.setLngLat(coordinates)
                    .setHTML(content)
                    .addTo(map);
            }
        });

        // Change cursor on hover
        map.on('mouseenter', 'trees-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'trees-layer', () => {
            map.getCanvas().style.cursor = '';
        });

        // Layer toggle functionality (if you have a checkbox)
        const toggleCheckbox = document.getElementById('layer-toggle');
        if (toggleCheckbox) {
            toggleCheckbox.addEventListener('change', (e) => {
                const visibility = e.target.checked ? 'visible' : 'none';
                map.setLayoutProperty('trees-layer', 'visibility', visibility);
                console.log('Layer visibility:', visibility);
            });
        }

    } catch (error) {
        console.error('❌ Error loading trees:', error);
    }
});

// Error handling
map.on('error', (e) => {
    console.error('Map error:', e);
});

// Make map accessible to mycelium.js
window.treeMap = map;