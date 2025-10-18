function populateFilters(allData) {
  const holder = d3.select("#filters_screen");
  holder.selectAll("*").remove();

  const buttons = holder.selectAll("button")
    .data(filters_screen)
    .join("button")
    .attr("class", d => `button ${d.isActive ? "active" : ""}`)
    .attr("data-id", d => d.id)
    .text(d => d.label);

  buttons.on("click", (_, filter) => {
    if (filter.isActive) return; // already active

    // update model
    filters_screen.forEach(f => f.isActive = (f.id === filter.id));
    // reflect state
    holder.selectAll("button").classed("active", d => d.isActive);

    console.log("[Filter click]", filter.id);
    updateHistogram(filter.id, allData);
  });
}
