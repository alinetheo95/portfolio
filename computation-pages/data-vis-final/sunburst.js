// Sunburst Visualization for U.S. Greenhouse Gas Emissions
// Data from EPA 2024 Inventory

const width = 900;
const height = 900;
const radius = Math.min(width, height) / 2;

// SVG
const svg = d3.select("#sunburst")
  .append("svg")
  .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
  .style("max-width", "100%")
  .style("height", "auto")
  .style("font", "12px sans-serif");

// Tooltip
const tooltip = d3.select("#sunburst-tooltip")
  .style("position", "absolute")
  .style("padding", "12px")
  .style("background", "rgba(255,255,255,0.95)")
  .style("border", "1px solid #ddd")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("opacity", 0);

// Load data
d3.json("ghg_emissions_sunburst_complete.json").then(data => {

  // --- FILTER NEGATIVE VALUES ---
  function filterPositive(node) {
    if (node.children) {
      node.children = node.children
        .filter(d => !d.value || d.value > 0)
        .map(filterPositive);
    }
    return node;
  }

  const filteredData = filterPositive(structuredClone(data));

  // --- HIERARCHY ---
  const root = d3.hierarchy(filteredData)
    .sum(d => d.value > 0 ? d.value : 0)
    .sort((a, b) => b.value - a.value);

  d3.partition()
    .size([2 * Math.PI, radius])(root);

  root.each(d => d.current = d);

  let focus = root;

  // --- COLOR ASSIGNMENT ---
  root.each(d => {
    if (d.data.color) {
      d.color = d.data.color;
    } else if (d.parent) {
      d.color = d3.color(d.parent.color)
        .brighter(0.25)
        .formatHex();
    } else {
      d.color = "#ccc";
    }
  });

  // --- ARC GENERATOR ---
  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(0.005)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1 - 1);

  // --- BACKGROUND (RESET TARGET) ---
  svg.append("circle")
    .attr("r", radius)
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .lower()
    .on("click", event => {
      event.stopPropagation();
      zoom(event, root);
    });

  // --- ARCS ---
  const path = svg.append("g")
    .selectAll("path")
    .data(root.descendants().filter(d => d.depth))
    .join("path")
    .attr("fill", d => d.color)
    .attr("d", d => arc(d.current))
    .style("stroke", "#fff")
    .style("stroke-width", "1px")
    .style("cursor", "pointer")
    .on("click", function (event, d) {
      event.stopPropagation();
      zoom(event, d);
    })
    .on("mouseover", function (event, d) {
      d3.select(this)
        .style("stroke", "#333")
        .style("stroke-width", "3px");

      const ancestors = d.ancestors().reverse().slice(1);
      const breadcrumb = ancestors.map(a => a.data.name).join(" → ");
      const pct = ((d.value / root.value) * 100).toFixed(1);

      tooltip
        .style("opacity", 1)
        .html(`
          <strong>${breadcrumb}</strong><br/>
          <span style="color:${d.color}; font-weight:bold">${d.data.name}</span><br/>
          ${d.value.toLocaleString()} MMT CO₂e<br/>
          ${pct}% of total
        `)
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 15 + "px");
    })
    .on("mousemove", event => {
      tooltip
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 15 + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .style("stroke", "#fff")
        .style("stroke-width", "2px");

      tooltip.style("opacity", 0);
    });

  // --- CENTER LABEL ---
  const center = svg.append("g")
    .attr("text-anchor", "middle")
    .attr("pointer-events", "none");

  const centerName = center.append("text")
    .attr("y", -10)
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("fill", "#cfcfcf") 
    .text(root.data.name);

  const centerValue = center.append("text")
    .attr("y", 22)
    .style("font-size", "28px")
    .style("font-weight", "bold")
    .style("fill", "#2E7D32")
    .text(`${root.value.toLocaleString()} MMT`);

  center.append("text")
    .attr("y", 45)
    .style("font-size", "16px")
    .style("fill", "#666")
    .text("CO₂e");

  // --- ZOOM FUNCTION ---
  function zoom(event, p) {
    focus = p;

    root.each(d => {
      d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      };
    });

    const t = svg.transition().duration(750);

    path.transition(t)
      .tween("data", d => {
        const i = d3.interpolate(d.current, d.target);
        return t => d.current = i(t);
      })
      .attrTween("d", d => () => arc(d.current));

    centerName.text(p.data.name);
    centerValue.text(`${p.value.toLocaleString()} MMT`);
  }

}).catch(err => {
  console.error(err);
});

// Add credits section
const credits = d3.select("#sunburst-container")
  .append("div")
  .attr("id", "credits")
  .style("margin-top", "30px")
  .style("padding-top", "20px")
  .style("border-top", "1px solid #444")
  .style("text-align", "center")
  .style("font-size", "11px")
  .style("color", "#999");

credits.append("p")
  .html("<strong>Data Source:</strong> U.S. EPA (2024). <em>Inventory of U.S. Greenhouse Gas Emissions and Sinks: 1990-2022</em>. EPA 430-R-24-004.");