// ex5-line.js — D3 version (keeps same ID & layout)
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
    Object.assign(t.style,{
      position:'fixed',pointerEvents:'none',padding:'.4rem .6rem',border:'1px solid #333',
      borderRadius:'8px',background:'#111',color:'#fff',fontSize:'.8rem',opacity:'0',
      transition:'opacity .12s ease',zIndex:'9999'
    });
    document.body.appendChild(t);
  }
  return {
    show(html,x,y){ t.innerHTML=html; t.style.left=(x+12)+'px'; t.style.top=(y+12)+'px'; t.style.opacity='1'; },
    hide(){ t.style.opacity='0'; }
  };
}

(async function(){
  const mount = swapCanvasForDiv('ex5_line');
  if (!mount) return;
  const rows = await d3.csv('./Ex5_ARE_Spot_Prices.csv');
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const toNum = v => {
    const n = +String(v??'').replace(/[^0-9eE+.\-]/g,''); 
    return Number.isFinite(n)?n:undefined;
  };
  const looksYear = h => {
    let c=0, ok=0;
    for (const r of rows){ const y=toNum(r[h]); if (y!==undefined){c++; if (y>=1900&&y<=2100) ok++;} }
    return c>0 && ok/c>0.8;
  };
  const colYear = headers.find(h=>/^year$|^yr$|date/i.test(h)) ?? headers.find(looksYear);
  const scoreNum = h => {
    const vals = rows.map(r=>toNum(r[h])).filter(v=>v!==undefined);
    if (vals.length<5) return -1e9;
    return d3.variance(vals) ?? 0;
  };
  const colPrice = headers.filter(h=>h!==colYear).map(h=>[h,scoreNum(h)]).sort((a,b)=>b[1]-a[1])[0]?.[0];

  const data = rows.map(r=>({year:toNum(r[colYear]), price:toNum(r[colPrice])}))
    .filter(d=>d.year!==undefined && d.price!==undefined)
    .sort((a,b)=>d3.ascending(a.year,b.year));
  if (!data.length) return;

  const rc = mount.getBoundingClientRect();
  const width = Math.max(320, rc.width || 800);
  const height = 320;
  const m = {top:24,right:16,bottom:40,left:56};
  const innerW = width - m.left - m.right;
  const innerH = height - m.top - m.bottom;

  const svg = d3.select('#ex5_line').append('svg').attr('width',width).attr('height',height);
  const g = svg.append('g').attr('transform',`translate(${m.left},${m.top})`);

  const x = d3.scaleLinear().domain(d3.extent(data,d=>d.year)).nice().range([0,innerW]);
  const y = d3.scaleLinear().domain([0,d3.max(data,d=>d.price)]).nice().range([innerH,0]);

  g.append('g').attr('class','axis').attr('transform',`translate(0,${innerH})`).call(d3.axisBottom(x).ticks(8).tickFormat(d3.format('d')));
  g.append('g').attr('class','axis').call(d3.axisLeft(y).ticks(6));

  const line = d3.line().x(d=>x(d.year)).y(d=>y(d.price)).curve(d3.curveMonotoneX);
  g.append('path').datum(data).attr('fill','none').attr('stroke','#b86bff').attr('stroke-width',2).attr('d', line);

  const tt = ensureTooltip();
  g.selectAll('circle.pt')
    .data(data).join('circle').attr('class','pt')
    .attr('cx',d=>x(d.year)).attr('cy',d=>y(d.price)).attr('r',3).attr('fill','#b86bff')
    .on('mouseenter',(e,d)=>tt.show(`<b>${d.year}</b><br/>Price: ${d.price}`, e.clientX, e.clientY))
    .on('mouseleave',()=>tt.hide());
})();
