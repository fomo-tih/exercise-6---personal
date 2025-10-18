// interactions-6_2.js

// Create the tooltip container inside innerChartS (same coord system)
const createTooltip = () => {
  if (!innerChartS) {
    console.error("[6.2] createTooltip: innerChartS is undefined. Ensure drawScatterplot() ran first.");
    return;
  }

  const tooltip = innerChartS.append("g")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("pointer-events", "none");

  tooltip.append("rect")
    .attr("width", tooltipWidth)
    .attr("height", tooltipHeight)
    .attr("rx", 5).attr("ry", 5)
    .attr("fill", barColor)
    .attr("fill-opacity", 0.85);

  tooltip.append("text")
    .attr("x", tooltipWidth / 2)
    .attr("y", tooltipHeight / 2 + 4)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("fill", "#1d1d1f")
    .style("font-weight", "600")
    .style("font-size", "12px");
};

const handleMouseEvents = () => {
  if (!innerChartS) {
    console.error("[6.2] handleMouseEvents: innerChartS is undefined. Ensure drawScatterplot() ran first.");
    return;
  }

  const tooltip = innerChartS.select(".tooltip");
  const tooltipText = tooltip.select("text");

  const circles = innerChartS.selectAll("circle");
  if (circles.empty()) {
    console.warn("[6.2] handleMouseEvents: no circles found. Check parsing and script order.");
  }

  circles
    .style("cursor", "pointer")
    .on("mouseenter", function (e, d) {
      const cx = +this.getAttribute("cx");
      const cy = +this.getAttribute("cy");

      tooltipText.text(`${d.brand || d.screenTech || "TV"}: ${d.screenSize} cm`);

      tooltip
        .attr("transform", `translate(${cx - tooltipWidth / 2}, ${cy - tooltipHeight - 10})`)
        .raise()
        .transition().duration(150)
        .style("opacity", 1);

      d3.select(this)
        .transition().duration(100)
        .attr("r", 7)
        .attr("opacity", 0.95);
    })
    .on("mousemove", function (e) {
      const [px, py] = d3.pointer(e, innerChartS.node());
      tooltip.attr("transform", `translate(${px - tooltipWidth / 2}, ${py - tooltipHeight - 14})`);
    })
    .on("mouseleave", function () {
      tooltip.transition().duration(150).style("opacity", 0);
      d3.select(this)
        .transition().duration(100)
        .attr("r", 5)
        .attr("opacity", 0.7);
    });
};
