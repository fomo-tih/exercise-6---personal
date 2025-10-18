// shared-constants-6_2.js
if (typeof d3 === "undefined") {
  console.error("[6.2] d3 is not loaded before shared-constants-6_2.js");
}

// Layout
const margin = { top: 40, right: 40, bottom: 60, left: 70 };
const width  = 600;
const height = 300; // fits nicely in your .chart-box

const innerWidth  = width  - margin.left - margin.right;
const innerHeight = height - margin.top  - margin.bottom;

// Tooltip styling
const tooltipWidth  = 120;
const tooltipHeight = 40;
const barColor      = "#FBE79C";

// Will be assigned in drawScatterplot()
let innerChartS;

// Scales
const xScaleS    = d3.scaleLinear().range([0, innerWidth]);
const yScaleS    = d3.scaleLinear().range([innerHeight, 0]);
const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

// Optional: allow quick debugging
window.__ex62 = { margin, width, height, innerWidth, innerHeight, xScaleS, yScaleS, colorScale };
