

// nyc_top10.js
// Top 10 buildings by net increase in data center gross floor area (2023→2024)
// Renders into: <div id="nycTopBuildingsChart"></div>

(function () {
  const sel = '#nycTopBuildingsChart';
  const container = d3.select(sel);
  if (container.empty()) return;

  // Update this path if your data lives elsewhere
  const DATA_PATH = 'dataset/nyc_top10_dc_gfa_increase_2023_2024.csv';

  // Fallback sample (so the chart still renders even before the CSV is ready)
  const fallback = [
    { building: '1221 Avenue of the Americas', delta_sqft: 115000 },
    { building: '120 Broadway', delta_sqft: 52000 },
    { building: '111 8th Avenue', delta_sqft: 48000 },
    { building: 'One Penn Plaza', delta_sqft: 41000 },
    { building: '60 Hudson Street', delta_sqft: 36500 },
    { building: '55 Water Street', delta_sqft: 33000 },
    { building: '599 Lexington Avenue', delta_sqft: 28500 },
    { building: '32 Avenue of the Americas', delta_sqft: 26000 },
    { building: '335 Madison Avenue', delta_sqft: 23500 },
    { building: '1251 Avenue of the Americas', delta_sqft: 21000 }
  ];

  const palette = {
    base: 'rgba(86,189,248,0.72)',      // blue
    baseHover: 'rgba(86,189,248,0.46)',
    hi: 'rgba(246,201,74,0.92)',        // yellow highlight
    hiHover: 'rgba(246,201,74,0.62)',
    grid: 'rgba(255,255,255,0.10)',
    tick: 'rgba(207,214,223,0.85)',
    text: 'rgba(245,245,247,0.92)'
  };

  function parseMaybeNumber(v) {
    if (v == null) return NaN;
    const n = +String(v).replace(/,/g, '');
    return isNaN(n) ? NaN : n;
  }

  function normalizeRow(d) {
    // Accept a few possible column names
    const name = d.building || d.Building || d.address || d.Address || d.name || d.Name;
    const delta =
      parseMaybeNumber(d.delta_sqft) ||
      parseMaybeNumber(d.delta) ||
      parseMaybeNumber(d.net_increase_sqft) ||
      parseMaybeNumber(d.net_increase) ||
      parseMaybeNumber(d.increase_sqft) ||
      parseMaybeNumber(d.Increase) ||
      parseMaybeNumber(d['Net increase (sq ft)']);

    return {
      building: name,
      delta_sqft: delta
    };
  }

  function render(raw) {
    container.selectAll('*').remove();

    const data = raw
      .map(normalizeRow)
      .filter((d) => d.building && isFinite(d.delta_sqft))
      .sort((a, b) => d3.descending(a.delta_sqft, b.delta_sqft))
      .slice(0, 10);

    const w = Math.max(520, container.node().clientWidth || 900);
    const h = 420;
    const margin = { top: 26, right: 36, bottom: 40, left: 240 };

    const svg = container
      .append('svg')
      .attr('width', w)
      .attr('height', h);

    svg
      .append('text')
      .attr('x', margin.left)
      .attr('y', 18)
      .attr('fill', palette.text)
      .attr('font-size', 14)
      .attr('font-weight', 600)
      .text('Top 10 Buildings — Net Increase in Data Center Floor Area (2023→2024)');

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.delta_sqft) * 1.12])
      .range([margin.left, w - margin.right]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.building))
      .range([margin.top + 18, h - margin.bottom])
      .padding(0.28);

    // Gridlines
    const xAxis = d3.axisBottom(x).ticks(5).tickFormat((d) => d3.format('~s')(d));

    svg
      .append('g')
      .attr('transform', `translate(0,${h - margin.bottom})`)
      .call(xAxis)
      .call((g) => g.selectAll('text').attr('fill', palette.tick))
      .call((g) => g.selectAll('path').attr('stroke', palette.grid))
      .call((g) => g.selectAll('line').attr('stroke', palette.grid));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call((g) => g.selectAll('text').attr('fill', palette.tick).attr('font-size', 11))
      .call((g) => g.select('.domain').remove());

    // Tooltip (simple)
    const tip = container
      .append('div')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('background', 'rgba(0,0,0,0.75)')
      .style('border', '1px solid rgba(255,255,255,0.12)')
      .style('border-radius', '10px')
      .style('padding', '10px 12px')
      .style('color', 'rgba(245,245,247,0.92)')
      .style('font-size', '12px')
      .style('backdrop-filter', 'blur(6px)');

    function isHighlight(d) {
      return String(d.building).toLowerCase().includes('1221') &&
        String(d.building).toLowerCase().includes('americas');
    }

    const bars = svg
      .append('g')
      .selectAll('rect')
      .data(data, (d) => d.building)
      .enter()
      .append('rect')
      .attr('x', x(0))
      .attr('y', (d) => y(d.building))
      .attr('height', y.bandwidth())
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('width', 0)
      .attr('fill', (d) => (isHighlight(d) ? palette.hi : palette.base))
      .attr('stroke', 'rgba(245,245,247,0.12)')
      .attr('stroke-width', 1)
      .on('mousemove', (event, d) => {
        const [mx, my] = d3.pointer(event, container.node());
        tip
          .style('opacity', 1)
          .style('left', `${mx + 14}px`)
          .style('top', `${my + 14}px`)
          .html(
            `<div style="font-weight:700; margin-bottom:6px;">${d.building}</div>` +
            `<div><span style="opacity:.75;">Net increase:</span> <b>${d3.format(',')(Math.round(d.delta_sqft))}</b> sq ft</div>`
          );
      })
      .on('mouseleave', () => tip.style('opacity', 0));

    bars
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('width', (d) => x(d.delta_sqft) - x(0));

    // Value labels at bar ends
    svg
      .append('g')
      .selectAll('text.value')
      .data(data, (d) => d.building)
      .enter()
      .append('text')
      .attr('class', 'value')
      .attr('x', (d) => x(d.delta_sqft) + 8)
      .attr('y', (d) => y(d.building) + y.bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'rgba(245,245,247,0.72)')
      .attr('font-size', 11)
      .text((d) => `+${d3.format(',')(Math.round(d.delta_sqft))} sq ft`);

    // Small callout for 1221
    const hi = data.find(isHighlight);
    if (hi) {
      svg
        .append('text')
        .attr('x', margin.left)
        .attr('y', h - 10)
        .attr('fill', 'rgba(245,245,247,0.70)')
        .attr('font-size', 11)
        .text('Highlight: 1221 Avenue of the Americas — quintupled in one year (see narrative).');
    }

    // Ensure tooltip positioning is relative to container
    container.style('position', 'relative');
  }

  // Try to load CSV; if it fails, render fallback
  d3.csv(DATA_PATH)
    .then((rows) => {
      if (!rows || rows.length === 0) throw new Error('Empty CSV');
      render(rows);
    })
    .catch(() => {
      render(fallback);
    });

  // Re-render on resize (debounced)
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      // Re-run by re-rendering fallback or last known data.
      // We simply attempt CSV again; browser cache makes it cheap.
      d3.csv(DATA_PATH)
        .then((rows) => {
          if (!rows || rows.length === 0) throw new Error('Empty CSV');
          render(rows);
        })
        .catch(() => render(fallback));
    }, 200);
  });
})();