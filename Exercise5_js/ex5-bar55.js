// ex5-bar55.js — D3 version
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
  const mount = swapCanvasForDiv('ex5_bar55');
  if (!mount) return;
  const rows = await d3.csv('./Ex5_TV_energy_55inchtv_byScreenType.csv');
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const toNum = v => { const n=+String(v??'').replace(/[^0-9eE+.\-]/g,''); return Number.isFinite(n)?n:undefined; };
  const colTech = headers.find(h=>/screen.*tech|technology|tech/i.test(h));
  const colMean = headers.find(h=>/mean.*energy|avg.*energy|average|^mean$|^avg$|kwh/i.test(h));
  if (!colTech || !colMean) return;

  const data = rows.map(r=>({ tech:String(r[colTech]).trim(), mean:toNum(r[colMean]) }))
    .filter(d=>d.tech && d.mean!==undefined)
    .sort((a,b)=>d3.descending(a.mean,b.mean));
  if (!data.length) return;

  const rc = mount.getBoundingClientRect();
  const width = Math.max(320, rc.width || 800);
  const height = Math.max(260, 24 * data.length + 60);
  const m = {top:12,right:24,bottom:36,left:100};
  const innerW = width - m.left - m.right;
  const innerH = height - m.top - m.bottom;

  const svg = d3.select('#ex5_bar55').append('svg').attr('width',width).attr('height',height);
  const g = svg.append('g').attr('transform',`translate(${m.left},${m.top})`);

  const y = d3.scaleBand().domain(data.map(d=>d.tech)).range([0, innerH]).padding(0.2);
  const x = d3.scaleLinear().domain([0, d3.max(data,d=>d.mean)]).nice().range([0, innerW]);

  g.append('g').attr('class','axis').call(d3.axisLeft(y));
  g.append('g').attr('class','axis').attr('transform',`translate(0,${innerH})`).call(d3.axisBottom(x).ticks(6));

  const tt = ensureTooltip();
  g.selectAll('rect.bar')
    .data(data).join('rect').attr('class','bar')
    .attr('y',d=>y(d.tech)).attr('x',0).attr('height',y.bandwidth()).attr('width',d=>x(d.mean))
    .attr('fill','#4e79a7')
    .on('mouseenter',(e,d)=>tt.show(`<b>${d.tech}</b><br/>Mean: ${d.mean}`, e.clientX, e.clientY))
    .on('mouseleave',()=>tt.hide());

  g.selectAll('text.val')
    .data(data).join('text')
    .attr('x',d=>x(d.mean)+6).attr('y',d=>y(d.tech)+y.bandwidth()/2).attr('dy','0.35em')
    .attr('fill','#cfd3dc').text(d=>d.mean);
})();
