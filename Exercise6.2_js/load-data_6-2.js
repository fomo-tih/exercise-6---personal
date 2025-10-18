// load-data-6_2.js
console.log("[6.2] D3 version:", d3.version);

d3.csv("Ex6.2_TVdata.csv").then(raw => {
  console.log("[6.2] CSV rows (raw):", raw.length, raw.slice(0, 3));

  // Expected headers: brand, model, screenSize, screenTech, energyConsumption, star
  const data = raw.map(d => ({
    star:       parseFloat(d.star ?? d["Star"] ?? d["star"]),
    screenSize: parseFloat(d.screenSize ?? d["Screen Size (cm)"] ?? d["ScreenSize"]),
    screenTech: d.screenTech ?? d["Screen Tech"] ?? d["Screen Technology"],
    brand:      d.brand ?? d.Brand ?? d["TV Brand"]
  })).filter(d => Number.isFinite(d.star) && Number.isFinite(d.screenSize));

  console.log("[6.2] Parsed/filtered rows:", data.length, data.slice(0, 5));
  if (!data.length) {
    console.error("[6.2] No valid rows after parsing — check CSV headers/path.");
  }

  drawScatterplot(data);
  createTooltip();
  handleMouseEvents();
}).catch(err => {
  console.error("[6.2] Error loading CSV:", err);
});
