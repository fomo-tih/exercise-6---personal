// ex5-scatter.js — D3 version
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
  const mount = swapCanvasForDiv('ex5_scatter');
  if (!mount) return;
  const rows = await d3.csv('./Ex5_TV_energy.csv');
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const toNum = v => { const n=+String(v??'').replace(/[^0-9eE+.\-]/g,''); return Number.isFinite(n)?n:undefined; };
  const findCol = (...rxs)=>headers.find(h=>rxs.some(rx=>rx.test(String(h).toLowerCase())));
  const colSize = findCol(/size/, /inch/, /screen[_ ]?size/, /diag/);
  const colEnergy = findCol(/energy/, /kwh/, /consumption/, /power/, /^w$|watt/);
  const colTech = findCol(/screen.*tech/, /technology/, /tech/, /type/);

  if (!colSize || !colEnergy) return;

  const data = rows.map(r=>({
    size: toNum(r[colSize]),
    energy: toNum(r[colEnergy]),
    tech: (colTech ? (r[colTech]??'').trim() : '—')
  })).filter(d=>d.size!==undefined && d.energy!==undefined);

  const rc = mount.getBoundingClientRect();
  const width = Math.max(320, rc.width || 800);
  const height = 320;
  const m = {top:12,right:20,bottom:44,left:56};
  const innerW = width - m.left - m.right;
  const innerH = height - m.top - m.bottom;

  const svg = d3.select('#ex5_scatter').append('svg').attr('width',width).attr('height',height);
  const g = svg.append('g').attr('transform',`translate(${m.left},${m.top})`);

  const x = d3.scaleLinear().domain(d3.extent(data,d=>d.size)).nice().range([0,innerW]);
  const y = d3.scaleLinear().domain([0, d3.max(data,d=>d.energy)]).nice().range([innerH,0]);
  const cats = [...new Set(data.map(d=>d.tech))];
  const color = d3.scaleOrdinal(d3.schemeSet2).domain(cats);

  g.append('g').attr('class','axis').attr('transform',`translate(0,${innerH})`).call(d3.axisBottom(x).ticks(6));
  g.append('g').attr('class','axis').call(d3.axisLeft(y).ticks(6));

  g.append('text').attr('x', innerW/2).attr('y', innerH+36).attr('text-anchor','middle').attr('fill','#cfd3dc').text('Screen size (inches)');
  g.append('text').attr('x', -innerH/2).attr('y', -40).attr('transform','rotate(-90)').attr('text-anchor','middle').attr('fill','#cfd3dc').text('Energy (kWh or W)');

  const tt = ensureTooltip();
  g.selectAll('circle.dot')
    .data(data).join('circle').attr('class','dot')
    .attr('cx',d=>x(d.size)).attr('cy',d=>y(d.energy)).attr('r',4).attr('fill', d=>color(d.tech)).attr('opacity',0.9)
    .on('mouseenter',(e,d)=>tt.show(`<b>${d.tech}</b><br/>Size: ${d.size}<br/>Energy: ${d.energy}`, e.clientX, e.clientY))
    .on('mouseleave',()=>tt.hide());

  // Legend (only if tech present)
  if (colTech){
    const legend = g.append('g').attr('class','legend').attr('transform',`translate(${innerW-120},0)`);
    const item = legend.selectAll('g.item').data(cats).join('g').attr('class','item').attr('transform',(d,i)=>`translate(0,${i*18})`);
    item.append('rect').attr('width',12).attr('height',12).attr('fill', d=>color(d));
    item.append('text').attr('x',18).attr('y',10).text(d=>d);
  }
})();
