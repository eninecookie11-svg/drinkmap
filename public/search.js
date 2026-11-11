// Product names take priority over manufacturer names. Pure functions keep this
// behavior independent of rendering and make regressions easy to check.
export const normalizeSearch = value => String(value).normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/[\s\p{P}\p{S}]/gu,'');
export function findSearchMatches(products, query) {
  const q=normalizeSearch(query);
  if(!q)return {products,label:'전체 음료'};
  const exact=products.filter(p=>normalizeSearch(p.name)===q);
  if(exact.length)return {products:exact,label:'제품명 일치'};
  const words=String(query).trim().split(/\s+/).map(normalizeSearch).filter(Boolean);
  const names=products.filter(p=>normalizeSearch(p.name).includes(q)||(words.length>1&&words.every(word=>normalizeSearch(p.name).includes(word))));
  if(names.length)return {products:names,label:'제품명 검색 결과'};
  // Manufacturer search is allowed only when the full manufacturer name is
  // entered; it cannot widen a successful product-name search.
  const brands=products.filter(p=>normalizeSearch(p.brand)===q);
  if(brands.length)return {products:brands,label:'제조사 검색 결과'};
  const sweeteners=products.filter(p=>p.sweeteners.some(s=>normalizeSearch(s[0]).includes(q)));
  return {products:sweeteners,label:sweeteners.length?'감미료 검색 결과':'제품명 검색 결과'};
}
