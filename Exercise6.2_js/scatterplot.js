// scatterplot.js
const drawScatterplot = (data = []) => {
  // Create SVG with explicit size (prevents 0×0 inside flex containers)
  const svg = d3.select("#scatterplot-container")
    .append("svg")
    .attr("width",  width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  innerChartS = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Compute safe domains (filter NaN and avoid flat scales)
  const xs = data.map(d => d.star).filter(Number.isFinite);
  const ys = data.map(d => d.screenSize).filter(Number.isFinite);

  let xDomain = xs.length ? d3.extent(xs) : [0, 10];
  let yDomain = ys.length ? d3.extent(ys) : [0, 200];

  if (xDomain[0] === xDomain[1]) {
    const pad = xDomain[0] === 0 ? 1 : Math.abs(xDomain[0]) * 0.1;
    xDomain = [xDomain[0] - pad, xDomain[1] + pad];
  }
  if (yDomain[0] === yDomain[1]) {
    const pad = yDomain[0] === 0 ? 10 : Math.abs(yDomain[0]) * 0.1;
    yDomain = [yDomain[0] - pad, yDomain[1] + pad];
  }

  xScaleS.domain(xDomain).nice();
  yScaleS.domain(yDomain).nice();

  const techs = Array.from(new Set(data.map(d => d.screenTech || "Unknown")));
  colorScale.domain(techs);

  // Axes
  innerChartS.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScaleS).ticks(6))
    .selectAll("text").attr("color", "#f5f5f7");

  innerChartS.append("g")
    .call(d3.axisLeft(yScaleS).ticks(6))
    .selectAll("text").attr("color", "#f5f5f7");

  // Labels
  innerChartS.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 45)
    .attr("text-anchor", "middle")
    .attr("fill", "#FBE79C")
    .text("Star Rating");

  innerChartS.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -55)
    .attr("text-anchor", "middle")
    .attr("fill", "#FBE79C")
    .text("Screen Size (cm)");

  // Points
  innerChartS.selectAll("circle")
    .data(data, (d, i) => i)
    .enter()
    .append("circle")
    .attr("cx", d => xScaleS(d.star))
    .attr("cy", d => yScaleS(d.screenSize))
    .attr("r", 5)
    .attr("fill", d => colorScale(d.screenTech || "Unknown"))
    .attr("opacity", 0.7);

  console.log("[6.2] Circles drawn:", data.length, { xDomain, yDomain, techs });
};
