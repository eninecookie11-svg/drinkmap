import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {verifiedRecord} from '../scripts/lib/food-api.mjs';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));let external=0;p.on('request',r=>{if(new URL(r.url()).hostname==='apis.data.go.kr')external++});
const fixture=verifiedRecord({FOOD_CD:'BROWSER-TEST-ONLY',FOOD_NM_KR:'코카콜라 제로',MAKER_NM:'코카-콜라음료',Z10500:'350ml',SERVING_SIZE:'100g',DB_CLASS_NM:'상용제품',AMT_NUM1:'5',AMT_NUM3:'1',AMT_NUM4:'-',AMT_NUM6:'2',AMT_NUM7:'0',AMT_NUM13:'10',UPDATE_DATE:'2025-01-01'},{productId:'coke',name:'코카콜라 제로',manufacturer:'코카-콜라음료',volumeMl:350},'2026-11-11');
await p.route('**/data/drinks.json',route=>route.fulfill({json:{schemaVersion:1,drinks:[fixture]}}));
for(const width of [1440,390,320]){
 await p.setViewportSize({width,height:1000});await p.goto('http://127.0.0.1:4173');await p.locator('[data-product=coke]').first().waitFor();assert((await p.locator('[data-product=coke]').first().innerText()).includes('카페인 미확인'));await p.locator('[data-product=coke]').first().click();await p.locator('dialog[open]').waitFor();const body=await p.locator('dialog').innerText();assert(body.includes('100g 기준'));assert(body.includes('5 kcal'));assert(body.includes('BROWSER-TEST-ONLY'));assert(!body.includes('36mg'));assert(body.includes('2025-01-01'));assert(body.includes('수집 확인일 2026-11-11'));assert(await p.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));await p.screenshot({path:`test-results/food-api-synthetic-${width}.png`});await p.keyboard.press('Escape');
}
await p.locator('[data-compare=coke]').first().click();await p.locator('[data-compare=pepsi]').first().click();await p.locator('#compare-tray [data-page=compare]').click();const table=await p.locator('dialog table').innerText();assert(table.includes('영양성분 기준량'));assert(table.includes('100g 기준'));assert(table.includes('한 캔 기준'));assert.equal(external,0);assert.deepEqual(errors,[]);
// Invalid data must not silently fall back to historical nutrients.
await p.route('**/data/drinks.json',route=>route.fulfill({json:{schemaVersion:99,drinks:[fixture]}}));await p.goto('http://127.0.0.1:4173');await p.locator('#retry').waitFor();assert.equal(await p.locator('.product-card').count(),0);
console.log('공식 영양정보 브라우저 검사 통과: 100g 원기준·혼합 방지·비교·모바일·오류·외부 API 호출 없음 (모의 응답)');
}finally{await browser.close()}
