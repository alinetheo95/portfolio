// Wrap the entire file in an IIFE to avoid global variable conflicts
(function () {
  "use strict";
  // Shared dark-tech palette (keep in sync with style.css)
  const COLOR_BG = "#05060a";
  const COLOR_TEXT = "#f5f5f7";
  const COLOR_TEXT_DIM = "#9aa4b2";
  const COLOR_GRID = "rgba(245,245,247,0.10)";

  // Accents (multi-color, dark background)
  // Energy = cyan, GHG = lime (matches the rest of the site palette)
  const COLOR_ENERGY = "#25baed"; // cyan
  const COLOR_GHG = "#77c049";    // lime

  // Optional extra accents (not all used here, kept for consistency)
  const COLOR_PURPLE = "#9c459a";
  const COLOR_ORANGE = "#f15f31";
  const COLOR_YELLOW = "#f6c94a";

  // Glows tuned per-series
  const COLOR_ENERGY_GLOW = "rgba(37,186,237,0.60)";
  const COLOR_GHG_GLOW = "rgba(119,192,73,0.55)";
const file20 = "dataset/slim/slim_energy_nyc_20.csv";
const file21 = "dataset/slim/slim_energy_nyc_21.csv";
const file22 = "dataset/slim/slim_energy_nyc_22_23_24.csv";


function parse22(d) {
    return {
        year: +d["Calendar Year"],
        energy: +d["Site Energy Use (kBtu)"],
        dcenergy: (+d["Data Center - IT Source Energy (kBtu)"] || 0), 
        ghg: +d["Total (Location-Based) GHG Emissions (Metric Tons CO2e)"],
        dcFloorArea: d["Data Center - Gross Floor Area (ft²)"],
        propertyName: d["Property Name"] || "Unknown"  
    };
}

function parse21(d) {
    return {
        year: 2021,
        energy: +d["Site Energy Use (kBtu)"],
        dcenergy: (+d["Data Center - IT Source Energy (kBtu)"] || 0), 
        ghg: +d["Total GHG Emissions (Metric Tons CO2e)"],
        dcFloorArea: d["Data Center - Gross Floor Area (ft²)"],
        propertyName: d["Property Name"] || "Unknown"  
    };
}

function parse20(d) {
    return {
        year: 2020,
        energy: +d["Site Energy Use (kBtu)"],
        dcenergy: (+d["Data Center - IT Source Energy (kBtu)"] || 0), 
        ghg: +d["Total GHG Emissions (Metric Tons CO2e)"],
        dcFloorArea: d["Data Center - Gross Floor Area (ft²)"],
        propertyName: d["Property Name"] || "Unknown" 
    };
}

// Ensure d3 is loaded before running
if (typeof d3 === "undefined") {
  console.error("[linechart] D3 not found. Make sure d3.v7 is loaded before linechart.js");
  return;
}

Promise.all([
    d3.csv(file20, parse20),
    d3.csv(file21, parse21),
    d3.csv(file22, parse22),
]).then(([d20, d21, d22]) => {

    const data = [...d20, ...d21, ...d22].sort((a, b) => a.year - b.year);

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

    const dcOnly = data.filter(isDataCenter);

    function aggregateByYear(data) {
        const yearlyTotals = {};
        data.forEach(d => {
            const { year, energy, dcenergy, ghg } = d;
            if (year == null) return;
            if (!yearlyTotals[year]) yearlyTotals[year] = { energy: 0, dcenergy: 0, ghg: 0, count: 0 };
            yearlyTotals[year].energy += isNaN(energy) ? 0 : energy;
            yearlyTotals[year].dcenergy += isNaN(dcenergy) ? 0 : dcenergy;
            yearlyTotals[year].ghg += isNaN(ghg) ? 0 : ghg;
            yearlyTotals[year].count++;
        });
        return yearlyTotals;
    }

    const aggregated = aggregateByYear(dcOnly);

    console.log("=== AGGREGATED DATA CENTER YEARLY SUMMARY ===");
    console.log("Parsed data:", data.length);
    console.log("Filtered rows:", dcOnly.length);
    console.log("Aggregated by year:");
    Object.entries(aggregated).forEach(([year, vals]) => {
        console.log(year,
            "Total Energy:", vals.energy,
            "DC IT Energy:", vals.dcenergy,
            "GHG:", vals.ghg,
            "Count:", vals.count);
    });

    // Group data centers by property name and year
    const dcByProperty = {};
    dcOnly.forEach(d => {
        const key = d.propertyName || "Unknown";
        if (!dcByProperty[key]) {
            dcByProperty[key] = {};
        }
        dcByProperty[key][d.year] = {
            dcFloorArea: parseNumber(d.dcFloorArea),
            energy: d.energy,
            ghg: d.ghg
        };
    });

    const has2024 = data.some(d => d.year === 2024);
    if (has2024) {
      // Find properties that were data centers in 2023 but not in 2024
      const lost2024 = [];
      Object.entries(dcByProperty).forEach(([propName, years]) => {
          if (years[2023] && !years[2024]) {
              lost2024.push({
                  property: propName,
                  gfa2023: years[2023].dcFloorArea
              });
          }
      });

      console.log("\n=== DATA CENTERS IN 2023 BUT NOT IN 2024 ===");
      console.log(`Total properties lost: ${lost2024.length}`);
      lost2024.sort((a, b) => b.gfa2023 - a.gfa2023).forEach((item, idx) => {
          console.log(`${idx + 1}. ${item.property} - GFA: ${item.gfa2023.toLocaleString()} ft²`);
      });

      // Get all 2024 data (not just data centers)
      const all2024 = data.filter(d => d.year === 2024);

      // Summary statistics
      const withData = lost2024.filter(item => {
          const prop2024 = all2024.find(d => (d.propertyName || "Unknown") === item.property);
          return prop2024 && parseNumber(prop2024.dcFloorArea) > 0;
      });
    }

    // Define the years
    const years = [2020, 2021, 2022, 2023];

    // Convert aggregated object to array with both metrics
    const aggregatedArray = years.map(y => {
        const vals = aggregated[y] || { energy: 0, dcenergy: 0, ghg: 0, count: 0 };
        return {
            year: y,
            energy: vals.energy,
            dcenergy: vals.dcenergy,
            ghg: vals.ghg,
            count: vals.count
        };
    });

    console.log("Combined Chart Data:", aggregatedArray);

    // Dimensions
    const margin = { top: 60, right: 80, bottom: 80, left: 100 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // SVG container (use a dedicated mount to avoid collisions with ozone)
    const mount = !d3.select("#nyc-linechart").empty()
      ? d3.select("#nyc-linechart")
      : (!d3.select("#dc-linechart").empty()
          ? d3.select("#dc-linechart")
          : d3.select("#energychart"));

    if (mount.empty()) {
      console.warn("[linechart] No mount element found (#nyc-linechart / #dc-linechart / #energychart). Skipping render.");
      return;
    }

    // Clear any previous render
    mount.selectAll("*").remove();

    const svg = mount
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale (years)
    const x = d3.scaleLinear()
        .domain([2019.5, 2023.5])
        .range([0, width]);

    // Y scales - use energy scale for both energy metrics
    const yEnergy = d3.scaleLinear()
        .domain([0, d3.max(aggregatedArray, d => Math.max(d.energy, d.dcenergy)) * 1.1])
        .range([height, 0])
        .nice();

    const yGHG = d3.scaleLinear()
        .domain([0, d3.max(aggregatedArray, d => d.ghg) * 1.1])
        .range([height, 0])
        .nice();

    // Gridlines for Y (using left axis)
    svg.append("g")
        .attr("class", "grid")
        .attr("opacity", 1)
        .call(d3.axisLeft(yEnergy)
            .tickSize(-width)
            .tickFormat("")
        );
    svg.selectAll(".grid line")
      .attr("stroke", COLOR_GRID)
      .attr("shape-rendering", "crispEdges");
    svg.selectAll(".grid path").attr("stroke", "none");

    // X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickValues(years)
            .tickFormat(d3.format("d")))
        .selectAll("text")
        .style("font-size", "14px")
        .style("fill", COLOR_TEXT_DIM);

    // Left Y-axis (Energy)
    svg.append("g")
        .call(d3.axisLeft(yEnergy)
            .tickFormat(d => d3.format(".2s")(d)))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", COLOR_TEXT_DIM);
    svg.selectAll(".domain").attr("stroke", "rgba(245,245,247,0.35)");
    svg.selectAll(".tick line").attr("stroke", "rgba(245,245,247,0.18)");

    // Right Y-axis (GHG)
    svg.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(yGHG)
            .tickFormat(d => d3.format(".2s")(d)))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", COLOR_TEXT_DIM);

    // Line generators
    const lineEnergy = d3.line()
        .x(d => x(d.year))
        .y(d => yEnergy(d.energy))
        .curve(d3.curveMonotoneX);

    const lineGHG = d3.line()
        .x(d => x(d.year))
        .y(d => yGHG(d.ghg))
        .curve(d3.curveMonotoneX);

    // Draw Total Energy line (darker cyan)
    svg.append("path")
        .datum(aggregatedArray)
        .attr("fill", "none")
        .attr("stroke", COLOR_ENERGY)
        .attr("stroke-width", 3)
        .attr("d", lineEnergy);

    // Draw GHG line
    svg.append("path")
        .datum(aggregatedArray)
        .attr("fill", "none")
        .attr("stroke", COLOR_GHG)
        .attr("stroke-width", 3)
        .attr("d", lineGHG);

    // Draw points for Total Energy
    svg.selectAll("circle.energy")
        .data(aggregatedArray)
        .enter()
        .append("circle")
        .attr("class", "energy")
        .attr("cx", d => x(d.year))
        .attr("cy", d => yEnergy(d.energy))
        .attr("r", 6)
        .attr("fill", COLOR_ENERGY)
        .attr("stroke", COLOR_BG)
        .attr("stroke-width", 2);

    // Draw points for GHG
    svg.selectAll("circle.ghg")
        .data(aggregatedArray)
        .enter()
        .append("circle")
        .attr("class", "ghg")
        .attr("cx", d => x(d.year))
        .attr("cy", d => yGHG(d.ghg))
        .attr("r", 6)
        .attr("fill", COLOR_GHG)
        .attr("stroke", COLOR_BG)
        .attr("stroke-width", 2);

    // Value labels for Total Energy
    svg.selectAll(".value-label-energy")
        .data(aggregatedArray)
        .enter()
        .append("text")
        .attr("class", "value-label-energy")
        .attr("x", d => x(d.year))
        .attr("y", d => yEnergy(d.energy) - 15)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", COLOR_ENERGY)
        .style("font-weight", "bold")
        .text(d => d3.format(".2s")(d.energy));

    // Value labels for GHG
    svg.selectAll(".value-label-ghg")
        .data(aggregatedArray)
        .enter()
        .append("text")
        .attr("class", "value-label-ghg")
        .attr("x", d => x(d.year))
        .attr("y", d => yGHG(d.ghg) - 15)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", COLOR_GHG)
        .style("font-weight", "bold")
        .text(d => d3.format(".2s")(d.ghg));

    // Count labels below points
    svg.selectAll(".count-label")
        .data(aggregatedArray)
        .enter()
        .append("text")
        .attr("class", "count-label")
        .attr("x", d => x(d.year))
        .attr("y", height + 42)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", COLOR_TEXT_DIM)
        .text(d => `(${d.count} facilities)`);

    // Chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("fill", COLOR_TEXT)
        .text("NYC Data Center Energy & GHG Emissions (2020–2023)");

    // X axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", COLOR_TEXT_DIM)
        .text("Year");

    // Left Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -70)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", COLOR_ENERGY)
        .text("Total Energy Use (kBtu)");

    // Right Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", width + 60)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", COLOR_GHG)
        .text("Total GHG Emissions (Metric Tons CO₂e)");

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 200}, -10)`);

    // Total Site Energy
    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("fill", COLOR_ENERGY);

    legend.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .text("Total Site Energy (kBtu)")
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle")
        .style("fill", COLOR_TEXT_DIM);

    // GHG
    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 20)
        .attr("r", 6)
        .attr("fill", COLOR_GHG);

    legend.append("text")
        .attr("x", 12)
        .attr("y", 24)
        .text("GHG (Metric Tons CO₂e)")
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle")
        .style("fill", COLOR_TEXT_DIM);

    // First, hide all value labels by default
    svg.selectAll(".value-label-energy").style("opacity", 0);
    svg.selectAll(".value-label-ghg").style("opacity", 0);

    // Legend hover logic (text and circle)
    function showLabels(kind) {
        svg.selectAll(".value-label-energy").transition().duration(200).style("opacity", kind === "energy" ? 1 : 0);
        svg.selectAll(".value-label-ghg").transition().duration(200).style("opacity", kind === "ghg" ? 1 : 0);
    }

    // Attach listeners to the label text elements (reliable text content)
    legend.selectAll("text")
        .style("cursor", "pointer")
        .on("mouseover", function () {
            const t = d3.select(this).text();
            if (t.includes("Total Site Energy")) showLabels("energy");
            if (t.includes("GHG")) showLabels("ghg");
        })
        .on("mouseout", function () {
            showLabels(null);
        });

    // Attach listeners to the circles by position (cy)
    legend.selectAll("circle")
        .style("cursor", "pointer")
        .on("mouseover", function () {
            const cy = +d3.select(this).attr("cy");
            if (cy === 0) showLabels("energy");
            if (cy === 20) showLabels("ghg");
        })
        .on("mouseout", function () {
            showLabels(null);
        });

    // Subtle glow for dark background readability
    svg.selectAll("path")
      .filter(function () {
        const s = d3.select(this).attr("stroke");
        return s === COLOR_ENERGY || s === COLOR_GHG;
      })
      .attr("filter", null);

    // Create glow via duplicated paths (keeps it simple and consistent across browsers)
    const glowGroup = svg.insert("g", ":first-child");
    glowGroup.append("path")
      .datum(aggregatedArray)
      .attr("fill", "none")
      .attr("stroke", COLOR_ENERGY_GLOW)
      .attr("stroke-width", 10)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("opacity", 0.20)
      .attr("d", lineEnergy);

    glowGroup.append("path")
      .datum(aggregatedArray)
      .attr("fill", "none")
      .attr("stroke", COLOR_GHG_GLOW)
      .attr("stroke-width", 10)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("opacity", 0.14)
      .attr("d", lineGHG);
});
// End IIFE
})();