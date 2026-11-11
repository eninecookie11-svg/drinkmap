import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:4173');
 await page.locator('.product-card').first().waitFor();
 assert.deepEqual(await page.locator('.topics button').allTextContents(),['모든 음료 32','☾ 카페인 없는 음료','수크랄로스 포함','아세설팜칼륨 포함','에리스리톨 포함']);
 assert((await page.locator('[data-product=pepsi] .tags').innerText()).includes('카페인 약 46mg'));
 assert((await page.locator('[data-product=pepsi-free] .tags').innerText()).includes('미확인'));
 fs.mkdirSync('test-results',{recursive:true});
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('.card-info').first().innerText().then(t=>t.includes('카페인 약 34mg')));
  await page.locator('nav [data-catalog-link]').click();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('#catalog-title').evaluate(e=>document.activeElement===e),true);
  const visible=await page.evaluate(()=>({title:document.querySelector('#catalog-title').getBoundingClientRect().top,header:document.querySelector('header').getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth}));
  assert(visible.title>=visible.header,`헤더가 제목을 가림: ${width}`);
  assert(!visible.overflow);
  for(const button of await page.locator('.topics button').all())assert(await button.evaluate(e=>e.scrollWidth<=e.clientWidth),`바로가기 글자 넘침: ${width}`);
  await page.screenshot({path:`test-results/topics-after-${width}.png`});
  await page.evaluate(()=>scrollTo(0,0));
 }
 await page.locator('[data-topic=수크랄로스]').click();
 assert.equal(await page.locator('[name=sweet][value=수크랄로스]').isChecked(),true);
 assert.equal(await page.locator('[data-topic=수크랄로스]').getAttribute('aria-pressed'),'true');
 await page.locator('.filter-panel summary').click();
 await page.locator('[name=sweet][value=아스파탐]').check();
 assert.equal(await page.locator('.topics [aria-pressed=true]').count(),0);
 await page.locator('[data-topic=all]').click();
 assert.equal(await page.locator('.product-card').count(),32);
 await page.locator('nav [data-page=dictionary]').click();
 await page.locator('[data-close]').click();
 await page.locator('nav [data-catalog-link]').click();
 assert.equal(await page.locator('#catalog-title').evaluate(e=>document.activeElement===e),true);
 console.log('탐색 메뉴 검증 통과: 감미료 3개·선택 동기화·반복 이동·PC/390px/320px');
} finally {await browser.close()}
