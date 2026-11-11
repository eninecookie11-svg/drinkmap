import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:4173');
 await page.locator('.product-card').first().waitFor();
 assert.deepEqual(await page.locator('.topics button').allTextContents(),['모든 음료 28','☾ 카페인 없는 음료','수크랄로스 포함','아세설팜칼륨 포함','알룰로스 포함']);
 assert((await page.locator('[data-product=pepsi] .tags').innerText()).includes('카페인 약 46mg'));
 assert((await page.locator('[data-product=pepsi-free] .tags').innerText()).includes('카페인 없음'));
 assert.equal(await page.locator('#sort option:checked').innerText(),'기본순');
 assert.deepEqual([...new Set(await page.locator('.card-bottom>span').allTextContents())],['인터넷 조사 결과']);
 assert.equal(await page.locator('[data-product=pepsi-pineapple], [data-product=nobrand]').count(),0);
 fs.mkdirSync('test-results',{recursive:true});
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('[data-product=coke] .card-info').innerText().then(t=>t.includes('카페인 약 34mg')));
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
 assert.equal(await page.locator('.product-card').count(),28);
 await page.locator('nav [data-page=dictionary]').click();
 await page.locator('[data-close]').click();
 await page.locator('nav [data-catalog-link]').click();
 assert.equal(await page.locator('#catalog-title').evaluate(e=>document.activeElement===e),true);
 await page.locator('#search').fill('립톤');
 await page.locator('[data-product=lipton-peach]').click();
 await page.locator('dialog[open]').waitFor();
 const lipton=await page.locator('dialog').innerText();
 assert(lipton.includes('약 20mg · 사용자 인터넷 조사값'));
 assert(lipton.includes('사용자 제공 인터넷 조사 결과'));
 assert(lipton.includes('355ml 한 캔 기준'));
 for(const text of ['45 mg','2 g','8 kcal','복숭아 · 밀'])assert(lipton.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/lipton-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('몬스터');
 assert.equal(await page.locator('.product-card').count(),3);
 for(const card of await page.locator('.product-card').all())assert((await card.innerText()).includes('카페인 약 100mg'));
 await page.screenshot({path:'test-results/expansion-monster-320.png',fullPage:true});
 await page.locator('#search').fill('칠성사이다 제로');
 const chilsung=page.locator('[data-product=chilsung]');
 assert((await chilsung.locator('.tags').innerText()).includes('+1'));
 assert(!(await chilsung.locator('.tags').innerText()).includes('아세설팜칼륨'));
 await chilsung.click();
 await page.locator('dialog[open]').waitFor();
 const label=await page.locator('dialog').innerText();
 for(const text of ['0 kcal','12 mg','6 g','대두','스테비올배당체','355ml 한 캔 기준','사용자 제공 인터넷 조사 결과'])assert(label.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/chilsung-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('나랑드사이다 제로');
 await page.locator('#grid [data-product=narangd]').click();
 await page.locator('dialog[open]').waitFor();
 const narangd=await page.locator('dialog').innerText();
 for(const text of ['345ml 한 캔 기준','60 mg','0 kcal','난소화성말토덱스트린','사용자 제공 나랑드사이다','사용자 제공 인터넷 조사 결과'])assert(narangd.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/narangd-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('스프라이트');
 await page.locator('#grid [data-product=sprite]').click();
 await page.locator('dialog[open]').waitFor();
 const sprite=await page.locator('dialog').innerText();
 for(const text of ['350ml 한 캔 기준','11 mg','0 kcal','리뉴얼 전','구연산칼륨'])assert(sprite.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/sprite-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('밀키스');
 await page.locator('#grid [data-product=milkis]').click();
 await page.locator('dialog[open]').waitFor();
 const milkis=await page.locator('dialog').innerText();
 for(const text of ['250ml 한 캔 기준','15 mg','7 g','8 kcal','우유 · 대두','1g 미만','알룰로스5.5g'])assert(milkis.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/milkis-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('닥터페퍼');
 await page.locator('#grid [data-product=drpepper]').click();
 await page.locator('dialog[open]').waitFor();
 const drpepper=await page.locator('dialog').innerText();
 for(const text of ['350ml 한 캔 기준','30 mg','0 kcal','약 39mg','폴리글리시톨시럽','사용자 인터넷 조사값'])assert(drpepper.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/drpepper-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('웰치스 제로 그레이프');
 await page.locator('#grid [data-product=welchs]').click();
 await page.locator('dialog[open]').waitFor();
 const welchs=await page.locator('dialog').innerText();
 for(const text of ['355ml 한 캔 기준','0 mg','8 g','0 kcal','알룰로스8g','사용자 제공 웰치스'])assert(welchs.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/welchs-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('웰치스 제로 샤인머스캣');
 await page.locator('#grid [data-product=welchs-shine]').click();
 await page.locator('dialog[open]').waitFor();
 const shine=await page.locator('dialog').innerText();
 for(const text of ['355ml 한 캔 기준','0 mg','8 g','0 kcal','알룰로스8g','몽크후르츠','사용자 제공 웰치스'])assert(shine.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/welchs-shine-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('환타 제로 파인애플');
 await page.locator('#grid [data-product=fanta]').click();
 await page.locator('dialog[open]').waitFor();
 const fanta=await page.locator('dialog').innerText();
 for(const text of ['350ml 한 캔 기준','27 mg','0 g','0 kcal','효소처리스테비아','사용자 제공 환타'])assert(fanta.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/fanta-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('환타 제로 포도');
 await page.locator('#grid [data-product=fanta-grape]').click();
 await page.locator('dialog[open]').waitFor();
 const grape=await page.locator('dialog').innerText();
 for(const text of ['350ml 한 캔 기준','25 mg','0 kcal','효소처리루틴','사용자 제공 환타'])assert(grape.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/fanta-grape-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('탐스제로 파인애플');
 const tams=page.locator('#grid [data-product=tams-pineapple]');
 assert((await tams.innerText()).includes('+2'));
 assert(!(await tams.innerText()).includes('아세설팜칼륨'));
 await tams.click();await page.locator('dialog[open]').waitFor();
 const pineapple=await page.locator('dialog').innerText();
 for(const text of ['355ml 한 캔 기준','30 mg','9 g','8 kcal','스테비올배당체','에리스리톨1g'])assert(pineapple.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/tams-pineapple-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('맥콜 제로');
 await page.locator('#grid [data-product=mccol]').click();
 await page.locator('dialog[open]').waitFor();
 const mccol=await page.locator('dialog').innerText();
 for(const text of ['250ml 한 캔 기준','35 mg','1 g','5 kcal','나한과스위트','비타민C60mg'])assert(mccol.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/mccol-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('갈배 사이다 제로');
 await page.locator('#grid [data-product=galbae]').click();
 await page.locator('dialog[open]').waitFor();
 const galbae=await page.locator('dialog').innerText();
 for(const text of ['355ml 한 캔 기준','56 mg','0 g','0 kcal','천연향료(배향)','사용자 제공 갈배'])assert(galbae.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/galbae-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('펩시 제로슈거 라임향 제로카페인');
 await page.locator('#grid [data-product=pepsi-free]').click();
 await page.locator('dialog[open]').waitFor();
 const pepsiFree=await page.locator('dialog').innerText();
 for(const text of ['355ml 한 캔 기준','60 mg','0 kcal','페닐알라닌함유','사용자 제공 펩시','없음 · 사용자 인터넷 조사값'])assert(pepsiFree.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/pepsi-free-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('칠성사이다 제로 라임');
 const lime=page.locator('#grid [data-product=chilsung-lime]');
 assert((await lime.innerText()).includes('+1'));
 await lime.click();await page.locator('dialog[open]').waitFor();
 const limeLabel=await page.locator('dialog').innerText();
 for(const text of ['355ml 한 캔 기준','12 mg','7 g','0 kcal','복숭아 · 대두','알룰로스6g'])assert(limeLabel.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/chilsung-lime-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('탐스제로 사과');
 const apple=page.locator('#grid [data-product=tams-apple]');
 assert((await apple.innerText()).includes('+1'));
 await apple.click();await page.locator('dialog[open]').waitFor();
 const appleLabel=await page.locator('dialog').innerText();
 for(const text of ['355ml 한 캔 기준','25 mg','9 g','12 kcal','2g','알룰로스5g','사과청징농축액'])assert(appleLabel.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/tams-apple-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('나랑드사이다 제로 파인애플');
 await page.locator('#grid [data-product=narangd-pineapple]').click();
 await page.locator('dialog[open]').waitFor();
 const narangdPineapple=await page.locator('dialog').innerText();
 for(const text of ['245ml 한 캔 기준','60 mg','1 g','0 kcal','알룰로스1g','사용자 제공 나랑드사이다'])assert(narangdPineapple.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/narangd-pineapple-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('나랑드사이다 제로 그린애플');
 await page.locator('#grid [data-product=narangd-apple]').click();
 await page.locator('dialog[open]').waitFor();
 const narangdApple=await page.locator('dialog').innerText();
 for(const text of ['245ml 한 캔 기준','50 mg','1 g','0 kcal','알룰로오스0.51g','사용자 제공 나랑드사이다'])assert(narangdApple.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/narangd-apple-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('2% 부족할 때 복숭아 제로');
 await page.locator('#grid [data-product=two-percent-peach]').click();
 await page.locator('dialog[open]').waitFor();
 const twoPercent=await page.locator('dialog').innerText();
 for(const text of ['240ml 한 캔 기준','43 mg','7 g','8 kcal','1g','에리스리톨5g','복숭아 함유'])assert(twoPercent.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/two-percent-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('토레타');
 await page.locator('#grid [data-product=toreta-zero]').click();
 await page.locator('dialog[open]').waitFor();
 const toreta=await page.locator('dialog').innerText();
 for(const text of ['500ml 한 병 기준','271 mg','1 g','4 kcal','스페인산','사용자 제공 토레타'])assert(toreta.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/toreta-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('파워에이드 제로');
 await page.locator('#grid [data-product=powerade-zero]').click();
 await page.locator('dialog[open]').waitFor();
 const powerade=await page.locator('dialog').innerText();
 for(const text of ['600ml 한 병 기준','357 mg','1 g','4 kcal','대두 · 복숭아','6.8mg NE'])assert(powerade.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/powerade-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('파워에이드 제로 라임향');
 await page.locator('#grid [data-product=powerade-lime]').click();
 await page.locator('dialog[open]').waitFor();
 const poweradeLime=await page.locator('dialog').innerText();
 for(const text of ['600ml 한 병 기준','345 mg','1.8 g','7 kcal','대두 함유','6.8mg NE'])assert(poweradeLime.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/powerade-lime-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('몬스터 에너지 제로 슈거');
 await page.locator('#grid [data-product=monster-zero]').click();
 await page.locator('dialog[open]').waitFor();
 const monsterZero=await page.locator('dialog').innerText();
 for(const text of ['355ml 한 캔 기준','273 mg','3 g','16 kcal','단백질1g','100mg · 제공 라벨 표시','9.0μg'])assert(monsterZero.includes(text),text);
 assert(!monsterZero.includes('미확년'));
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/monster-zero-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('몬스터 에너지 울트라');
 await page.locator('#grid [data-product=monster-ultra]').click();
 await page.locator('dialog[open]').waitFor();
 const ultra=await page.locator('dialog').innerText();
 for(const text of ['355ml 한 캔 기준','275 mg','4 g','14 kcal','지방0.4g','에리스리톨2g','100mg · 제공 라벨 표시','15.0mg'])assert(ultra.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/monster-ultra-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('몬스터 울트라 피치 킨');
 await page.locator('#grid [data-product=monster-peach]').click();
 await page.locator('dialog[open]').waitFor();
 const peach=await page.locator('dialog').innerText();
 for(const text of ['355ml 한 캔 기준','220 mg','2 g','14 kcal','단백질1.4g','복숭아 함유','100mg · 제공 라벨 표시','스테비올배당체'])assert(peach.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/monster-peach-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('#search').fill('미에로화이바');
 await page.locator('#grid [data-product=miero]').click();
 await page.locator('dialog[open]').waitFor();
 const miero=await page.locator('dialog').innerText();
 for(const text of ['250ml 한 캔 기준','40 mg','10 g','27 kcal','식이섬유6.4g','스테비올배당체','제로 슈가'])assert(miero.includes(text),text);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/miero-label-${width}.png`});
 }
 await page.keyboard.press('Escape');
 await page.locator('nav [data-page=dictionary]').click();
 await page.locator('.dict-entry').first().waitFor();
 const sweetenerOrder=['수크랄로스','아세설팜칼륨','알룰로스','스테비올배당체','에리스리톨','아스파탐','소비톨','효소처리스테비아'];
 assert.deepEqual(await page.locator('.dict-entry h3').allTextContents(),sweetenerOrder);
 assert.deepEqual(await page.locator('#sweetener-filters input').evaluateAll(es=>es.map(e=>e.value)),sweetenerOrder);
 await page.locator('.survey-method summary').click();
 assert.deepEqual(await page.locator('.survey-method dl dd').allTextContents(),['27종','23종','9종','7종','6종','3종','1종','1종']);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`test-results/catalog-sweeteners-${width}.png`});
 }
 await page.locator('[data-find-sweet=소비톨]').click();
 assert.equal(await page.locator('.product-card').count(),1);
 await page.locator('#grid [data-product=tams-pineapple]').click();
 await page.locator('dialog[open]').waitFor();
 assert.deepEqual(await page.locator('.sweetener-labels button').allTextContents(),['수크랄로스 ↗','알룰로스 ↗','스테비올배당체 ↗','에리스리톨 ↗','소비톨 ↗']);
 console.log('탐색 메뉴 검증 통과: 감미료 빈도순·사전8종·누락 감미료 탐색·표시 이미지·PC/390px/320px');
} finally {await browser.close()}
