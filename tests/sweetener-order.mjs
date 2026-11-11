import fs from 'node:fs';
import assert from 'node:assert/strict';
import {surveyCounts,orderSweeteners} from '../public/sweetener-order.js';
const data=JSON.parse(fs.readFileSync('public/data/sweetener-survey-2026.json','utf8'));
const counts=surveyCounts(data);
assert.equal(data.products.length,20);
assert.equal(counts.get('수크랄로스'),18);
assert.equal(counts.get('아세설팜칼륨'),9);
assert.equal(counts.get('에리스리톨'),8);
assert.equal(counts.get('알룰로스'),4);
assert.equal(counts.get('스테비아계 감미료'),4);
assert.equal(counts.get('소비톨'),2);
assert.equal(counts.get('아스파탐'),1);
const original=[['아스파탐',null,'mg'],['아세설팜칼륨',null,'mg'],['수크랄로스',null,'mg']];
assert.deepEqual(orderSweeteners(original,counts).map(x=>x[0]),['수크랄로스','아세설팜칼륨','아스파탐']);assert.equal(original[0][0],'아스파탐');
assert.deepEqual(orderSweeteners([['미조사A'],['미조사B']],counts),[['미조사A'],['미조사B']]);
assert.deepEqual(orderSweeteners([['스테비올배당체'],['알룰로스']],counts),[['스테비올배당체'],['알룰로스']]);
for(const change of [d=>d.products.push(d.products[0]),d=>d.products[0].labelKcal=12,d=>d.products[0].sourceId='missing',d=>d.products[0].saleSourceId='birak-label',d=>d.sources[0].checked='2024-01-01']){const invalid=structuredClone(data);change(invalid);assert.throws(()=>surveyCounts(invalid));}
console.log('감미료 외부 조사 검사 통과: 20종·중복 제외·출처·0kcal·미조사/동률·카드 정렬');
