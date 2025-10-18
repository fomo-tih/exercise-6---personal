// Load the CSV, normalize tech labels, then init + render
d3.csv("Ex6_TVdata.csv", d => {
  const get = (obj, ...cands) => {
    const keys = Object.keys(obj);
    for (const want of cands) {
      const hit = keys.find(k => k.toLowerCase() === String(want).toLowerCase());
      if (hit) return obj[hit];
    }
    return undefined;
  };

  const toNum = v => {
    if (v == null) return undefined;
    const n = +String(v).replace(/[^0-9eE.+-]/g, "");
    return Number.isFinite(n) ? n : undefined;
  };

  // NOTE: LCD before LED to avoid misclassifying "LCD/LED"
  const canonicalTech = (s) => {
    const t = String(s || "").trim().toUpperCase();
    if (t.includes("OLED")) return "OLED";
    if (t.includes("LCD"))  return "LCD";
    if (t.includes("QLED") || t.includes("MINI") || t.includes("MICRO")) return "LED";
    if (t.includes("LED"))  return "LED";
    return "OTHER";
  };

  const rawTech = get(d, "screenTech","screenTechnology","technology","tech","type","category");

  return {
    brand:   get(d, "brand","Brand"),
    model:   get(d, "model","Model"),
    screenTech: canonicalTech(rawTech),
    screenSize: toNum(get(d, "screenSize","size","inches")),
    energyConsumption: toNum(get(d, "energyConsumption","energy","kwh","kWh")),
    star: toNum(get(d, "star","starRating","stars")),
  };
})
.then(data => {
  const ok = data.filter(r => r.energyConsumption != null && r.screenTech);
  const counts = d3.rollup(ok, v => v.length, d => d.screenTech);
  console.log("Ex6 — loaded rows:", ok.length, "tech counts:", Object.fromEntries(counts));

  // Keep globally for interactions
  window.__tvData = ok;

  // Initialize SVG once with ALL data (fixes x-axis jumping)
  initHistogram(ok);

  // First draw: ALL
  updateHistogram("all", ok);

  // Build filter buttons
  populateFilters(ok);
})
.catch(err => console.error("Error loading Ex6 CSV:", err));
