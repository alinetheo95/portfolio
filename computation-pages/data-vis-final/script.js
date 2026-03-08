// script.js — global interactions for the site
// This file intentionally keeps logic small & defensive so it runs
// even if certain elements are not present on the page yet.

(function(){
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init(){
    setupTimelineReveal();
    setupYearSliderSync();
    setupStepHoverSync();
  }

  // ---- 1) Timeline reveal on scroll (Montreal Protocol timeline) ----
  function setupTimelineReveal(){
    const items = document.querySelectorAll('.timeline-item');
    if (!items.length || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    items.forEach(el=>io.observe(el));
  }

  // ---- 2) Year slider ↔ label sync (Ozone Time Map) ----
  function setupYearSliderSync(){
    const slider = document.getElementById('yearSlider');
    const label  = document.getElementById('yearLabel');
    if(!slider || !label) return;

    // Initialize
    label.textContent = slider.value;

    slider.addEventListener('input', ()=>{
      label.textContent = slider.value;
      // If you later bind data layers by year, trigger a custom event here
      const ev = new CustomEvent('year:change', { detail: { year: +slider.value }});
      window.dispatchEvent(ev);
    });
  }

  // ---- 3) Step hover/enter → sync slider (scrollytelling cues) ----
  function setupStepHoverSync(){
    const steps = document.querySelectorAll('#ozone-map-section .step');
    const slider = document.getElementById('yearSlider');
    const label  = document.getElementById('yearLabel');
    if(!steps.length || !slider || !label) return;

    steps.forEach(step => {
      // Hover or focus
      step.addEventListener('mouseenter', ()=> sync(step));
      step.addEventListener('focus', ()=> sync(step));
      // Click/tap also supported
      step.addEventListener('click', ()=> sync(step));
    });

    function sync(step){
      const y = step.getAttribute('data-year');
      if(!y) return;
      slider.value = y;
      label.textContent = y;
      const ev = new CustomEvent('year:change', { detail: { year: +y }});
      window.dispatchEvent(ev);
    }
  }
})();

// --- Statista-style bar chart: data center electricity appetite (2022) ---
(function initDcEnergyCompareChart() {
  function render() {
    const el = document.getElementById("dcEnergyCompareChart");
    if (!el || typeof Chart === "undefined") return;

    // Destroy any existing Chart.js instance on this canvas (including inline-created ones)
    const existing = Chart.getChart(el);
    if (existing) existing.destroy();
    el.__chartInstance = null;

    // Values approximated from the reference graphic (TWh)
    const labels = [
      "CN",
      "US",
      "IN",
      "JP",
      "Data centers worldwide (2026 median est.)",
      "CA",
      "DE",
      "FR",
      "Data centers worldwide (2022 median est.)",
      "GB"
    ];

    const values = [8540, 4128, 1463, 939, 835, 553, 507, 426, 415, 287];

    // Project palette accents
    const COL_PURPLE = "rgba(156,69,154,0.90)";
    const COL_BLUE   = "rgba(86,189,248,0.85)";
    const COL_BLUE2  = "rgba(37,186,237,0.85)";
    const COL_GREEN  = "rgba(119,192,73,0.85)";
    const COL_YELLOW = "rgba(246,201,74,0.88)";
    const COL_ORANGE = "rgba(241,95,49,0.85)";

    // Base: purple for countries, green for the two “data centers” bars
    const bg = labels.map((d) => d.startsWith("Data centers worldwide") ? COL_GREEN : COL_PURPLE);
    const border = labels.map((d) => d.startsWith("Data centers worldwide") ? "rgba(119,192,73,1)" : "rgba(156,69,154,1)");

    // Add richer palette variety (matches your “dark mode” accents)
    bg[1] = COL_BLUE;   border[1] = "rgba(86,189,248,1)";   // US
    bg[2] = COL_ORANGE; border[2] = "rgba(241,95,49,1)";    // IN
    bg[3] = COL_YELLOW; border[3] = "rgba(246,201,74,1)";   // JP
    bg[5] = COL_BLUE2;  border[5] = "rgba(37,186,237,1)";   // CA
    bg[6] = "rgba(77,192,172,0.85)"; border[6] = "rgba(77,192,172,1)"; // DE teal
    bg[7] = "rgba(244,114,182,0.80)"; border[7] = "rgba(244,114,182,1)"; // FR pink
    bg[9] = "rgba(167,139,250,0.85)"; border[9] = "rgba(167,139,250,1)"; // GB lavender

    // Hover: make it lighter (your request)
    const hoverBg = bg.map((c) => c.replace(/0\.\d+\)$/, "0.55)"));

    const chart = new Chart(el, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Electricity consumption (TWh)",
          data: values,
          backgroundColor: bg,
          borderColor: border,
          hoverBackgroundColor: hoverBg,
          hoverBorderColor: "rgba(245,245,247,0.85)",
          borderWidth: 1.5,
          borderRadius: 6,
          barThickness: 18
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed.y ?? ctx.parsed;
                return ` ${v.toLocaleString()} TWh`;
              }
            },
            backgroundColor: "rgba(10,12,16,0.92)",
            borderColor: "rgba(255,255,255,0.10)",
            borderWidth: 1,
            titleColor: "rgba(245,245,247,0.95)",
            bodyColor: "rgba(207,214,223,0.95)",
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.06)", drawBorder: false },
            ticks: {
              color: "rgba(207,214,223,0.88)",
              autoSkip: false,
              callback: function (val) {
                const label = this.getLabelForValue(val);
                // shorten long axis labels
                if (label.startsWith("Data centers worldwide")) return "Data centers";
                return label;
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.10)", drawBorder: false },
            ticks: {
              color: "rgba(207,214,223,0.88)",
              callback: (value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
            }
          }
        }
      }
    });

    el.__chartInstance = chart;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();