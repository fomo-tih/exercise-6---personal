// Module-level references so we can update cleanly
let svg, inner, xAxisG, yAxisG;

function initHistogram(allData) {
  d3.select("#histogram").selectAll("*").remove();

  svg = d3.select("#histogram")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", "auto");

  inner = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  xAxisG = inner.append("g")
    .attr("transform", `translate(0, ${innerHeight})`);

  yAxisG = inner.append("g");

  // ----- FIXED X DOMAIN & BIN EDGES (based on ALL data) -----
  // Compute the overall min/max and thresholds from ALL data once.
  const allEC = allData.map(d => d.energyConsumption).filter(Number.isFinite);
  const minX = d3.min(allEC);
  const maxX = d3.max(allEC);

  // Fix x-scale domain across all filters so only bar heights change
  xScale.domain([minX, maxX]).range([0, innerWidth]);

  // Also fix the *bin edges* so bins align across filters
  const fixedBins = binGenerator.domain([minX, maxX])(allData);
  const fixedEdges = fixedBins.map(b => b.x0).concat(fixedBins.at(-1)?.x1 ?? maxX);
  // Rebuild bin generator with fixed thresholds to avoid re-bucketing jitter
  binGenerator.thresholds(fixedEdges);

  // Initial axes (y will be updated per filter)
  xAxisG.call(d3.axisBottom(xScale));
  yAxisG.call(d3.axisLeft(yScale).ticks(6));

  // Static axis labels
  svg.selectAll(".axis-label").remove();
  svg.append("text")
    .attr("x", margin.left + innerWidth)
    .attr("y", height - 12)
    .attr("text-anchor", "end")
    .attr("class", "axis-label")
    .text("Energy Consumption (kWh / year)");

  svg.append("text")
    .attr("transform", `translate(18, ${margin.top}) rotate(-90)`)
    .attr("text-anchor", "end")
    .attr("class", "axis-label")
    .text("Frequency");
}

// Debounce to avoid race conditions if user clicks fast
let _debounce;
function _debounceUpdate(fn) {
  clearTimeout(_debounce);
  _debounce = setTimeout(fn, 50);
}

function updateHistogram(filterId, data) {
  _debounceUpdate(() => {
    const id = (filterId || "all").toString().trim().toUpperCase();

    // Filtered dataset (we normalized screenTech in load-data.js)
    const filtered = (id === "ALL")
      ? data
      : data.filter(d => (d.screenTech || "").toUpperCase() === id);

    console.log(`[Update] ${id} → rows: ${filtered.length}`);

    // Compute bins with fixed thresholds (set in init)
    const bins = binGenerator(filtered);

    // Update y-scale to new max
    const maxCount = d3.max(bins, d => d.length) ?? 1;
    yScale.domain([0, maxCount]).range([innerHeight, 0]).nice();

    // Transition y-axis
    yAxisG.transition()
      .duration(350)
      .call(d3.axisLeft(yScale).ticks(6));

    // Data join with a stable key (bin start-end)
    const rect = inner.selectAll("rect")
      .data(bins, d => `${d.x0}-${d.x1}`);

    // EXIT — bars that disappear
    rect.exit()
      .transition().duration(350)
      .attr("y", yScale(0))
      .attr("height", 0)
      .remove();

    // ENTER — new bars
    rect.enter().append("rect")
        .attr("x", d => xScale(d.x0))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("y", yScale(0))
        .attr("height", 0)
        .attr("fill", barColor)
        .attr("stroke", bodyBackgroundColor)
        .attr("stroke-width", 2)
      // UPDATE + ENTER MERGE — animate to new heights
      .merge(rect)
      .transition().duration(550).ease(d3.easeCubicOut)
        .attr("x", d => xScale(d.x0))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("y", d => yScale(d.length))
        .attr("height", d => innerHeight - yScale(d.length));
  });
}
