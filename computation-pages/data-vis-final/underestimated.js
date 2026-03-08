(function () {
  "use strict";

        const file = "./dataset/slim/slim_energy_nyc_22_23_24.csv";

        function parse24(d) {
            return {
                year: +d["Calendar Year"],
                dcFloorArea: d["Data Center - Gross Floor Area (ft²)"],
                propertyName: d["Property Name"] || "Unknown" 
            };
        }

        function parseNumber(value) {
            if (value === null || value === undefined) return 0;
            if (typeof value === "number") return isFinite(value) ? value : 0;
            const s = String(value).trim();
            if (!s || s.toLowerCase() === "not available") return 0;
            const n = +s.replace(/,/g, "");
            return isFinite(n) ? n : 0;
        }

        function isDataCenter(d) {
            const floor = parseNumber(d.dcFloorArea);
            return floor > 0;
        }

        if (typeof d3 === "undefined") {
            console.error("[underestimated] D3 not found. Load d3.v7 before underestimated.js");
            return;
        }

        const __par = document.getElementById("par-chart");
        if (!__par) {
            console.warn("[underestimated] Missing #par-chart mount. Skipping render.");
            return;
        }

        d3.csv(file, parse24).then((d24) => {
            const data = d24.sort((a, b) => a.year - b.year);
            const dc = data.filter(isDataCenter);

            const dc2023 = dc.filter(d => d.year === 2023);
            const dc2024 = dc.filter(d => d.year === 2024);

            const props2023 = new Set(dc2023.map(d => d.propertyName));
            const props2024 = new Set(dc2024.map(d => d.propertyName));
            
            const lostBuildings = [...props2023].filter(p => !props2024.has(p));
            const newBuildings = [...props2024].filter(p => !props2023.has(p));
            const retainedBuildings = [...props2023].filter(p => props2024.has(p));

            const totalGFA2023 = dc2023.reduce((sum, d) => sum + parseNumber(d.dcFloorArea), 0);
            const totalGFA2024 = dc2024.reduce((sum, d) => sum + parseNumber(d.dcFloorArea), 0);

            const buildingCount2023 = props2023.size;
            const buildingCount2024 = props2024.size;

            const lostBuildingsSet = new Set(lostBuildings);
            const newBuildingsSet = new Set(newBuildings);
            const retainedBuildingsSet = new Set(retainedBuildings);

            const retainedArea2024 = dc2024
                .filter(d => retainedBuildingsSet.has(d.propertyName))
                .reduce((sum, d) => sum + parseNumber(d.dcFloorArea), 0);

            const lostArea = dc2023
                .filter(d => lostBuildingsSet.has(d.propertyName))
                .reduce((sum, d) => sum + parseNumber(d.dcFloorArea), 0);

            const newArea = dc2024
                .filter(d => newBuildingsSet.has(d.propertyName))
                .reduce((sum, d) => sum + parseNumber(d.dcFloorArea), 0);

            const margin = { top: 100, right: 100, bottom: 100, left: 100 };
            const width = 800 - margin.left - margin.right;
            const height = 600 - margin.top - margin.bottom;

            const svg = d3.select("#par-chart")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const barWidth = 200;
            const barX = width / 2 - barWidth / 2;

            const areaScale = d3.scaleLinear()
                .domain([0, totalGFA2024 * 1.15])
                .range([0, height - 100]);

            // Theme colors (dark UI)
            const C_TEXT = "#e5e7eb";
            const C_MUTED = "#9ca3af";
            const C_GRID = "rgba(255,255,255,0.10)";
            const C_BASELINE = "rgba(255,255,255,0.16)";
            const C_BLUE = "#25baed";
            const C_BLUE_SOFT = "#25baed";
            const C_CYAN = "#67c5ac";
            const C_ALERT = "#ec2c3d";

            // Title
            const title = svg.append("text")
                .attr("x", width / 2)
                .attr("y", -50)
                .attr("text-anchor", "middle")
                .style("font-size", "28px")
                .style("font-weight", "bold")
                .text("NYC Data Centers' Underestimated Boom");

            // Building count
            const buildingCount = svg.append("text")
                .attr("x", width / 2)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .style("font-size", "48px")
                .style("font-weight", "bold")
                .style("fill", C_BLUE)
                .text(buildingCount2023);

            const buildingLabel = svg.append("text")
                .attr("x", width / 2)
                .attr("y", 20)
                .attr("text-anchor", "middle")
                .style("font-size", "18px")
                .style("fill", C_MUTED)
                .text("Buildings reported");

            // 2023 baseline (dotted line)
            const baseline2023Height = areaScale(totalGFA2023);
            const baseline2023Y = height - baseline2023Height;
            
            const baselineLine = svg.append("line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", baseline2023Y)
                .attr("y2", baseline2023Y)
                .attr("stroke", C_BASELINE)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "8,4")
                .attr("opacity", 0);

            const baselineLabel = svg.append("text")
                .attr("x", width - 10)
                .attr("y", baseline2023Y - 8)
                .attr("text-anchor", "end")
                .style("font-size", "14px")
                .style("fill", C_MUTED)
                .style("font-weight", "600")
                .text(`2023: ${(totalGFA2023 / 1000000).toFixed(2)}M ft²`)
                .attr("opacity", 0);

            // Main bar (retained area)
            const mainBar = svg.append("rect")
                .attr("x", barX)
                .attr("y", height - baseline2023Height)
                .attr("width", barWidth)
                .attr("height", baseline2023Height)
                .attr("fill", C_BLUE_SOFT)
                .attr("rx", 8);

            // New area bar (will stack on top)
            const newBar = svg.append("rect")
                .attr("x", barX)
                .attr("y", height)
                .attr("width", barWidth)
                .attr("height", 0)
                .attr("fill", C_CYAN)
                .attr("rx", 8)
                .attr("opacity", 0);

            // Floor area label
            const areaLabel = svg.append("text")
                .attr("x", width / 2)
                .attr("y", height - baseline2023Height - 15)
                .attr("text-anchor", "middle")
                .style("font-size", "24px")
                .style("font-weight", "bold")
                .text(`${(totalGFA2023 / 1000000).toFixed(2)}M ft²`);
            areaLabel.style("fill", C_TEXT);

            // Lost buildings indicator
            const lostLabel = svg.append("text")
                .attr("x", barX - 20)
                .attr("y", height - areaScale(lostArea) / 2)
                .attr("text-anchor", "end")
                .style("font-size", "14px")
                .style("fill", C_ALERT)
                .style("font-weight", "600")
                .attr("opacity", 0)
                .text(`-${lostBuildings.length} buildings`);

            const lostLabel2 = svg.append("text")
                .attr("x", barX - 20)
                .attr("y", height - areaScale(lostArea) / 2 + 18)
                .attr("text-anchor", "end")
                .style("font-size", "13px")
                .style("fill", C_ALERT)
                .attr("opacity", 0)
                .text(`(${(lostArea / 1000000).toFixed(2)}M ft²)`);

            // New buildings indicator
            const newLabel = svg.append("text")
                .attr("x", barX + barWidth + 20)
                .attr("y", height - areaScale(retainedArea2024) - areaScale(newArea) / 2)
                .attr("text-anchor", "start")
                .style("font-size", "14px")
                .style("fill", C_CYAN)
                .style("font-weight", "600")
                .attr("opacity", 0)
                .text(`+${newBuildings.length} buildings`);

            const newLabel2 = svg.append("text")
                .attr("x", barX + barWidth + 20)
                .attr("y", height - areaScale(retainedArea2024) - areaScale(newArea) / 2 + 18)
                .attr("text-anchor", "start")
                .style("font-size", "13px")
                .style("fill", C_CYAN)
                .attr("opacity", 0)
                .text(`(${(newArea / 1000000).toFixed(2)}M ft²)`);

            // Baseline
            svg.append("line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", height)
                .attr("y2", height)
                .attr("stroke", C_GRID)
                .attr("stroke-width", 2);

            // Scroll animation
            let currentProgress = 0;

            function updateVisualization(progress) {
                if (progress === currentProgress) return;
                currentProgress = progress;

                if (progress < 0.33) {
                    // Stage 1: Initial state (2023)
                    const t = progress / 0.33;
                    title.text("In 2023, data centers took up millions ft² of floor area");
                    buildingCount.text(buildingCount2023);
                    mainBar
                        .attr("y", height - baseline2023Height)
                        .attr("height", baseline2023Height)
                        .attr("fill", C_BLUE_SOFT);
                    areaLabel
                        .attr("y", height - baseline2023Height - 15)
                        .text(`${(totalGFA2023 / 1000000).toFixed(2)}M ft²`);
                    newBar.attr("height", 0).attr("opacity", 0);
                    baselineLine.attr("opacity", 0);
                    baselineLabel.attr("opacity", 0);
                    lostLabel.attr("opacity", 0);
                    lostLabel2.attr("opacity", 0);
                    newLabel.attr("opacity", 0);
                    newLabel2.attr("opacity", 0);
                    
                } else if (progress < 0.66) {
                    // Stage 2: Shrink to retained buildings (show lost)
                    const t = (progress - 0.33) / 0.33;
                    title.text("Over a hundred of them didn't report the next year...");
                    
                    const currentCount = Math.round(buildingCount2023 - (buildingCount2023 - retainedBuildings.length) * t);
                    buildingCount.text(currentCount);
                    
                    const currentArea = totalGFA2023 - (totalGFA2023 - retainedArea2024) * t;
                    const currentHeight = areaScale(currentArea);
                    
                    mainBar
                        .attr("y", height - currentHeight)
                        .attr("height", currentHeight)
                        .attr("fill", C_BLUE_SOFT);
                    
                    areaLabel
                        .attr("y", height - currentHeight - 15)
                        .text(`${(currentArea / 1000000).toFixed(2)}M ft²`);
                    
                    baselineLine.attr("opacity", t);
                    baselineLabel.attr("opacity", t);
                    lostLabel.attr("opacity", t).attr("y", height - currentHeight / 2);
                    lostLabel2.attr("opacity", t).attr("y", height - currentHeight / 2 + 18);
                    newBar.attr("height", 0).attr("opacity", 0);
                    newLabel.attr("opacity", 0);
                    newLabel2.attr("opacity", 0);
                    
                } else {
                    // Stage 3: Add new buildings
                    const t = (progress - 0.66) / 0.34;
                    title.text("...But New Giants Enter");
                    
                    const currentBuildingAdd = Math.round(newBuildings.length * t);
                    const currentCount = retainedBuildings.length + currentBuildingAdd;
                    buildingCount.text(currentCount);
                    
                    const retainedHeight = areaScale(retainedArea2024);
                    const newHeight = areaScale(newArea * t);
                    
                    mainBar
                        .attr("y", height - retainedHeight)
                        .attr("height", retainedHeight)
                        .attr("fill", C_BLUE_SOFT);
                    
                    newBar
                        .attr("y", height - retainedHeight - newHeight)
                        .attr("height", newHeight)
                        .attr("opacity", 1);
                    
                    const totalCurrent = retainedArea2024 + newArea * t;
                    areaLabel
                        .attr("y", height - retainedHeight - newHeight - 15)
                        .text(`${(totalCurrent / 1000000).toFixed(2)}M ft²`)
                        .style("fill", totalCurrent > totalGFA2023 ? C_CYAN : C_TEXT);
                    
                    baselineLine.attr("opacity", 1);
                    baselineLabel.attr("opacity", 1);
                    lostLabel.attr("opacity", 0);
                    lostLabel2.attr("opacity", 0);
                    newLabel
                        .attr("opacity", t)
                        .attr("y", height - retainedHeight - newHeight / 2);
                    newLabel2
                        .attr("opacity", t)
                        .attr("y", height - retainedHeight - newHeight / 2 + 18);
                }
            }

            // Scroll listener (faster + smoother)
            // - start earlier in the viewport
            // - compress the scroll range slightly (speedFactor)
            // - render via rAF to avoid “laggy” updates
            const speedFactor = 1.8; // >1 = faster progression

            function computeProgress() {
                const scrollContainer = document.getElementById('underestimateScrolly') || document.getElementById('scroll-container');
                if (!scrollContainer) return 0;

                const rect = scrollContainer.getBoundingClientRect();
                const viewH = window.innerHeight || document.documentElement.clientHeight;

                // Start when the section top hits 80% of viewport, end when it hits 20%
                const start = viewH * 0.8;
                const end = viewH * 0.2;

                // Total travel distance mapped to 0..1
                const total = rect.height + (start - end);
                const current = start - rect.top;

                const p = current / total;
                return Math.min(Math.max(p * speedFactor, 0), 1);
            }

            let ticking = false;
            function onScroll() {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    updateVisualization(computeProgress());
                    ticking = false;
                });
            }

            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', onScroll);

            // Initial render
            updateVisualization(computeProgress());
        }).catch((err) => {
            console.error("[underestimated] Error loading CSV:", file, err);
            const mount = d3.select("#par-chart");
            mount.selectAll("*").remove();
            mount.append("div")
              .style("color", "#fb7185")
              .style("font-family", "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif")
              .style("font-size", "14px")
              .style("padding", "12px 0")
              .text("Could not load dataset/energy_nyc_22_23_24.csv (404 or blocked by GitHub size limits). Use a smaller CSV or host it elsewhere.");
        });
})();