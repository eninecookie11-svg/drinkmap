import assert from 'node:assert/strict';
import fs from 'node:fs';
import {findSearchMatches} from '../public/search.js';
const products=JSON.parse(fs.readFileSync('public/data/products.json','utf8').replace(/^\uFEFF/,''));
const ids=q=>findSearchMatches(products,q).products.map(p=>p.id);
assert.deepEqual(ids('코카콜라'),['coke']);
assert.deepEqual(ids('코카-콜라'),['coke']);
assert.deepEqual(ids(' 코카 콜라 제로 '),['coke']);
assert.deepEqual(ids('스프라이트'),['sprite']);
assert.deepEqual(ids('펩시'),['pepsi','pepsi-free']);
assert.deepEqual(ids('펩시 제로슈거 라임'),['pepsi']);
assert.deepEqual(ids('롯데칠성음료'),['pepsi','chilsung','milkis','tams-pineapple','pepsi-free','chilsung-lime','tams-apple','lipton-peach','two-percent-peach']);
assert.deepEqual(ids('코카-콜라음료'),['coke','sprite','drpepper','fanta','fanta-grape','toreta-zero','powerade-zero','powerade-lime','monster-zero','monster-ultra','monster-peach']);
assert.equal(ids('수크랄로스').length,27);
assert.deepEqual(ids('코카콜라 딸기'),[]);
assert.equal(ids('  ').length,products.length);
// Guard ambiguity even if a future manufacturer exactly shares a product name.
assert.deepEqual(findSearchMatches([{name:'새음료',brand:'브랜드',sweeteners:[],id:'a'},{name:'다른음료',brand:'새음료',sweeteners:[],id:'b'}],'새음료').products.map(p=>p.id),['a']);
console.log('검색 회귀 검사 12개 통과: 제품명 우선·제조사 분리·띄어쓰기·감미료');
