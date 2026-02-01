// Combined map with all layers for scrollytelling

// Initialize the main map
const map = new maplibregl.Map({
    container: 'map',
    style: 'style.json',
    center: [-73.935242, 40.730610],
    zoom: 11
});

// Add navigation controls
map.addControl(new maplibregl.NavigationControl(), 'top-left');

// Make map globally accessible
window.sharedMap = map;

// Wait for map to fully load
map.on('load', async () => {
    console.log('Main map loaded, loading all layers...');
    
    try {
            map.addSource('mycelium', {
            type: 'geojson',
            data: 'mycelium-network.geojson'
        });

        map.addLayer({
            id: 'mycelium-lines',
            type: 'line',
            source: 'mycelium',
            paint: {
                'line-color': '#ffffffff',
                'line-width': 0.5,
                'line-opacity': 0.7
            }
        });
        // ====== LAYER 1: Historical Grid Progression ======
        console.log('Loading historical grid layers...');
        
        // British Headquarters
        const britishResponse = await fetch('british-headquarters.geojson');
        const britishData = await britishResponse.json();
        console.log('British headquarters loaded:', britishData.features.length, 'features');
        
        map.addSource('british-grid', {
            type: 'geojson',
            data: britishData
        });
        
        map.addLayer({
            id: 'british-grid-fill',
            type: 'fill',
            source: 'british-grid',
            paint: {
                'fill-color': '#8e6a50ff',
                'fill-opacity': 0.4
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        map.addLayer({
            id: 'british-grid-outline',
            type: 'line',
            source: 'british-grid',
            paint: {
                'line-color': '#8e6a50ff',
                'line-width': 2
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        // 1811 Grid
        const grid1811Response = await fetch('1811.geojson');
        const grid1811Data = await grid1811Response.json();
        console.log('1811 grid loaded:', grid1811Data.features.length, 'features');
        
        map.addSource('grid-1811', {
            type: 'geojson',
            data: grid1811Data
        });
        
        map.addLayer({
            id: 'grid-1811-fill',
            type: 'fill',
            source: 'grid-1811',
            paint: {
                'fill-color': '#928b88ff',
                'fill-opacity': 0.4
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        map.addLayer({
            id: 'grid-1811-outline',
            type: 'line',
            source: 'grid-1811',
            paint: {
                'line-color': '#928b88ff',
                'line-width': 1.5
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        // 1840 Grid
        const grid1840Response = await fetch('1840.geojson');
        const grid1840Data = await grid1840Response.json();
        console.log('1840 grid loaded:', grid1840Data.features.length, 'features');
        
        map.addSource('grid-1840', {
            type: 'geojson',
            data: grid1840Data
        });
        
        map.addLayer({
            id: 'grid-1840-fill',
            type: 'fill',
            source: 'grid-1840',
            paint: {
                'fill-color': '#928b88ff',
                'fill-opacity': 0.4
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        map.addLayer({
            id: 'grid-1840-outline',
            type: 'line',
            source: 'grid-1840',
            paint: {
                'line-color': '#928b88ff',
                'line-width': 1.5
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        // 1870 Grid
        const grid1870Response = await fetch('1870.geojson');
        const grid1870Data = await grid1870Response.json();
        console.log('1870 grid loaded:', grid1870Data.features.length, 'features');
        
        map.addSource('grid-1870', {
            type: 'geojson',
            data: grid1870Data
        });
        
        map.addLayer({
            id: 'grid-1870-fill',
            type: 'fill',
            source: 'grid-1870',
            paint: {
                'fill-color': '#928b88ff',
                'fill-opacity': 0.4
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        map.addLayer({
            id: 'grid-1870-outline',
            type: 'line',
            source: 'grid-1870',
            paint: {
                'line-color': '#928b88ff',
                'line-width': 1.5
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        // 1900 Grid
        const grid1900Response = await fetch('1900.geojson');
        const grid1900Data = await grid1900Response.json();
        console.log('1900 grid loaded:', grid1900Data.features.length, 'features');
        
        map.addSource('grid-1900', {
            type: 'geojson',
            data: grid1900Data
        });
        
        map.addLayer({
            id: 'grid-1900-fill',
            type: 'fill',
            source: 'grid-1900',
            paint: {
                'fill-color': '#928b88ff',
                'fill-opacity': 0.4
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        map.addLayer({
            id: 'grid-1900-outline',
            type: 'line',
            source: 'grid-1900',
            paint: {
                'line-color': '#928b88ff',
                'line-width': 1.5
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        // Complete Grid
        const completeGridResponse = await fetch('complete-grid.geojson');
        const completeGridData = await completeGridResponse.json();
        console.log('Complete grid loaded:', completeGridData.features.length, 'features');
        
        map.addSource('complete-grid', {
            type: 'geojson',
            data: completeGridData
        });
        
        map.addLayer({
            id: 'complete-grid-fill',
            type: 'fill',
            source: 'complete-grid',
            paint: {
                'fill-color': '#928b88ff',
                'fill-opacity': 0.3
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        map.addLayer({
            id: 'complete-grid-outline',
            type: 'line',
            source: 'complete-grid',
            paint: {
                'line-color': '#928b88ff',
                'line-width': 1
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        console.log('✅ All historical grid layers loaded');
        
        // ====== LAYER 2: Impervious Surfaces (Building Tiles) ======
        console.log('Loading impervious surfaces...');
        
        map.addSource('building-tiles', {
            type: 'raster',
            tiles: ['Tiles/{z}/{x}/{y}.png'],
            tileSize: 256,
            minzoom: 10,
            maxzoom: 14
        });
        
        map.addLayer({
            id: 'building-tiles-layer',
            type: 'raster',
            source: 'building-tiles',
            paint: {
                'raster-opacity': 0.8
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        console.log('Impervious surfaces layer added');
        
        // ====== LAYER 3: Historical Ecology ======
        console.log('Loading historical ecology...');
        const ecologyResponse = await fetch('georef-export.geojson');
        const ecologyData = await ecologyResponse.json();
        console.log('Historical ecology data loaded:', ecologyData.features.length, 'features');
        
        map.addSource('historical-ecology', {
            type: 'geojson',
            data: ecologyData
        });
        
        map.addLayer({
            id: 'historical-ecology-layer',
            type: 'fill',
            source: 'historical-ecology',
            paint: {
                'fill-color': '#77c049',
                'fill-opacity': 0.5
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        // ====== LAYER 4: Streams ======
        console.log('Loading streams...');
        const streamsResponse = await fetch('streams-webmap.geojson');
        const streamsData = await streamsResponse.json();
        console.log('Streams data loaded:', streamsData.features.length, 'features');
        
        map.addSource('streams', {
            type: 'geojson',
            data: streamsData
        });
        
        map.addLayer({
            id: 'streams-layer',
            type: 'line',
            source: 'streams',
            paint: {
                'line-color': '#406ed8ff',
                'line-width': 2
            },
            layout: {
                'visibility': 'none'
            }
        });
        
        // ====== LAYER 5: Wetlands ======
        console.log('Loading wetlands...');
        const wetlandsResponse = await fetch('wetlands-webmap.geojson');
        const wetlandsData = await wetlandsResponse.json();
        console.log('Wetlands data loaded:', wetlandsData.features.length, 'features');
        
        map.addSource('wetlands', {
            type: 'geojson',
            data: wetlandsData
        });
        
        map.addLayer({
            id: 'wetlands-layer',
            type: 'fill',
            source: 'wetlands',
            paint: {
                'fill-color': '#67c5ac',
                'fill-opacity': 0.6
            },
            layout: {
                'visibility': 'none'
            }
        });

        // ====== LAYER 6: NYC Parks ======
        console.log('🔄 Loading NYC parks...');
        try {
            const parksResponse = await fetch('https://data.cityofnewyork.us/resource/ghu2-eden.geojson');
            console.log('Response status:', parksResponse.status);
            const parksData = await parksResponse.json();
            console.log('Parks data loaded:', parksData.features.length, 'features');
            
            map.addSource('parks', {
                type: 'geojson',
                data: parksData
            });
            
            map.addLayer({
                id: 'parks-layer',
                type: 'fill',
                source: 'parks',
                paint: {
                    'fill-color': '#77c049',
                    'fill-opacity': 0.4
                },
                layout: {
                    'visibility': 'none'
                }
            });
            
            map.addLayer({
                id: 'parks-outline-layer',
                type: 'line',
                source: 'parks',
                paint: {
                    'line-color': '#77c049',
                    'line-width': 1
                },
                layout: {
                    'visibility': 'none'
                }
            });
            
            console.log('Parks layers added');
        } catch (error) {
            console.error('Error loading parks:', error);
        }

        
        // ====== LAYER 7: Tree Coverage ======
        console.log(' Loading tree coverage...');

        // Load trees for overview (100k limit)
        try {
            console.log('Loading overview trees (100k limit)...');
            const treeResponse = await fetch('https://data.cityofnewyork.us/resource/hn5i-inap.json?$limit=100000');
            console.log('Response status:', treeResponse.status);
            const treeData = await treeResponse.json();
            console.log('Tree data loaded:', treeData.length, 'trees');
            
            // Convert to GeoJSON
            const treeFeatures = [];
            for (let i = 0; i < treeData.length; i++) {
                const item = treeData[i];
                if (item.location && item.location.coordinates) {
                    treeFeatures.push({
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
            }
            
            console.log('Converted to', treeFeatures.length, 'tree features');
            
            const treeGeoJSON = {
                type: 'FeatureCollection',
                features: treeFeatures
            };
            
            map.addSource('trees', {
                type: 'geojson',
                data: treeGeoJSON
            });
            
            map.addLayer({
                id: 'trees-layer',
                type: 'circle',
                source: 'trees',
                paint: {
                    'circle-color': '#77c049',
                    'circle-radius': 2,
                    'circle-opacity': 0.8
                },
                layout: {
                    'visibility': 'none'
                }
            });
            console.log('Trees overview layer added');
        } catch (error) {
            console.error('Error loading trees:', error);
        }

        // Load trees for Manhattan detail (higher limit)
        try {
            console.log('Loading Manhattan detail trees (300k limit)...');
            const treeDetailResponse = await fetch('https://data.cityofnewyork.us/resource/hn5i-inap.json?$limit=500000');
            console.log('Response status:', treeDetailResponse.status);
            const treeDetailData = await treeDetailResponse.json();
            console.log('Tree detail data loaded:', treeDetailData.length, 'trees');
            
            // Convert to GeoJSON
            const treeDetailFeatures = [];
            for (let i = 0; i < treeDetailData.length; i++) {
                const item = treeDetailData[i];
                if (item.location && item.location.coordinates) {
                    treeDetailFeatures.push({
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
            }
            
            console.log('Converted to', treeDetailFeatures.length, 'tree detail features');
            
            const treeDetailGeoJSON = {
                type: 'FeatureCollection',
                features: treeDetailFeatures
            };
            
            map.addSource('trees-detail', {
                type: 'geojson',
                data: treeDetailGeoJSON
            });
            
            map.addLayer({
                id: 'trees-detail-layer',
                type: 'circle',
                source: 'trees-detail',
                paint: {
                    'circle-color': '#77c049',
                    'circle-radius': 2,
                    'circle-opacity': 0.8
                },
                layout: {
                    'visibility': 'none'
                }
            });
            console.log('Trees detail layer added');
        } catch (error) {
            console.error('Error loading tree details:', error);
        }
        
        // ====== INTERACTIONS ======
        
        // Generic popup for all grid layers
        const gridPopup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true
        });
        
        const gridLayers = [
            'british-grid-fill',
            'grid-1811-fill',
            'grid-1840-fill',
            'grid-1870-fill',
            'grid-1900-fill',
            'complete-grid-fill'
        ];
        
        gridLayers.forEach(layerId => {
            map.on('click', layerId, (e) => {
                if (e.features.length > 0) {
                    const properties = e.features[0].properties;
                    let content = '<h5>Grid Info</h5>';
                    for (let key in properties) {
                        content += `<p><strong>${key}:</strong> ${properties[key]}</p>`;
                    }
                    gridPopup.setLngLat(e.lngLat).setHTML(content).addTo(map);
                }
            });
        });
        
        // Popup for trees
        const treePopup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true
        });
        
        map.on('click', 'trees-layer', (e) => {
            if (e.features.length > 0) {
                const properties = e.features[0].properties;
                const content = `
                    <h5>Tree Info</h5>
                    <p><strong>Species:</strong> ${properties.genusspecies || 'N/A'}</p>
                    <p><strong>Diameter:</strong> ${properties.dbh || 'N/A'}</p>
                    <p><strong>Condition:</strong> ${properties.tpcondition || 'N/A'}</p>
                `;
                treePopup.setLngLat(e.features[0].geometry.coordinates.slice()).setHTML(content).addTo(map);
            }
        });
        
        // Popup for historical ecology
        const ecologyPopup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true
        });
        
        map.on('click', 'historical-ecology-layer', (e) => {
            if (e.features.length > 0) {
                const properties = e.features[0].properties;
                let content = '<h5>Historical Ecology</h5>';
                for (let key in properties) {
                    content += `<p><strong>${key}:</strong> ${properties[key]}</p>`;
                }
                ecologyPopup.setLngLat(e.lngLat).setHTML(content).addTo(map);
            }
        });
        
        // Popup for streams
        const streamsPopup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true
        });
        
        map.on('click', 'streams-layer', (e) => {
            if (e.features.length > 0) {
                const properties = e.features[0].properties;
                let content = '<h5>Stream Info</h5>';
                for (let key in properties) {
                    content += `<p><strong>${key}:</strong> ${properties[key]}</p>`;
                }
                streamsPopup.setLngLat(e.lngLat).setHTML(content).addTo(map);
            }
        });
        
        // Popup for wetlands
        const wetlandsPopup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true
        });
        
        map.on('click', 'wetlands-layer', (e) => {
            if (e.features.length > 0) {
                const properties = e.features[0].properties;
                let content = '<h5>Wetland Info</h5>';
                for (let key in properties) {
                    content += `<p><strong>${key}:</strong> ${properties[key]}</p>`;
                }
                wetlandsPopup.setLngLat(e.lngLat).setHTML(content).addTo(map);
            }
        });
        
        // Cursor changes on hover
        const allInteractiveLayers = [
            ...gridLayers,
            'trees-layer',
            'historical-ecology-layer',
            'streams-layer',
            'wetlands-layer'
        ];
        
        allInteractiveLayers.forEach(layerId => {
            map.on('mouseenter', layerId, () => {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', layerId, () => {
                map.getCanvas().style.cursor = '';
            });
        });
        
    } catch (error) {
        console.error('Error loading layers:', error);
    }
});

// Error handling
map.on('error', (e) => {
    console.error('Map error:', e);
});