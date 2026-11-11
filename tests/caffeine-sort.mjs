import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const products=JSON.parse(fs.readFileSync('public/data/products.json','utf8'));
// Exercise unknown handling even when every live product has a caffeine value.
const fixture=products.map(p=>p.id==='coke'?{...p,caffeine:null,caffeineSource:null,caffeineApproximate:false,caffeineStatus:'미확인'}:p);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage();
 await page.route('**/data/products.json',r=>r.fulfill({json:fixture}));
 await page.goto('http://127.0.0.1:4173');await page.locator('.product-card').first().waitFor();
 assert.equal(await page.locator('#sort option').last().innerText(),'카페인 높은 순');
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  await page.locator('#sort').selectOption('caffeine-desc');
  const ids=await page.locator('#grid [data-product]').evaluateAll(es=>es.map(e=>e.dataset.product));
  const expected=[...fixture].sort((a,b)=>(b.caffeine??-Infinity)-(a.caffeine??-Infinity)).map(p=>p.id);
  assert.deepEqual(ids,expected);
  assert.equal(ids.at(-1),'coke');
  assert.equal(fixture.find(p=>p.id===ids[0]).caffeine,100);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.locator('#search').fill('펩시');
 assert.deepEqual(await page.locator('#grid [data-product]').evaluateAll(es=>es.map(e=>e.dataset.product)),['pepsi','pepsi-free']);
 console.log('카페인 높은 순 검증 통과: PC·390px·320px·검색 병행·미확인 마지막');
}finally{await browser.close()}
