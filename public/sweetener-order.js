export const sweetenerGroup=name=>({'액상알룰로스':'알룰로스','알룰로오스':'알룰로스','액상알룰로오스':'알룰로스','스테비올배당체':'스테비아계 감미료','효소처리스테비아':'스테비아계 감미료','D-소비톨액':'소비톨','D-소비톨':'소비톨'})[name]||name;
export function surveyCounts(survey){
 if(survey?.schemaVersion!==1||!/^2026-\d{2}-\d{2}$/.test(survey.checked)||!Array.isArray(survey.products)||!survey.products.length||!Array.isArray(survey.sources))throw new Error('감미료 조사 자료 형식 확인 필요');
 const sources=new Map();for(const s of survey.sources){if(!s.id||sources.has(s.id)||!s.title||!/^https:\/\//.test(s.url)||s.checked!==survey.checked)throw new Error('감미료 조사 출처 확인 필요');sources.set(s.id,s);}
 const ids=new Set(),groups=new Set(),counts=new Map();
 for(const p of survey.products){if(!p.id||ids.has(p.id)||!p.deduplicationKey||groups.has(p.deduplicationKey)||!p.name||!sources.has(p.sourceId)||!sources.get(p.saleSourceId)?.saleEvidence||sources.get(p.sourceId)?.kind==='retailer-sale'||!p.evidence||!Number.isFinite(p.volumeMl)||p.volumeMl<=0||p.labelKcal!==0||!p.labelBasis||!Array.isArray(p.sweeteners)||!p.sweeteners.every(x=>typeof x==='string'&&x.trim())||new Set(p.sweeteners).size!==p.sweeteners.length)throw new Error('감미료 조사 제품·중복·표시 열량 확인 필요');ids.add(p.id);groups.add(p.deduplicationKey);
  for(const name of new Set(p.sweeteners.map(sweetenerGroup)))counts.set(name,(counts.get(name)||0)+1);
 }return counts;
}
export function orderSweeteners(sweeteners,counts){return [...sweeteners].sort((a,b)=>(counts.get(sweetenerGroup(b[0]))||0)-(counts.get(sweetenerGroup(a[0]))||0));}
// Count each named ingredient once per registered product, regardless of amount.
// Preserve distinct label names: steviol glycosides and enzyme-treated stevia
// are separate entries in the current catalog.
export function catalogCounts(products){
 const counts=new Map();
 for(const p of products)for(const name of new Set(p.sweeteners.map(s=>s[0])))counts.set(name,(counts.get(name)||0)+1);
 return counts;
}
export function orderCatalogSweeteners(sweeteners,counts){
 return [...sweeteners].sort((a,b)=>(counts.get(b[0])||0)-(counts.get(a[0])||0)||a[0].localeCompare(b[0],'ko'));
}
