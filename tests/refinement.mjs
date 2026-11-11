import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[];
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173');await page.locator('.product-card').first().waitFor();
assert.equal(await page.locator('header nav a, header nav button').count(),3);
assert.equal(await page.locator('header .logo').innerText(),'드링크맵');
assert.equal(await page.locator('header .logo-mark, header .wordmark, header [data-page=about], header [data-page=compare], .hero-shelf').count(),0);
assert(await page.locator('header nav button').first().evaluate(x=>parseFloat(getComputedStyle(x).fontSize)>=17));
await page.locator('#search').fill('코카콜라');assert.deepEqual(await page.locator('.card-info h3').allTextContents(),['코카콜라 제로']);assert((await page.locator('#search-feedback').innerText()).includes('1개'));
await page.locator('#search').fill('코카-콜라음료');assert.equal(await page.locator('.product-card').count(),4);
await page.locator('#search').fill('롯데칠성음료');assert.equal(await page.locator('.product-card').count(),5);
await page.locator('#clear-search').click();assert.equal(await page.locator('.product-card').count(),15);assert.equal(await page.locator('#search').inputValue(),'');
await page.locator('#search').fill('수크랄로스');assert.equal(await page.locator('.product-card').count(),14);
await page.locator('#clear-search').click();
await page.screenshot({path:'test-results/review-after-pc.png'});
for(const width of [390,320,768]){
await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo(0,0));
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`가로 넘침 ${width}`);
if(width<=760){
assert.equal(await page.locator('.filter-panel').getAttribute('open'),null);
assert(await page.locator('.product-card').first().evaluate(x=>x.getBoundingClientRect().top<window.innerHeight),'첫 화면에 제품을 보여야 합니다');
await page.locator('.filter-panel>summary').click();assert(await page.locator('.filters').isVisible());
await page.locator('[name=sweet][value=아스파탐]').check();assert.equal(await page.locator('.product-card').count(),1);
await page.locator('#reset').click();await page.locator('.filter-panel>summary').click();
for(const control of ['header nav a','header nav button','#search-form button','.filter-panel>summary']){
assert(await page.locator(control).first().evaluate(x=>x.getBoundingClientRect().height>=44),`누르기 작은 버튼 ${control}`);
}
}
await page.screenshot({path:`test-results/review-after-${width}.png`});
}
await page.setViewportSize({width:390,height:844});await page.locator('#search').fill('코카콜라');await page.getByRole('button',{name:'음료 검색',exact:true}).click();await page.waitForTimeout(500);await page.screenshot({path:'test-results/review-after-search.png'});
await page.locator('[data-product=coke]').first().click();await page.locator('dialog[open]').waitFor();assert((await page.locator('dialog').innerText()).includes('36mg'));
await page.keyboard.press('Escape');await page.locator('[data-compare=coke]').first().click();assert(await page.locator('#compare-tray').isVisible());
assert.deepEqual(errors,[]);console.log('개선 검증 통과: 헤더·히어로 제거·정확한 검색·모바일 필터·터치 크기·첫 화면 제품·상세·비교');
}finally{await browser.close()}
