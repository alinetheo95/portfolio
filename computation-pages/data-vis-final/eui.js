(function () {
"use strict";

        // ---- Theme helpers (pull from CSS variables when available) ----
        const ROOT = document.documentElement;
        const cssVar = (name, fallback) => {
            const v = getComputedStyle(ROOT).getPropertyValue(name).trim();
            return v || fallback;
        };

        // Site palette (fallbacks)
        const COLOR_TEXT = cssVar("--text", "rgba(255,255,255,0.88)");
        const COLOR_TEXT_DIM = cssVar("--text-dim", "rgba(255,255,255,0.60)");
        const COLOR_AXIS = cssVar("--axis", "rgba(255,255,255,0.28)");
        const COLOR_GRID = cssVar("--grid", "rgba(255,255,255,0.10)");

        const COLOR_BLUE = cssVar("--blue", "#25baed");
        const COLOR_CYAN = cssVar("--cyan", "#67c5ac");
        const COLOR_PURPLE = cssVar("--purple", "#cba4cc");
        const COLOR_LIME = cssVar("--lime", "#77c049");
        const COLOR_ORANGE = cssVar("--orange", "#f15f31");
        const COLOR_PINK = cssVar("--pink", "#ec2c3d");
        const COLOR_GRAY = cssVar("--muted", "#94a3b8");
        const file24 = "dataset/slim/slim_energy_nyc_22_23_24.csv";

        function parse24(d) {
            return {
                year: +d["Calendar Year"],
                energy: +d["Site Energy Use (kBtu)"],
                ghg: +d["Total (Location-Based) GHG Emissions (Metric Tons CO2e)"],
                dcFloorArea: d["Data Center - Gross Floor Area (ft²)"],
                electricityUse: +d["Electricity Use - Grid Purchase (kBtu)"] || 0,
                propertyName: d["Property Name"] || "Unknown",
                propertyType: d["Primary Property Type - Self Selected"] || "Unknown",
                gfa: +d["Largest Property Use Type - Gross Floor Area (ft²)"] || 0,
                eui: +d["Site EUI (kBtu/ft²)"] || 0
            };
        }

        function parseNumber(value) {
            if (!value || value.toLowerCase?.() === "not available") return 0;
            return +value;
        }

        function isDataCenter(d) {
            const floor = parseNumber(d.dcFloorArea);
            return floor > 0;
        }

        function cleanLabel(name) {
            // Decode HTML entities (e.g. &amp; → &)
            name = name.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            // For address-style names (multiple commas), keep only city portion
            const parts = name.split(",");
            if (parts.length >= 3) name = parts[0] + "," + parts[1];
            return name.trim();
        }

        d3.csv(file24, parse24).then((data) => {
            const d24 = data.filter(d => d.year === 2024);
            const dc = d24.filter(isDataCenter);
            const of = d24.filter(d => d.propertyType == "Office");
            const ndc = of.filter(d => !isDataCenter(d));

            // Top 3 highest EUI DC buildings
            const topThreeDC = dc
                .sort((a, b) => b.eui - a.eui)
                .slice(0, 3);

            const avgNonDC = ndc.length > 0 ? d3.mean(ndc, d => d.eui) : 0;

            const margin = { top: 100, right: 60, bottom: 160, left: 120 };

            // Responsive sizing (prevents overflow / layout break)
            const host = document.getElementById("eui-chart");
            const hostW = host ? host.getBoundingClientRect().width : 1200;
            // Cap the chart width so titles/cards don't get pushed around on small screens
            const outerW = Math.max(860, Math.min(1200, hostW));
            const outerH = 720;

            const width = outerW - margin.left - margin.right;
            const height = outerH - margin.top - margin.bottom;

            const svgRoot = d3.select("#eui-chart")
                .append("svg")
                .attr("viewBox", `0 0 ${outerW} ${outerH}`)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .style("width", "100%")
                .style("height", "auto")
                .style("display", "block")
                .style("overflow", "visible");

            const svg = svgRoot
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Title
            const title = svg.append("text")
                .attr("x", width / 2)
                .attr("y", -50)
                .attr("text-anchor", "middle")
                .style("font-size", "26px")
                .style("font-weight", "700")
                .style("fill", COLOR_TEXT)
                .text("");

            const subtitle = svg.append("text")
                .attr("x", width / 2)
                .attr("y", -20)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("fill", COLOR_TEXT_DIM)
                .text("");

            // Prepare chart data
            const chartData = [
                { label: "Avg Office w/out Data Centers", eui: avgNonDC, dcGFA: null, color: COLOR_GRAY, shortLabel: "Average Non-Data Center Office" },
                ...topThreeDC.map((b, i) => ({
                    label: b.propertyName,
                    fullName: b.propertyName,
                    eui: b.eui,
                    dcGFA: parseNumber(b.dcFloorArea),
                    color: [COLOR_BLUE, COLOR_ORANGE, COLOR_PURPLE][i],
                    shortLabel: cleanLabel(b.propertyName)
                }))
            ];

            // Scales
            const barWidth = 140;
            const barSpacing = (width - barWidth * 4) / 5;
            const xPositions = chartData.map((d, i) => barSpacing + i * (barWidth + barSpacing));

            const maxEUI = d3.max(chartData, d => d.eui);
            const yScale = d3.scaleLinear()
                .domain([0, maxEUI * 1.15])
                .range([height, 0]);

            // Baseline
            svg.append("line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", height)
                .attr("y2", height)
                .attr("stroke", COLOR_AXIS)
                .attr("stroke-width", 2);

            // Y axis
            svg.append("g")
                .call(d3.axisLeft(yScale).ticks(8))
                .call(g => g.selectAll("path, line").attr("stroke", COLOR_AXIS))
                .call(g => g.selectAll("text").attr("fill", COLOR_TEXT_DIM).style("font-size", "12px"));

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -80)
                .attr("text-anchor", "middle")
                .style("font-size", "15px")
                .style("fill", COLOR_TEXT_DIM)
                .text("Site EUI (kBtu/ft²)");

            // Extra breathing room below the plot area (helps prevent overlap with cards below)
            svgRoot.style("margin-bottom", "28px");

            // Bars (start at 0 height)
            const bars = svg.selectAll(".bar")
                .data(chartData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", (d, i) => xPositions[i])
                .attr("y", height)
                .attr("width", barWidth)
                .attr("height", 0)
                .attr("fill", d => d.color)
                .attr("rx", 6);


            // Hover: lighten + subtle glow
            bars
                .style("cursor", "default")
                .on("mouseenter", function (event, d) {
                    d3.select(this)
                        .attr("fill", d3.color(d.color).brighter(0.7))
                        .attr("stroke", "rgba(255,255,255,0.25)")
                        .attr("stroke-width", 1);
                })
                .on("mouseleave", function (event, d) {
                    d3.select(this)
                        .attr("fill", d.color)
                        .attr("stroke", null)
                        .attr("stroke-width", null);
                });


            // X axis labels — rotated to prevent horizontal overlap
            const xLabels = svg.selectAll(".x-label")
                .data(chartData)
                .enter()
                .append("text")
                .attr("class", "x-label")
                .attr("x", (d, i) => xPositions[i] + barWidth / 2)
                .attr("y", height + 10)
                .attr("text-anchor", "end")
                .attr("transform", (d, i) => `rotate(-40, ${xPositions[i] + barWidth / 2}, ${height + 10})`)
                .style("font-size", "12px")
                .style("font-weight", "600")
                .style("fill", COLOR_TEXT)
                .text(d => d.shortLabel);

            // DC GFA labels — placed inside top of each bar to avoid bottom crowding
            const gfaLabels = svg.selectAll(".gfa-label")
                .data(chartData.filter(d => d.dcGFA !== null))
                .enter()
                .append("text")
                .attr("class", "gfa-label")
                .attr("x", (d, i) => xPositions[i + 1] + barWidth / 2)
                .attr("y", d => yScale(d.eui) + 20)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "hanging")
                .style("font-size", "10px")
                .style("font-weight", "600")
                .style("fill", "rgba(255,255,255,0.70)")
                .attr("opacity", 0)
                .text(d => `${d3.format(",")(d.dcGFA)} ft²`);

            // Multiplier indicators (show comparison to avg)
            const multiplierLabels = svg.selectAll(".multiplier-label")
                .data(chartData.filter(d => d.dcGFA !== null))
                .enter()
                .append("text")
                .attr("class", "multiplier-label")
                .attr("x", (d, i) => xPositions[i + 1] + barWidth / 2)
                .attr("y", (d, i) => yScale(d.eui) - 30)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .style("fill", d => d.color)
                .text(d => `${(d.eui / avgNonDC).toFixed(1)}x`)
                .attr("opacity", 0);

            // Scroll animation
            let currentProgress = 0;

            function updateVisualization(progress) {
                if (progress === currentProgress) return;
                currentProgress = progress;

                if (progress < 0.25) {
                    // Stage 1: Show average non-DC office
                    const t = progress / 0.25;
                    
                    bars.each(function(d, i) {
                        const bar = d3.select(this);
                        if (i === 0) {
                            bar.attr("y", yScale(d.eui * t))
                               .attr("height", height - yScale(d.eui * t));
                        } else {
                            bar.attr("y", height).attr("height", 0);
                        }
                    });

                    svg.selectAll(".eui-unit").attr("opacity", 0);
                    gfaLabels.attr("opacity", 0);
                    multiplierLabels.attr("opacity", 0);

                } else if (progress < 0.5) {
                    // Stage 2: Show DC #1
                    const t = (progress - 0.25) / 0.25;
                    
                    bars.each(function(d, i) {
                        const bar = d3.select(this);
                        if (i === 0) {
                            bar.attr("y", yScale(d.eui))
                               .attr("height", height - yScale(d.eui));
                        } else if (i === 1) {
                            bar.attr("y", yScale(d.eui * t))
                               .attr("height", height - yScale(d.eui * t));
                        } else {
                            bar.attr("y", height).attr("height", 0);
                        }
                    });


                    gfaLabels.each(function(d, i) {
                        d3.select(this).attr("opacity", i === 0 ? t : 0);
                    });

                    multiplierLabels.each(function(d, i) {
                        d3.select(this).attr("opacity", i === 0 ? t : 0);
                    });

                    svg.selectAll(".eui-unit").attr("opacity", t);

                } else if (progress < 0.75) {
                    // Stage 3: Show DC #2
                    const t = (progress - 0.5) / 0.25;
                    
                    bars.each(function(d, i) {
                        const bar = d3.select(this);
                        if (i <= 1) {
                            bar.attr("y", yScale(d.eui))
                               .attr("height", height - yScale(d.eui));
                        } else if (i === 2) {
                            bar.attr("y", yScale(d.eui * t))
                               .attr("height", height - yScale(d.eui * t));
                        } else {
                            bar.attr("y", height).attr("height", 0);
                        }
                    });

                    gfaLabels.each(function(d, i) {
                        d3.select(this).attr("opacity", i <= 1 ? 1 : 0);
                    });

                    multiplierLabels.each(function(d, i) {
                        d3.select(this).attr("opacity", i <= 1 ? 1 : 0);
                    });

                    svg.selectAll(".eui-unit").attr("opacity", 1);

                } else {
                    // Stage 4: Show DC #3
                    const t = (progress - 0.75) / 0.25;
                    
                    bars.each(function(d, i) {
                        const bar = d3.select(this);
                        if (i <= 2) {
                            bar.attr("y", yScale(d.eui))
                               .attr("height", height - yScale(d.eui));
                        } else {
                            bar.attr("y", yScale(d.eui * t))
                               .attr("height", height - yScale(d.eui * t));
                        }
                    });

                    gfaLabels.attr("opacity", 1);
                    multiplierLabels.attr("opacity", 1);
                    svg.selectAll(".eui-unit").attr("opacity", 1);
                }
            }

            // Scroll listener (progress based on the container's own position)
            function getContainerProgress(el) {
                const rect = el.getBoundingClientRect();
                const viewH = window.innerHeight || document.documentElement.clientHeight;

                // Start when the container top hits 70% of viewport, end when bottom hits 30%
                const start = viewH * 0.7;
                const end = viewH * 0.3;

                const total = (rect.height + (start - end));
                const current = (start - rect.top);
                return Math.min(Math.max(current / total, 0), 1);
            }

            function onScroll() {
                const scrollContainer = document.querySelector('#eui-scroll-container, #scroll-container');
                if (!scrollContainer) {
                    // No scrolly container on the page: just show the full chart
                    updateVisualization(1);
                    return;
                }
                const progress = getContainerProgress(scrollContainer);
                updateVisualization(progress);
            }

            // If scrolly exists, animate with scroll; otherwise show everything.
            const hasScrolly = !!document.querySelector('#eui-scroll-container, #scroll-container');
            if (hasScrolly) {
                window.addEventListener('scroll', onScroll, { passive: true });
                window.addEventListener('resize', onScroll);
                onScroll();
            } else {
                updateVisualization(1);
            }
        });
})();