// ===== MYCELIUM SIMULATION - HYBRID ORGANIC + BALANCED =====
// Combines zone-based distribution with flexible growth limits for natural variation
// MODIFIED: Weighted seed distribution favoring Manhattan center and north/south tips

(function() {
    let simulationInitialized = false;
    let isRunning = false;
    let seeds = [];
    let nodes = [];
    let activeTips = [];
    let iteration = 0;
    let animationFrame = null;
    let canvas, ctx, map;
    let treesLoaded = false;
    let loadingTrees = false;
    let manhattanBoundary = null;
    let zones = [];
    let streetGrid = []; // NEW: Store street grid
    
    // Configuration - ULTRA GROWTH MODE WITH UNLIMITED GROWTH + GRID FOLLOWING
    const config = {
        stepsPerFrame: 5,
        maxActiveTips: 200,
        stepSize: 0.0003,
        branchProbability: 0.25,
        branchAngle: 60 * Math.PI / 180,
        avoidanceDistance: 0.0007,
        
        killDistance: 0.05,
        useHybridKillDistance: true,
        networkKillWeight: 0.25,
        
        // NEW: GRID FOLLOWING
        useGridFollowing: true,
        gridAttractionDistance: 0.002,
        gridAttractionStrength: 0.5,
        gridBranchProbability: 0.12,
        
        // REMOVED GROWTH CAPS - unlimited growth like original!
        useGrowthCaps: false, // NEW: disable growth caps
        minGrowthPerSeed: 300, // Only used if caps enabled
        maxGrowthPerSeed: 800,
        growthVariation: 0.4,
        
        reinforcementRate: 0.05,
        decayRate: 0.012,
        useReinforcement: true,
        useAvoidance: true,
        useDLA: true,
        directionChangeRate: 0.5, // REDUCED from 0.75 - more persistent radial direction
        radialBias: 0.4, // NEW: Bias toward growing away from seed center
        
        // ATTRACTION TO OTHER NETWORKS - adjusted for radial growth
        useAttraction: true,
        attractionDistance: 0.018, // INCREASED - sense networks from farther
        attractionStrength: 0.2, // REDUCED from 0.3 - less aggressive attraction, more radial
        attractionToOtherZones: true,
        
        // ZONE CONFIGURATION
        numberOfZones: 16, // INCREASED from 12 - doubled
        seedsPerZone: 30, // INCREASED from 20 - 1.5x increase
        tipsPerZone: 30,
        zoneRotation: true,
        
        // GROWTH DYNAMICS
        allowZoneCompetition: true,
        competitionPressure: 0.20
    };
    
    function waitForMap() {
        if (window.sharedMap && window.sharedMap.loaded()) {
            initMyceliumSimulation();
        } else if (window.sharedMap) {
            window.sharedMap.on('load', initMyceliumSimulation);
        } else {
            setTimeout(waitForMap, 100);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForMap);
    } else {
        waitForMap();
    }
    
    function initMyceliumSimulation() {
        map = window.sharedMap;
        console.log('🍄 Initializing hybrid organic mycelium simulation...');
        
        canvas = document.createElement('canvas');
        canvas.id = 'myceliumCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.right = '0';
        canvas.style.width = '60%';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '999';
        canvas.style.opacity = '0';
        canvas.style.transition = 'opacity 1s ease';
        document.body.appendChild(canvas);
        
        ctx = canvas.getContext('2d');
        
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        
        map.on('move', () => {
            if (nodes.length > 0) draw();
        });
        
        map.on('zoom', () => {
            if (nodes.length > 0) draw();
        });
        
        setupScrollObserver();
        
        simulationInitialized = true;
        console.log('✅ Hybrid mycelium ready');
    }
    
    function updateCanvasSize() {
        const mapContainer = document.getElementById('map');
        const rect = mapContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        if (nodes.length > 0) draw();
    }
    
    function setupScrollObserver() {
        const allSteps = document.querySelectorAll('.step');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const heading = entry.target.querySelector('h2');
                    const isHiddenNetwork = heading && heading.textContent.includes('THE HIDDEN NETWORK');
                    const isFullNetwork = heading && heading.textContent.includes('THE FULL NETWORK');
                    
                    if (isHiddenNetwork) {
                        // Start growing
                        console.log('🍄 Starting mycelium growth');
                        activateSimulation();
                    } else if (isFullNetwork) {
                        // Freeze growth but keep visible
                        console.log('🍄 Freezing mycelium growth (keeping visible)');
                        if (isRunning) {
                            isRunning = false;
                            if (animationFrame) {
                                cancelAnimationFrame(animationFrame);
                                animationFrame = null;
                            }
                            // Keep canvas visible at current opacity
                        }
                    } else {
                        // Hide on other sections
                        if (isRunning || canvas.style.opacity !== '0') {
                            console.log('🍄 Pausing and hiding mycelium');
                            pauseSimulation();
                        }
                    }
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px'
        });
        
        allSteps.forEach(step => {
            observer.observe(step);
        });
    }
    
    function activateSimulation() {
        if (!treesLoaded && !loadingTrees) {
            canvas.style.opacity = '1';
            loadTreeData();
        } else if (treesLoaded && !isRunning) {
            canvas.style.opacity = '1';
            startSimulation();
        } else if (treesLoaded && isRunning) {
            // Already running - just ensure canvas is visible
            canvas.style.opacity = '1';
            console.log('🍄 Simulation already running, keeping it active');
        }
    }
    
    function pauseSimulation() {
        isRunning = false;
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        canvas.style.opacity = '0';
    }
    
    function startSimulation() {
        if (seeds.length === 0) {
            console.warn('No seeds available');
            return;
        }
        
        isRunning = true;
        canvas.style.opacity = '1';
        
        if (activeTips.length === 0) {
            spawnInitialTips();
        }
        
        simulationStep();
    }
    
    // ===== GRID FUNCTIONS =====
    
    /**
     * Load complete-grid.geojson from same directory as HTML file
     */
    async function loadCompleteGrid() {
        try {
            console.log('🗺️ Loading complete-grid.geojson...');
            
            // Fetch from same directory as the HTML file
            // Make sure complete-grid.geojson is in the same folder as your HTML file
            const response = await fetch('./complete-grid.geojson');
            
            if (!response.ok) {
                throw new Error(`Failed to load complete-grid.geojson: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const grid = [];
            
            console.log(`📥 Loaded GeoJSON with ${data.features.length} features`);
            
            // Convert GeoJSON features to grid format
            data.features.forEach(feature => {
                if (feature.geometry && feature.geometry.type === 'LineString') {
                    const coords = feature.geometry.coordinates;
                    // Remove z-coordinate (0.0) and keep only [lng, lat]
                    const coords2D = coords.map(c => [c[0], c[1]]);
                    if (coords2D.length > 1) {
                        grid.push(coords2D);
                    }
                } else if (feature.geometry && feature.geometry.type === 'MultiLineString') {
                    feature.geometry.coordinates.forEach(lineString => {
                        const coords2D = lineString.map(c => [c[0], c[1]]);
                        if (coords2D.length > 1) {
                            grid.push(coords2D);
                        }
                    });
                }
            });
            
            console.log(`✅ Loaded ${grid.length} street segments from complete-grid.geojson`);
            
            // ADD GRID TO MAP AS VISIBLE LAYER
            if (map) {
                try {
                    map.addSource('street-grid', {
                        type: 'geojson',
                        data: data
                    });
                    
                    map.addLayer({
                        id: 'street-grid-layer',
                        type: 'line',
                        source: 'street-grid',
                        paint: {
                            'line-color': '#928b88ff',
                            'line-width': 1,
                            'line-opacity': 0.7
                        }
                    });
                    
                    console.log('✅ Added street grid to map');
                } catch (mapError) {
                    console.error('Error adding grid to map:', mapError);
                }
            }
            
            return grid;
            
        } catch (error) {
            console.error('Error loading complete-grid.geojson:', error);
            console.log('⚠️ Grid following disabled - continuing without grid');
            console.log('💡 To enable grid: Place complete-grid.geojson in the same folder as your HTML file');
            return [];
        }
    }
    
    /**
     * Find nearest point on street grid
     */
    function findNearestGridPoint(lng, lat) {
        if (streetGrid.length === 0) return null;
        
        let nearestDist = Infinity;
        let nearestPoint = null;
        let nearestDirection = null;
        
        for (let street of streetGrid) {
            for (let i = 0; i < street.length - 1; i++) {
                const p1 = street[i];
                const p2 = street[i + 1];
                
                const closest = closestPointOnSegment(lng, lat, p1[0], p1[1], p2[0], p2[1]);
                const dist = Math.sqrt(
                    Math.pow(lng - closest.lng, 2) + 
                    Math.pow(lat - closest.lat, 2)
                );
                
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestPoint = closest;
                    nearestDirection = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
                }
            }
        }
        
        return nearestDist < config.gridAttractionDistance ? 
            { point: nearestPoint, direction: nearestDirection, distance: nearestDist } : 
            null;
    }
    
    /**
     * Find closest point on a line segment
     */
    function closestPointOnSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        
        if (lengthSquared === 0) {
            return { lng: x1, lat: y1 };
        }
        
        let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
        t = Math.max(0, Math.min(1, t));
        
        return {
            lng: x1 + t * dx,
            lat: y1 + t * dy
        };
    }
    
    // ===== END GRID FUNCTIONS =====
    
    // ===== ZONE-BASED DISTRIBUTION =====
    
    function createGeographicZones(bounds, numZones) {
        const zones = [];
        const latRange = bounds.maxLat - bounds.minLat;
        const lngRange = bounds.maxLng - bounds.minLng;
        
        const cols = Math.ceil(Math.sqrt(numZones));
        const rows = Math.ceil(numZones / cols);
        
        const latStep = latRange / rows;
        const lngStep = lngRange / cols;
        
        let zoneId = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (zoneId >= numZones) break;
                
                const zone = {
                    id: zoneId++,
                    bounds: {
                        minLat: bounds.minLat + row * latStep,
                        maxLat: bounds.minLat + (row + 1) * latStep,
                        minLng: bounds.minLng + col * lngStep,
                        maxLng: bounds.minLng + (col + 1) * lngStep
                    },
                    seeds: [],
                    activeTipCount: 0,
                    totalGrowth: 0, // Track total growth in zone
                    competitiveness: 0.8 + Math.random() * 0.4 // 0.8-1.2 variation
                };
                zones.push(zone);
            }
        }
        
        console.log(`🗺️ Created ${zones.length} zones with varying competitiveness`);
        return zones;
    }
    
    // NEW: Calculate location weight for seed distribution
    function getLocationWeight(lat, lng) {
        // Manhattan bounds for reference
        const manhattanCenter = {
            lat: 40.7831,  // ~Midtown
            lng: -73.9712
        };
        const southTip = 40.705;   // Battery Park area
        const northTip = 40.877;   // Inwood
        
        // Distance from center (normalized)
        const distFromCenter = Math.sqrt(
            Math.pow(lat - manhattanCenter.lat, 2) + 
            Math.pow(lng - manhattanCenter.lng, 2)
        );
        
        // Check if in southern tip (below 40.715)
        const inSouthTip = lat < 40.715;
        
        // Check if in northern tip (above 40.860)
        const inNorthTip = lat > 40.860;
        
        // Base weight starts at 1.0
        let weight = 1.0;
        
        // Boost center area (within ~2km radius)
        if (distFromCenter < 0.025) {
            weight = 3.0;  // 3x more likely
        } else if (distFromCenter < 0.040) {
            weight = 2.0;  // 2x more likely
        }
        
        // Boost southern tip
        if (inSouthTip) {
            weight = Math.max(weight, 2.5);
        }
        
        // Boost northern tip
        if (inNorthTip) {
            weight = Math.max(weight, 2.5);
        }
        
        return weight;
    }
    
    function distributeTreesToZones(trees, zones, seedsPerZone) {
        trees.forEach(tree => {
            const lat = parseFloat(tree.latitude);
            const lng = parseFloat(tree.longitude);
            
            if (isNaN(lat) || isNaN(lng)) return;
            
            for (let zone of zones) {
                if (lat >= zone.bounds.minLat && lat < zone.bounds.maxLat &&
                    lng >= zone.bounds.minLng && lng < zone.bounds.maxLng) {
                    
                    if (!zone.trees) zone.trees = [];
                    zone.trees.push({ lat, lng, tree });
                    break;
                }
            }
        });
        
        let totalSeeds = 0;
        zones.forEach(zone => {
            if (!zone.trees || zone.trees.length === 0) {
                console.log(`⚠️ Zone ${zone.id}: no trees`);
                return;
            }
            
            // Add location weights to trees
            zone.trees.forEach(tree => {
                tree.weight = getLocationWeight(tree.lat, tree.lng);
            });
            
            // Weighted spatial sampling within zone
            const gridSize = Math.sqrt(zone.trees.length / seedsPerZone);
            const subGrid = new Map();
            
            zone.trees.forEach(tree => {
                const gridX = Math.floor((tree.lng - zone.bounds.minLng) / 
                    ((zone.bounds.maxLng - zone.bounds.minLng) / gridSize));
                const gridY = Math.floor((tree.lat - zone.bounds.minLat) / 
                    ((zone.bounds.maxLat - zone.bounds.minLat) / gridSize));
                const key = `${gridX},${gridY}`;
                
                // Keep tree with highest weight in each grid cell
                if (!subGrid.has(key) || tree.weight > subGrid.get(key).weight) {
                    subGrid.set(key, tree);
                }
            });
            
            // Sort by weight and take top seeds
            const sortedSeeds = Array.from(subGrid.values())
                .sort((a, b) => b.weight - a.weight)
                .slice(0, seedsPerZone);
            
            zone.seeds = sortedSeeds;
            totalSeeds += zone.seeds.length;
            
            const avgWeight = zone.seeds.reduce((sum, s) => sum + s.weight, 0) / zone.seeds.length;
            console.log(`📍 Zone ${zone.id}: ${zone.trees.length} trees → ${zone.seeds.length} seeds (avg weight: ${avgWeight.toFixed(2)}, competitiveness: ${zone.competitiveness.toFixed(2)})`);
        });
        
        console.log(`✅ Total seeds: ${totalSeeds} (weighted for center & tips)`);
        return zones;
    }
    
    // ===== DATA LOADING =====
    
    function loadTreeData() {
        if (loadingTrees || treesLoaded) return;
        
        loadingTrees = true;
        console.log('🌳 Loading tree data with hybrid distribution...');
        
        Promise.all([
            fetch('https://data.cityofnewyork.us/resource/uvpi-gqnh.json?$limit=50000&$where=latitude IS NOT NULL AND longitude IS NOT NULL AND boroname=\'Manhattan\'')
                .then(r => r.json()),
            fetch('https://data.cityofnewyork.us/resource/tqmj-j8zm.geojson?boro_name=Manhattan')
                .then(r => r.json()),
            loadCompleteGrid() // Load the user's grid file
        ])
        .then(([treeData, boundaryData, gridData]) => {
            console.log(`📥 Received ${treeData.length} trees`);
            
            if (boundaryData.features && boundaryData.features.length > 0) {
                manhattanBoundary = boundaryData.features[0].geometry;
                console.log('✅ Manhattan boundary ready');
            }
            
            // Store street grid
            streetGrid = gridData;
            
            const manhattanBounds = {
                minLng: -74.02,
                maxLng: -73.907,
                minLat: 40.700,
                maxLat: 40.882
            };
            
            // Create zones
            zones = createGeographicZones(manhattanBounds, config.numberOfZones);
            zones = distributeTreesToZones(treeData, zones, config.seedsPerZone);
            
            // Create seed nodes with zone tracking
            // FILTER OUT Central Park area to prevent clustering
            const centralParkBounds = {
                minLat: 40.764,
                maxLat: 40.800,
                minLng: -73.982,
                maxLng: -73.949
            };
            
            zones.forEach(zone => {
                zone.seeds.forEach(seedData => {
                    // Skip seeds in Central Park area
                    if (seedData.lat >= centralParkBounds.minLat && 
                        seedData.lat <= centralParkBounds.maxLat &&
                        seedData.lng >= centralParkBounds.minLng && 
                        seedData.lng <= centralParkBounds.maxLng) {
                        console.log('Skipping seed in Central Park area');
                        return;
                    }
                    
                    const seed = new Node(seedData.lat, seedData.lng, null, true, zone.id);
                    seed.descendantCount = 0;
                    
                    zone.seedNodes = zone.seedNodes || [];
                    zone.seedNodes.push(seed);
                    seeds.push(seed);
                    nodes.push(seed);
                });
            });
            
            console.log(`✅ Created ${seeds.length} seeds across ${zones.length} zones`);
            console.log(`🚀 Unlimited growth mode - networks will grow continuously!`);
            
            treesLoaded = true;
            loadingTrees = false;
            
            draw();
            setTimeout(() => startSimulation(), 500);
        })
        .catch(error => {
            console.error('❌ Error loading data:', error);
            loadingTrees = false;
        });
    }
    
    function isInsideManhattan(lng, lat) {
        if (!manhattanBoundary) {
            // Fallback with tighter bounds
            return lat >= 40.705 && lat <= 40.877 &&
                   lng >= -74.015 && lng <= -73.912;
        }
        
        const point = [lng, lat];
        let inside = false;
        
        if (manhattanBoundary.type === 'MultiPolygon') {
            for (let polygon of manhattanBoundary.coordinates) {
                if (pointInPolygon(point, polygon[0])) {
                    inside = true;
                    break;
                }
            }
        } 
        else if (manhattanBoundary.type === 'Polygon') {
            inside = pointInPolygon(point, manhattanBoundary.coordinates[0]);
        }
        
        if (!inside) return false;
        
        // Add buffer: Check if we're too close to boundary
        const buffer = 0.0008; // ~90m buffer from edge
        const testPoints = [
            [lng + buffer, lat],
            [lng - buffer, lat],
            [lng, lat + buffer],
            [lng, lat - buffer]
        ];
        
        // If any nearby point is outside, we're too close
        for (let testPoint of testPoints) {
            let testInside = false;
            
            if (manhattanBoundary.type === 'MultiPolygon') {
                for (let polygon of manhattanBoundary.coordinates) {
                    if (pointInPolygon(testPoint, polygon[0])) {
                        testInside = true;
                        break;
                    }
                }
            } else if (manhattanBoundary.type === 'Polygon') {
                testInside = pointInPolygon(testPoint, manhattanBoundary.coordinates[0]);
            }
            
            if (!testInside) {
                return false; // Too close to edge
            }
        }
        
        return true;
    }
    
    function pointInPolygon(point, polygon) {
        const x = point[0], y = point[1];
        let inside = false;
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            
            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    // ===== NODE & TIP CLASSES =====
    
    class Node {
        constructor(lat, lng, parent = null, isSeed = false, zoneId = null) {
            this.lat = lat;
            this.lng = lng;
            this.parent = parent;
            this.children = [];
            this.isSeed = isSeed;
            this.thickness = isSeed ? 3 : 1;
            this.flow = 0;
            this.zoneId = zoneId !== null ? zoneId : (parent ? parent.zoneId : null);
            this.rootSeed = isSeed ? this : (parent ? parent.rootSeed : null);
            
            if (parent) {
                parent.children.push(this);
            }
        }
        
        getPixel() {
            return map.project([this.lng, this.lat]);
        }
        
        distance(other) {
            const dlat = this.lat - other.lat;
            const dlng = this.lng - other.lng;
            return Math.sqrt(dlat * dlat + dlng * dlng);
        }
    }
    
    class ActiveTip {
        constructor(node, direction = null) {
            this.node = node;
            this.direction = direction !== null ? direction : Math.random() * Math.PI * 2;
            this.stepsSinceDirectionChange = 0;
            this.zoneId = node.zoneId;
            this.rootSeed = node.rootSeed;
        }
        
        step() {
            // REMOVED: Growth cap check - growth is now unlimited!
            
            // GRID FOLLOWING BEHAVIOR (if grid is loaded)
            if (config.useGridFollowing && streetGrid.length > 0) {
                const gridInfo = findNearestGridPoint(this.node.lng, this.node.lat);
                
                if (gridInfo) {
                    // Pull toward grid line and align with street direction
                    const angleToGrid = Math.atan2(
                        gridInfo.point.lat - this.node.lat,
                        gridInfo.point.lng - this.node.lng
                    );
                    
                    // Blend with grid direction
                    this.direction = this.direction * (1 - config.gridAttractionStrength) + 
                                    gridInfo.direction * config.gridAttractionStrength;
                    
                    // Also pull toward the grid line itself if not on it yet
                    if (gridInfo.distance > 0.0003) {
                        this.direction = this.direction * 0.7 + angleToGrid * 0.3;
                    }
                    
                    // Chance to branch radially OFF the grid
                    if (gridInfo.distance < 0.0002 && Math.random() < config.gridBranchProbability) {
                        const radialDirection = this.direction + (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2;
                        const radialTip = new ActiveTip(this.node, radialDirection);
                        
                        return [new ActiveTip(this.node, this.direction), radialTip];
                    }
                }
            }
            
            // RADIAL BIAS: Encourage outward growth from seed center
            if (config.radialBias && this.rootSeed) {
                const angleFromSeed = Math.atan2(
                    this.node.lat - this.rootSeed.lat,
                    this.node.lng - this.rootSeed.lng
                );
                
                // Blend current direction with radial direction
                this.direction = this.direction * (1 - config.radialBias) + 
                                angleFromSeed * config.radialBias;
            }
            
            if (config.useDLA) {
                this.stepsSinceDirectionChange++;
                
                // Less frequent direction changes for more radial growth
                if (this.stepsSinceDirectionChange > 8 || Math.random() < config.directionChangeRate) {
                    this.direction += (Math.random() - 0.5) * 0.8; // REDUCED from 1.2 - smaller random changes
                    this.stepsSinceDirectionChange = 0;
                }
            }
            
            // NEW: ATTRACTION TO OTHER NETWORKS
            if (config.useAttraction) {
                // Find nearby nodes from OTHER seeds/zones
                const nearbyOtherNetworks = nodes.filter(n => {
                    if (n === this.node || n === this.rootSeed) return false;
                    
                    // If attracting to other zones only, check zone ID
                    if (config.attractionToOtherZones && n.zoneId === this.zoneId) return false;
                    
                    // Otherwise, just check if it's from a different seed
                    if (n.rootSeed === this.rootSeed) return false;
                    
                    const dist = this.node.distance(n);
                    return dist < config.attractionDistance && dist > config.avoidanceDistance;
                });
                
                if (nearbyOtherNetworks.length > 0) {
                    // Calculate average direction toward other networks
                    const avgLat = nearbyOtherNetworks.reduce((s, n) => s + n.lat, 0) / nearbyOtherNetworks.length;
                    const avgLng = nearbyOtherNetworks.reduce((s, n) => s + n.lng, 0) / nearbyOtherNetworks.length;
                    
                    // Only apply attraction if target is within Manhattan
                    if (isInsideManhattan(avgLng, avgLat)) {
                        const attractionAngle = Math.atan2(
                            avgLat - this.node.lat,
                            avgLng - this.node.lng
                        );
                        
                        // Blend current direction with attraction angle
                        this.direction = this.direction * (1 - config.attractionStrength) + 
                                        attractionAngle * config.attractionStrength;
                    }
                }
            }
            
            if (config.useAvoidance) {
                // Only avoid nodes from the SAME network (same rootSeed)
                const nearby = nodes.filter(n =>
                    n.rootSeed === this.rootSeed &&
                    this.node.distance(n) < config.avoidanceDistance
                );
                
                if (nearby.length > 6) {
                    const avgLat = nearby.reduce((s, n) => s + n.lat, 0) / nearby.length;
                    const avgLng = nearby.reduce((s, n) => s + n.lng, 0) / nearby.length;
                    const awayAngle = Math.atan2(
                        this.node.lat - avgLat,
                        this.node.lng - avgLng
                    );
                    this.direction = this.direction * 0.5 + awayAngle * 0.5;
                }
            }
            
            const newLat = this.node.lat + Math.sin(this.direction) * config.stepSize;
            const newLng = this.node.lng + Math.cos(this.direction) * config.stepSize;
            
            // CRITICAL: Check Manhattan boundary FIRST before any other checks
            if (!isInsideManhattan(newLng, newLat)) {
                return null; // Kill tip immediately if outside Manhattan
            }
            
            // HYBRID KILL DISTANCE: Blend network and seed-based approaches
            if (config.useHybridKillDistance && this.rootSeed) {
                const distFromSeed = Math.sqrt(
                    (newLat - this.rootSeed.lat)**2 + 
                    (newLng - this.rootSeed.lng)**2
                );
                
                const nearestNodeDist = Math.min(...nodes.map(n =>
                    Math.sqrt((newLat - n.lat)**2 + (newLng - n.lng)**2)
                ));
                
                // Weighted combination of both distances
                const hybridDist = 
                    distFromSeed * (1 - config.networkKillWeight) + 
                    nearestNodeDist * config.networkKillWeight;
                
                if (hybridDist > config.killDistance) {
                    return null;
                }
            }
            
            // Double-check boundary before creating node (safety check)
            if (!isInsideManhattan(newLng, newLat)) {
                return null;
            }
            
            const newNode = new Node(newLat, newLng, this.node, false);
            nodes.push(newNode);
            
            if (this.rootSeed) {
                this.rootSeed.descendantCount++;
            }
            
            if (this.zoneId !== null && zones[this.zoneId]) {
                zones[this.zoneId].totalGrowth++;
            }
            
            if (config.useReinforcement) {
                let current = newNode;
                while (current.parent) {
                    current.flow += config.reinforcementRate;
                    current.thickness = Math.min(5, 1 + current.flow * 0.5);
                    current = current.parent;
                }
            }
            
            if (Math.random() < config.branchProbability) {
                const branchAngleVariation = (Math.random() - 0.5) * config.branchAngle;
                const branchDirection = this.direction + (Math.random() < 0.5 ? 1 : -1) * (config.branchAngle + branchAngleVariation);
                
                const branchTip = new ActiveTip(newNode, branchDirection);
                return [new ActiveTip(newNode, this.direction), branchTip];
            }
            
            return new ActiveTip(newNode, this.direction);
        }
    }
    
    // ===== SIMULATION LOGIC =====
    
    function spawnInitialTips() {
        activeTips = [];
        
        zones.forEach(zone => {
            if (!zone.seedNodes || zone.seedNodes.length === 0) return;
            
            // Spawn tips radially from each seed for better circular growth
            zone.seedNodes.forEach(seed => {
                // Spawn 4 tips in cardinal directions for radial pattern
                const directions = [0, Math.PI/2, Math.PI, 3*Math.PI/2]; // N, E, S, W
                directions.forEach(baseDirection => {
                    const direction = baseDirection + (Math.random() - 0.5) * 0.5; // Slight randomness
                    const tip = new ActiveTip(seed, direction);
                    activeTips.push(tip);
                });
            });
            
            zone.activeTipCount = zone.seedNodes.length * 4;
        });
        
        console.log(`🌱 Spawned ${activeTips.length} radial tips with zone-based variation`);
    }
    
    function simulationStep() {
        if (!isRunning || seeds.length === 0) return;
        
        for (let step = 0; step < config.stepsPerFrame; step++) {
            const newTips = [];
            
            // Update zone statistics
            zones.forEach(z => z.activeTipCount = 0);
            activeTips.forEach(tip => {
                if (tip.zoneId !== null && zones[tip.zoneId]) {
                    zones[tip.zoneId].activeTipCount++;
                }
            });
            
            for (let i = activeTips.length - 1; i >= 0; i--) {
                const result = activeTips[i].step();
                
                if (result === null) {
                    activeTips.splice(i, 1);
                } else if (Array.isArray(result)) {
                    activeTips.splice(i, 1);
                    newTips.push(...result);
                } else {
                    activeTips[i] = result;
                }
            }
            
            activeTips.push(...newTips);
            
            if (activeTips.length > config.maxActiveTips) {
                activeTips = activeTips.slice(0, config.maxActiveTips);
            }
            
            // BALANCED SPAWNING with zone awareness
            if (config.allowZoneCompetition) {
                // Calculate zone pressure based on growth
                const avgZoneGrowth = zones.reduce((s, z) => s + z.totalGrowth, 0) / zones.length;
                
                zones.forEach(zone => {
                    if (!zone.seedNodes || zone.seedNodes.length === 0) return;
                    
                    // Zones with less growth get boost
                    const growthRatio = avgZoneGrowth > 0 ? zone.totalGrowth / avgZoneGrowth : 1;
                    const targetTips = config.tipsPerZone * zone.competitiveness;
                    const pressure = (1 - growthRatio) * config.competitionPressure;
                    const adjustedTarget = targetTips * (1 + pressure);
                    
                    const deficit = Math.floor(adjustedTarget - zone.activeTipCount);
                    
                    if (deficit > 0 && activeTips.length < config.maxActiveTips) {
                        for (let i = 0; i < Math.min(deficit, 4); i++) {
                            const zoneNodes = nodes.filter(n => n.zoneId === zone.id);
                            if (zoneNodes.length > 0) {
                                const randomNode = zoneNodes[Math.floor(Math.random() * Math.min(50, zoneNodes.length))];
                                activeTips.push(new ActiveTip(randomNode));
                                zone.activeTipCount++;
                            }
                        }
                    }
                });
            }
            
            iteration++;
        }
        
        if (config.useReinforcement && iteration % 50 === 0) {
            nodes.forEach(n => {
                n.flow *= (1 - config.decayRate);
                n.thickness = Math.min(5, Math.max(0.5, 1 + n.flow * 0.5));
            });
        }
        
        draw();
        animationFrame = requestAnimationFrame(simulationStep);
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        nodes.forEach(node => {
            if (!node.parent) return;
            
            const p1 = node.getPixel();
            const p2 = node.parent.getPixel();
            
            if (p1.x < 0 || p1.x > canvas.width || p1.y < 0 || p1.y > canvas.height) return;
            if (p2.x < 0 || p2.x > canvas.width || p2.y < 0 || p2.y > canvas.height) return;
            
            // GREEN to WHITE color gradient based on flow
            const flowIntensity = Math.min(1, node.flow / 2);
            
            if (flowIntensity > 0.6) {
                // High flow: White/Cyan color
                const whiteness = (flowIntensity - 0.6) / 0.4; // 0 to 1
                const r = 119 + (255 - 119) * whiteness;
                const g = 192 + (255 - 192) * whiteness;
                const b = 73 + (255 - 73) * whiteness;
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.7 + whiteness * 0.2})`;
            } else {
                // Low to medium flow: Green shades
                const hue = 120; // Green
                const lightness = 45 + flowIntensity * 20;
                ctx.strokeStyle = `hsla(${hue}, 70%, ${lightness}%, 0.7)`;
            }
            
            ctx.lineWidth = node.thickness;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
        });
        
        nodes.forEach(node => {
            if (!node.isSeed) return;
            
            const p = node.getPixel();
            if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) return;
            
            // Green seeds
            ctx.fillStyle = 'rgba(119, 192, 73, 0.6)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        activeTips.forEach(tip => {
            const p = tip.node.getPixel();
            if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) return;
            
            // Bright green-white tips
            ctx.fillStyle = 'rgba(180, 230, 120, 0.6)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

 // ===== EXPORT FUNCTIONS =====
    
    // Export as GeoJSON
    window.exportMyceliumGeoJSON = function(filename = 'mycelium-network.geojson') {
        const features = [];
        
        // Export each edge as a LineString
        nodes.forEach(node => {
            if (!node.parent) return;
            
            features.push({
                type: 'Feature',
                properties: {
                    thickness: node.thickness,
                    flow: node.flow,
                    zoneId: node.zoneId,
                    isSeed: node.isSeed
                },
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [node.parent.lng, node.parent.lat],
                        [node.lng, node.lat]
                    ]
                }
            });
        });
        
        // Add seed points
        seeds.forEach(seed => {
            features.push({
                type: 'Feature',
                properties: {
                    type: 'seed',
                    zoneId: seed.zoneId,
                    descendantCount: seed.descendantCount
                },
                geometry: {
                    type: 'Point',
                    coordinates: [seed.lng, seed.lat]
                }
            });
        });
        
        const geojson = {
            type: 'FeatureCollection',
            features: features
        };
        
        // Download
        const blob = new Blob([JSON.stringify(geojson, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log(`✅ Exported ${features.length} features as GeoJSON`);
    };
    
    // Export as transparent PNG
    window.exportMyceliumTransparent = function(filename = 'mycelium-transparent.png') {
        if (!canvas) {
            console.error('Canvas not initialized');
            return;
        }
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
        
        console.log('✅ Exported transparent mycelium PNG');
    };
    
    console.log('🍄 Ultra-growth mycelium with attraction & UNLIMITED growth loaded');
    console.log('💾 Export functions available: exportMyceliumGeoJSON(), exportMyceliumTransparent()');

})();
