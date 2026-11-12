import fs from 'node:fs';
import {applyDrinks} from '../public/nutrition.js';
import {catalogCounts,orderCatalogSweeteners} from '../public/sweetener-order.js';

const base='https://drinkmap.pages.dev/';
const xml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const readData=name=>JSON.parse(fs.readFileSync(new URL(`../public/data/${name}.json`,import.meta.url),'utf8'));
const products=applyDrinks(readData('products'),readData('drinks'));
const counts=catalogCounts(products);
// Source check dates are not article publication dates, so omit pubDate.
const items=products.map(p=>{
  const link=base+'#product/'+encodeURIComponent(p.id);
  const sweeteners=[...new Set(orderCatalogSweeteners(p.sweeteners,counts).map(s=>s[0]))];
  return `    <item>
      <title>${xml(p.name)} ${xml(p.volume)}ml</title>
      <link>${xml(link)}</link>
      <guid isPermaLink="true">${xml(link)}</guid>
      <description>${xml(`${p.brand} · ${p.volume}ml. 감미료: ${sweeteners.join(' · ')||'미확인'}. 카페인·영양정보와 출처는 제품 상세에서 확인하세요. 현재 판매 제품의 표시와 다를 수 있어요.`)}</description>
${sweeteners.map(name=>`      <category>${xml(name)}</category>`).join('\n')}
    </item>`;
}).join('\n');
fs.writeFileSync(new URL('../public/rss.xml',import.meta.url),`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>드링크맵 · 제로음료 도감</title>
    <link>${base}</link>
    <description>알고 마시는 한 캔, 달콤함 뒤의 정보까지. 드링크맵에 등록된 제로음료를 살펴보세요.</description>
    <language>ko</language>
    <atom:link href="${base}rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`);
