// ==== Inner-chart constants ====
const margin = { top: 30, right: 30, bottom: 50, left: 70 };
const width  = 800;
const height = 420;
const innerWidth  = width  - margin.left - margin.right;
const innerHeight = height - margin.top  - margin.bottom;

// ==== Colours ====
const barColor = "#606464";
const bodyBackgroundColor = "#0f1217";

// ==== Scales (shared) ====
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

// ==== Bin generator (we’ll keep thresholds constant across filters) ====
const binGenerator = d3.bin()
  .value(d => d.energyConsumption)
  .thresholds(20);

// ==== Filter model ====
const filters_screen = [
  { id: "all",  label: "All",  isActive: true  },
  { id: "LED",  label: "LED",  isActive: false },
  { id: "LCD",  label: "LCD",  isActive: false },
  { id: "OLED", label: "OLED", isActive: false },
];
