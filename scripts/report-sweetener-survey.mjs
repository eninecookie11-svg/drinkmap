import fs from 'node:fs';
import {surveyCounts,sweetenerGroup} from '../public/sweetener-order.js';
const survey=JSON.parse(fs.readFileSync('public/data/sweetener-survey-2026.json','utf8'));
const counts=surveyCounts(survey),rank=[...counts].sort((a,b)=>b[1]-a[1]);
const src=new Map(survey.sources.map(s=>[s.id,s]));
// Sensitivity check: collapse flavors within one brand/product line as well.
const families=new Map();for(const p of survey.products){const key=p.deduplicationKey.split('/').slice(0,2).join('/');if(!families.has(key))families.set(key,new Set());for(const s of p.sweeteners)families.get(key).add(sweetenerGroup(s));}
const familyCounts=new Map();for(const list of families.values())for(const name of list)familyCounts.set(name,(familyCounts.get(name)||0)+1);
const familyRank=[...familyCounts].sort((a,b)=>b[1]-a[1]);
const text=`# 2026년 국내 유통 제로칼로리 음료 감미료 조사

확인일: ${survey.checked}. **${survey.products.length}종의 공개자료 표본이며 국내 전체 음료 시장의 전수조사·판매량 통계가 아닙니다.**

${survey.scope}

${survey.method}

${survey.limitations}

## 집계 결과

| 감미료·집계 그룹 | 사용 제품 수 | 표본 내 비율 |
|---|---:|---:|
${rank.map(([name,count])=>`| ${name} | ${count} | ${(count/survey.products.length*100).toFixed(1)}% |`).join('\n')}

감미료를 함께 사용하는 제품이 있어 비율의 합은 100%가 아닙니다. 사용량·판매량·건강·안전성 순위는 아닙니다.

## 맛별 중복을 더 줄였을 때

같은 브랜드·제품군의 맛까지 합치면 ${families.size}개 제품군입니다. 제품군 안의 감미료는 한 번만 세었습니다.

| 감미료·집계 그룹 | 사용 제품군 수 |
|---|---:|
${familyRank.map(([name,count])=>`| ${name} | ${count} |`).join('\n')}

이 보조 집계는 특정 브랜드가 맛 종류를 많이 출시해 생기는 편향을 확인하기 위한 것입니다. 전수조사나 시장 점유율이 되는 것은 아닙니다.

## 표기 정규화

${survey.normalization}

나한과 계열 식품원료는 원재료에 기록된 명칭을 별도 보관했습니다. 단맛에 기여할 수 있는 모든 성분을 완전히 집계했다는 의미가 아닙니다. 몽크후르츠농축과즙을 임의로 특정 식품첨가물로 바꾸지 않았습니다.

## 포함 제품과 근거

| 제품 | 확인 용량·열량 기준 | 집계한 감미료·원료 | 성분 출처 | 국내 판매 근거 |
|---|---|---|---|---|
${survey.products.map(p=>`| ${p.name} | ${p.volumeMl}ml · ${p.labelBasis} 0kcal | ${p.sweeteners.join(' · ')||'전체 원재료 확인 결과 감미료 없음'} | [${src.get(p.sourceId).title}](${src.get(p.sourceId).url}) | [판매 자료](${src.get(p.saleSourceId).url}) |`).join('\n')}

각 제품의 확인 메모·다른 감미 목적 원료·추출 명칭·중복 식별자는 public/data/sweetener-survey-2026.json에 보관합니다. 판매 페이지 원재료를 제품 포장의 독립 검증으로 해석하지 않습니다. 제조사·용량·배합 시점이 다른 자료를 기존 제품의 성분으로 덮어쓰지 않습니다.

## 제외·보류 자료

${survey.excluded.map(p=>`- ${p.url?`[${p.name}](${p.url})`:p.name}: ${p.reason}`).join('\n')}

이 목록은 조사 과정에서 확인한 제외 사례이며 국내의 모든 제외 제품 목록이 아닙니다. 한 병 0kcal 표시 제품을 우선했으므로 저열량·무당 제품 전체를 대표하지 않습니다.

## 사이트 적용

카드 감미료는 이 조사 표본의 사용 제품 수 순으로 정렬합니다. 동률·조사되지 않은 감미료끼리는 원래 순서를 유지합니다. 상위 세 종류와 나머지 개수만 보여주는 기존 동작은 유지합니다. 제품별 영양정보·감미료 목록·카페인 데이터 자체는 변경하지 않습니다.

감미료 사전의 ‘카드 감미료 정렬 기준’에서 조사일·표본 수·집계와 출처를 확인할 수 있습니다.

재집계 및 문서 생성: npm.cmd run survey:report. 표본 추가 시 제품별 표시 열량·원재료·판매 자료·확인일·중복 여부를 함께 확인하세요. 접속 차단된 페이지·출처 없는 블로그·과거 시험값만으로 2026년 판매 제품을 추가하지 마세요.
`;
fs.mkdirSync('docs/research',{recursive:true});fs.writeFileSync('docs/research/sweeteners-2026.md',text,'utf8');
console.log(`${survey.products.length}종 / ${families.size}개 제품군 조사 보고서 생성: docs/research/sweeteners-2026.md`);console.log(Object.fromEntries(rank));
