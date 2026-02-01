// scrollytelling.js

(async function() {
    const map = window.sharedMap;
    
    // Wait for map to be loaded
    if (!map.loaded()) {
        await new Promise(resolve => map.on('load', resolve));
    }
    
    console.log('Scrollytelling initialized');
    
    // Helper function to hide all grid layers
    function hideAllGridLayers() {
        return {
            'british-grid-fill': 'none',
            'british-grid-outline': 'none',
            'grid-1811-fill': 'none',
            'grid-1811-outline': 'none',
            'grid-1840-fill': 'none',
            'grid-1840-outline': 'none',
            'grid-1870-fill': 'none',
            'grid-1870-outline': 'none',
            'grid-1900-fill': 'none',
            'grid-1900-outline': 'none',
            'complete-grid-fill': 'none',
            'complete-grid-outline': 'none',
            'parks-layer': 'none',           
            'parks-outline-layer': 'none'
        };
    }
    
    // Define narrative steps following your storyboard
    const steps = {
        // INTRO
        'intro': {
            center: [-73.98, 40.76],
            zoom: 13.5,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'none',
                'streams-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'none',           
                'parks-outline-layer': 'none',
                'trees-layer': 'none'
            }
        },
        
        // HISTORICAL GRID - Feature 1: Complete Grid Overview
        'urban-density': {
            center: [-73.97, 40.76], // Centered on Manhattan
            zoom: 11.5, // Zoomed in a bit more
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'complete-grid-fill': 'visible',
                'complete-grid-outline': 'visible',
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'none',
                'streams-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'none',           
                'parks-outline-layer': 'none',
                'trees-layer': 'none',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none'  
            }
        },
        
        // HISTORICAL GRID - Feature 2: British Headquarters 1782
        'british-1782': {
            center: [-74.008, 40.715], // Moved north to show less water
            zoom: 14,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'british-grid-fill': 'none', // Removed fill
                'british-grid-outline': 'visible', // Only outline
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'none',
                'streams-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'none',           
                'parks-outline-layer': 'none',
                'trees-layer': 'none',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },
        
        // HISTORICAL GRID - Feature 3: 1811 Grid
        'grid-1811': {
            center: [-73.99, 40.730],
            zoom: 13,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'grid-1811-fill': 'visible',
                'grid-1811-outline': 'visible',
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'none',
                'streams-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'none',           
                'parks-outline-layer': 'none',
                'trees-layer': 'none',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },
        
        // HISTORICAL GRID - Feature 4: 1840 Grid (builds on 1811)
        'grid-1840': {
            center: [-73.98, 40.750],
            zoom: 12,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'grid-1811-fill': 'visible',
                'grid-1811-outline': 'visible',
                'grid-1840-fill': 'visible',
                'grid-1840-outline': 'visible',
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'none',
                'streams-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'none',           
                'parks-outline-layer': 'none',
                'trees-layer': 'none',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },
        
        // HISTORICAL GRID - Feature 5: 1870 Grid (builds on 1840)
        'grid-1870': {
            center: [-73.97, 40.780],
            zoom: 12,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'grid-1811-fill': 'visible',
                'grid-1811-outline': 'visible',
                'grid-1840-fill': 'visible',
                'grid-1840-outline': 'visible',
                'grid-1870-fill': 'visible',
                'grid-1870-outline': 'visible',
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'none',
                'streams-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'none',           
                'parks-outline-layer': 'none',
                'trees-layer': 'none',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },
        
        // HISTORICAL GRID - Feature 6: 1900 Grid (builds on 1870)
        'grid-1900': {
            center: [-73.96, 40.810],
            zoom: 12,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'grid-1811-fill': 'visible',
                'grid-1811-outline': 'visible',
                'grid-1840-fill': 'visible',
                'grid-1840-outline': 'visible',
                'grid-1870-fill': 'visible',
                'grid-1870-outline': 'visible',
                'grid-1900-fill': 'visible',
                'grid-1900-outline': 'visible',
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'none',
                'streams-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'none',           
                'parks-outline-layer': 'none',
                'trees-layer': 'none',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },
        
        // HISTORICAL GRID - Feature 7: Complete Grid (builds on 1900)
        'complete-grid': {
            center: [-73.97, 40.78], // Centered on Manhattan
            zoom: 11,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'grid-1811-fill': 'visible',
                'grid-1811-outline': 'visible',
                'grid-1840-fill': 'visible',
                'grid-1840-outline': 'visible',
                'grid-1870-fill': 'visible',
                'grid-1870-outline': 'visible',
                'grid-1900-fill': 'visible',
                'grid-1900-outline': 'visible',
                'complete-grid-fill': 'visible',
                'complete-grid-outline': 'visible',
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'none',
                'streams-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'visible',           
                'parks-outline-layer': 'visible',
                'trees-layer': 'none',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },
        
        // IMPERVIOUS SURFACES - Feature 1
        'impervious-surfaces': {
            center: [-73.935242, 40.730610],
            zoom: 11, // Zoomed in a bit more
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'building-tiles-layer': 'visible',
                'historical-ecology-layer': 'none',
                'streams-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'none',           
                'parks-outline-layer': 'none',
                'trees-layer': 'none',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },
        
        // ECOLOGICAL HISTORY - Feature 1: Natural Vegetation
        'natural-vegetation': {
            center: [-73.97, 40.78], // Centered on Manhattan
            zoom: 11.5,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'visible',
                'streams-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'none',           
                'parks-outline-layer': 'none',
                'trees-layer': 'none',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },
        
        // ECOLOGICAL HISTORY - Feature 2: Wetlands (layered)
        'wetlands': {
            center: [-73.97, 40.78], // Centered on Manhattan
            zoom: 11.5,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'visible',
                'wetlands-layer': 'visible',
                'parks-layer': 'none',           
                'parks-outline-layer': 'none',
                'streams-layer': 'none',
                'trees-layer': 'none',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },
        
        // ECOLOGICAL HISTORY - Feature 3: Streams (layered)
        'streams': {
            center: [-73.97, 40.78], // Centered on Manhattan
            zoom: 11.5,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'visible',
                'wetlands-layer': 'visible',
                'parks-layer': 'none',           
                'parks-outline-layer': 'none',
                'streams-layer': 'visible',
                'trees-layer': 'none',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },
        
// MYCELIUM - Feature 1: Tree Coverage Overview
        'hidden-network': {
            center: [-73.935242, 40.730610],
            zoom: 11,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'visible',          
                'parks-outline-layer': 'visible',
                'streams-layer': 'none',
                'trees-layer': 'visible',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },

        // MYCELIUM - Feature 2: Manhattan Sans Grid
        'manhattan-sans-grid': {
            center: [-73.97, 40.76],
            zoom: 13, // Zoomed into Manhattan
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'visible',          
                'parks-outline-layer': 'visible',
                'streams-layer': 'none',
                'trees-layer': 'visible',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },

        // MYCELIUM - Feature 3: The Hidden Network (Growth starts here)
        'hidden-network-growth': {
            center: [-73.97, 40.76],
            zoom: 13,
            pitch: 0,
            bearing: 0,
            layers: {
                ...hideAllGridLayers(),
                'building-tiles-layer': 'none',
                'historical-ecology-layer': 'none',
                'wetlands-layer': 'none',
                'parks-layer': 'visible',          
                'parks-outline-layer': 'visible',
                'streams-layer': 'none',
                'trees-layer': 'visible',
                'mycelium-lines': 'none',         
                'mycelium-seeds': 'none' 
            }
        },
    };
    
    // Handle step transitions
    function handleStepEnter(stepName) {
        const config = steps[stepName];
        
        if (!config) {
            console.warn(`No configuration found for step: ${stepName}`);
            return;
        }
        
        console.log(`Entering step: ${stepName}`);
        
        // Animate map camera
        map.flyTo({
            center: config.center,
            zoom: config.zoom,
            pitch: config.pitch || 0,
            bearing: config.bearing || 0,
            duration: 2000,
            essential: true
        });
        
        // Toggle layer visibility
        if (config.layers) {
            Object.keys(config.layers).forEach(layerId => {
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(layerId, 'visibility', config.layers[layerId]);
                }
            });
        }
        
        // Update paint properties if specified
        if (config.paint) {
            Object.keys(config.paint).forEach(layerId => {
                if (map.getLayer(layerId)) {
                    Object.keys(config.paint[layerId]).forEach(property => {
                        map.setPaintProperty(layerId, property, config.paint[layerId][property]);
                    });
                }
            });
        }
    }
    
    // Intersection Observer for scroll detection
    const stepElements = document.querySelectorAll('.step');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stepName = entry.target.dataset.step;
                handleStepEnter(stepName);
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px'
    });
    
    // Observe all steps
    stepElements.forEach(step => {
        observer.observe(step);
    });
    
    console.log('✅ Scrollytelling ready - found', stepElements.length, 'steps');
    
})();