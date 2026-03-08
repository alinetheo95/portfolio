// nyc_diverging.js
// Slope chart: More Floor Area, Fewer Reporting Buildings (2023 → 2024)
const fmtInt = d3.format(',');
const fmtArea = d3.format(',.0f');

(function () {
  const container = d3.select('#nycDivergingBars');
  if (container.empty()) return;

  const data = [
    {
      label: 'Reporting buildings',
      y2023: 382,
      y2024: 272,
      unit: 'buildings'
    },
    {
      label: 'Total data center floor area',
      y2023: 0,
      y2024: 220057.8,
      unit: 'sq ft'
    }
  ];

  const width = container.node().clientWidth;
  const height = 260;
  const margin = { top: 40, right: 120, bottom: 40, left: 120 };

  const svg = container
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const x = d3
    .scalePoint()
    .domain(['2023', '2024'])
    .range([margin.left, width - margin.right]);

  const yBuildings = d3
    .scaleLinear()
    .domain([250, 400])
    .range([height - margin.bottom, margin.top]);

  const yArea = d3
    .scaleLinear()
    .domain([0, 240000])
    .range([height - margin.bottom, margin.top]);

  const colors = {
    down: '#77c049',   // lime
    up: '#25baed'      // blue
  };

  data.forEach((d, i) => {
    const yScale = d.unit === 'buildings' ? yBuildings : yArea;
    const color = d.y2024 < d.y2023 ? colors.down : colors.up;

    svg
      .append('line')
      .attr('x1', x('2023'))
      .attr('x2', x('2024'))
      .attr('y1', yScale(d.y2023))
      .attr('y2', yScale(d.y2024))
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('opacity', 0.9);

    svg
      .selectAll(`.dot-${i}`)
      .data([
        { year: '2023', value: d.y2023 },
        { year: '2024', value: d.y2024 }
      ])
      .enter()
      .append('circle')
      .attr('cx', (p) => x(p.year))
      .attr('cy', (p) => yScale(p.value))
      .attr('r', 5)
      .attr('fill', color);

    // labels
    svg
      .append('text')
      .attr('x', x('2023') - 10)
      .attr('y', yScale(d.y2023))
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#cfcfcf')
      .attr('font-size', 12)
      .text(d.y2023 + ' ' + d.unit);

    svg
      .append('text')
      .attr('x', x('2024') + 10)
      .attr('y', yScale(d.y2024))
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#cfcfcf')
      .attr('font-size', 12)
      .text(
        d.unit === 'sq ft'
          ? '+220,058 sq ft'
          : d.y2024 + ' ' + d.unit
      );
  });

  // year labels
  svg
    .append('text')
    .attr('x', x('2023'))
    .attr('y', height - 10)
    .attr('text-anchor', 'middle')
    .attr('fill', '#999')
    .attr('font-size', 12)
    .text('2023');

  svg
    .append('text')
    .attr('x', x('2024'))
    .attr('y', height - 10)
    .attr('text-anchor', 'middle')
    .attr('fill', '#999')
    .attr('font-size', 12)
    .text('2024');

  // Legend (replaces the center labels to avoid overlap)
  const legend = [
    { label: 'Reporting buildings', color: colors.down },
    { label: 'Total data center floor area', color: colors.up }
  ];

  const legendG = svg
    .append('g')
    .attr('class', 'nyc-diverging-legend')
    .attr('transform', `translate(${margin.left}, ${height - margin.bottom + 18})`);

  const item = legendG
    .selectAll('g')
    .data(legend)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(${i * 240}, 0)`);

  item
    .append('rect')
    .attr('x', 0)
    .attr('y', -10)
    .attr('width', 22)
    .attr('height', 4)
    .attr('rx', 2)
    .attr('fill', (d) => d.color)
    .attr('opacity', 0.95);

  item
    .append('text')
    .attr('x', 30)
    .attr('y', -8)
    .attr('fill', '#cfcfcf')
    .attr('font-size', 12)
    .text((d) => d.label);
})();