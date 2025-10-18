// ex5-utils-d3.js
export function toNum(v){
  if (v === null || v === undefined) return undefined;
  const n = +String(v).replace(/[^0-9eE+.\-]/g, '');
  return Number.isFinite(n) ? n : undefined;
}

export function findCol(headers, ...regexes){
  const idx = headers.find(h => regexes.some(rx => rx.test(String(h).toLowerCase())));
  return idx ?? null;
}

export function getContainerSize(sel, fallbackW=800, fallbackH=360){
  const node = d3.select(sel).node();
  if (!node) return {width:fallbackW, height:fallbackH};
  const r = node.getBoundingClientRect();
  return {
    width: Math.max(320, r.width || fallbackW),
    height: Math.max(220, r.height || fallbackH)
  };
}

export function makeSVG(sel, margins={top:24,right:24,bottom:40,left:56}){
  const {width, height} = getContainerSize(sel);
  const svg = d3.select(sel).append('svg')
    .attr('width', width)
    .attr('height', height);
  const g = svg.append('g')
    .attr('transform', `translate(${margins.left},${margins.top})`);
  const innerW = width - margins.left - margins.right;
  const innerH = height - margins.top - margins.bottom;
  return { svg, g, innerW, innerH, width, height, margins };
}

export function tooltip(){
  const el = d3.select('#tooltip');
  return {
    show(html, x, y){ el.html(html).style('left', `${x+12}px`).style('top', `${y+12}px`).style('opacity', 1); },
    hide(){ el.style('opacity', 0); }
  };
}
