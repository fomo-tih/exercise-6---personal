// ex5-donut.js — D3 version
function swapCanvasForDiv(id){
  const old = document.getElementById(id);
  if (!old) return null;
  const wrap = old.parentNode;
  const div = document.createElement('div');
  div.id = id; div.className = old.className || '';
  wrap.replaceChild(div, old);
  return div;
}
function ensureTooltip(){
  let t = document.getElementById('tooltip');
  if (!t){
    t = document.createElement('div');
    t.id='tooltip';
    Object.assign(t.style,{position:'fixed',pointerEvents:'none',padding:'.4rem .6rem',border:'1px solid #333',
      borderRadius:'8px',background:'#111',color:'#fff',fontSize:'.8rem',opacity:'0',transition:'opacity .12s ease',zIndex:'9999'});
    document.body.appendChild(t);
  }
  return { show(html,x,y){ t.innerHTML=html; t.style.left=(x+12)+'px'; t.style.top=(y+12)+'px'; t.style.opacity='1'; },
           hide(){ t.style.opacity='0'; } };
}

(async function(){
  const mount = swapCanvasForDiv('ex5_donut');
  if (!mount) return;
  const rows = await d3.csv('./Ex5_TV_energy_Allsizes_byScreenType.csv');
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const toNum = v => { const n=+String(v??'').replace(/[^0-9eE+.\-]/g,''); return Number.isFinite(n)?n:undefined; };
  const findCol = (...rxs)=>headers.find(h=>rxs.some(rx=>rx.test(String(h).toLowerCase())));
  const colTech = findCol(/screen.*tech/, /technology/, /^tech$/, /type/, /category/, /segment/, /group/);
  if (!colTech) return;

  let colTotal = findCol(/total.*energy/, /sum.*energy/, /consumption.*(total|sum)/, /^total$/, /^sum$/, /kwh[_ ]?total/, /total[_ ]?kwh/, /^value$/, /^amount$/);
  if (!colTotal){
    const candidates = headers.filter(h=>h!==colTech);
    const scored = candidates.map(h=>{
      const vals = rows.map(r=>toNum(r[h])).filter(v=>v!==undefined);
      return [h, vals.length>=3 ? d3.sum(vals) : -1];
    }).sort((a,b)=>b[1]-a[1]);
    colTotal = scored[0]?.[0];
  }
  if (!colTotal) return;

  const byTech = d3.rollups(rows, v=>d3.sum(v, r=>toNum(r[colTotal]) ?? 0), r=>String(r[colTech]).trim())
    .filter(([k,v])=>k && v>0).sort((a,b)=>d3.descending(a[1],b[1]));

  const labels = byTech.map(d=>d[0]);
  const values = byTech.map(d=>d[1]);

  const rc = mount.getBoundingClientRect();
  const size = Math.min(Math.max(280, rc.width || 360), 360);
  const radius = size/2, innerR = radius*0.55;

  const svg = d3.select('#ex5_donut').append('svg').attr('width',size).attr('height',size)
    .append('g').attr('transform',`translate(${radius},${radius})`);

  const color = d3.scaleOrdinal().domain(labels).range(['#3fbf9f','#7aa2ff','#f5a524','#b86bff','#ee6d9e','#66c2a5','#8da0cb','#fc8d62']);
  const pie = d3.pie().sort(null).value(d=>d[1]);
  const arc = d3.arc().innerRadius(innerR).outerRadius(radius-6);

  const tt = ensureTooltip();
  svg.selectAll('path.slice')
    .data(pie(byTech)).join('path').attr('class','slice').attr('d',arc).attr('fill', d=>color(d.data[0]))
    .on('mouseenter',(e,d)=>tt.show(`<b>${d.data[0]}</b><br/>Total: ${d3.format(',')(d.data[1])}`, e.clientX, e.clientY))
    .on('mouseleave',()=>tt.hide());

  // legend (compact)
  const legend = svg.append('g').attr('class','legend').attr('transform',`translate(${-(radius)},${-(radius)})`);
  const row = legend.selectAll('g.row').data(labels).join('g').attr('class','row')
    .attr('transform',(d,i)=>`translate(8,${8+i*18})`);
  row.append('rect').attr('width',12).attr('height',12).attr('fill', d=>color(d));
  row.append('text').attr('x',18).attr('y',10).text(d=>d);
})();
