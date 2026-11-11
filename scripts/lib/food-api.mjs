// Field names checked against the official portal's embedded Swagger specification.
export const ENDPOINT='https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo03/getFoodNtrCpntDbInq03';
export const SOURCE_URL='https://www.data.go.kr/data/15127578/openapi.do';
export async function httpError(response){
 const messages={SERVICE_KEY_IS_NOT_REGISTERED_ERROR:'등록되지 않은 인증키입니다. 현재 발급된 키를 다시 입력하세요.',SERVICE_ACCESS_DENIED_ERROR:'이 API의 활용 권한이 없습니다. 활용신청 승인 상태를 확인하세요.',PERMISSION_DENIED:'이 API의 활용 권한이 없습니다. 활용신청 승인 상태를 확인하세요.',DEADLINE_HAS_EXPIRED_ERROR:'인증키 사용 기간이 만료됐습니다.',SERVICE_KEY_IS_NULL:'요청 인증키를 확인할 수 없습니다.'};
 let body='';try{body=await response.text()}catch{}
 const code=Object.keys(messages).find(code=>new RegExp(`(?:^|[^A-Z_])${code}(?:$|[^A-Z_])`).test(body));
 return new Error(code?`API HTTP ${response.status}: ${messages[code]}`:[401,403].includes(response.status)?`API HTTP ${response.status}: 인증 요청이 거절됐습니다. 이 API의 활용신청 승인 상태와 현재 발급된 키를 확인하세요.`:`API HTTP 오류 (${response.status}).`);
}
export const NUTRIENTS={kcal:'AMT_NUM1',protein:'AMT_NUM3',fat:'AMT_NUM4',carbs:'AMT_NUM6',sugar:'AMT_NUM7',sodium:'AMT_NUM13'};
export const FIELDS=['FOOD_CD','FOOD_NM_KR','MAKER_NM','DB_CLASS_NM','Z10500','SERVING_SIZE','ITEM_REPORT_NO','SUB_REF_NAME','RESEARCH_YMD','UPDATE_DATE',...Object.values(NUTRIENTS)];
export const normalize=s=>String(s??'').normalize('NFKC').replace(/\s/g,'').toLowerCase();
export function quantity(raw){const match=String(raw??'').normalize('NFKC').trim().match(/^(\d+(?:\.\d+)?)\s*(ml|mL|㎖|g|kg|L|l)$/);if(!match)return null;let amount=Number(match[1]),unit=match[2].toLowerCase();if(!Number.isFinite(amount)||amount<=0)return null;if(unit==='l'){unit='ml';amount*=1000}if(unit==='kg'){unit='g';amount*=1000}return {amount,unit};}
export function number(raw){if(typeof raw==='number')return Number.isFinite(raw)&&raw>=0?raw:null;if(typeof raw!=='string')return null;const s=raw.trim();return /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s)?Number(s.replaceAll(',','')):null;}
export function date(raw){const s=String(raw??'').trim();const m=s.match(/^(\d{4})[-.]?(\d{2})[-.]?(\d{2})$/);if(!m)return null;const v=`${m[1]}-${m[2]}-${m[3]}`;const d=new Date(v);return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v?v:null;}
export function snapshot(row){return Object.fromEntries(FIELDS.map(k=>[k,typeof row[k]==='string'||typeof row[k]==='number'?String(row[k]):null]));}
export function classify(row,target){const reasons=[];const volume=quantity(row.Z10500),basis=quantity(row.SERVING_SIZE);
 if(!target.productId)reasons.push('기존 제품 id 연결 필요');
 if(!target.name||normalize(row.FOOD_NM_KR)!==normalize(target.name))reasons.push('제품명 불일치');
 if(!target.manufacturer||normalize(row.MAKER_NM)!==normalize(target.manufacturer))reasons.push('제조사 불일치 또는 미확인');
 if(!volume||volume.unit!=='ml'||volume.amount!==target.volumeMl)reasons.push('제품 용량(ml) 불일치 또는 미확인');
 if(row.DB_CLASS_NM!=='상용제품')reasons.push('상용제품 여부 미확인');
 if(!row.FOOD_CD)reasons.push('식품코드 없음');
 if(!basis)reasons.push('영양성분 기준량 미확인');
 if(!date(row.UPDATE_DATE)&&!date(row.RESEARCH_YMD))reasons.push('자료 기준일 미확인');
 if(!Object.values(NUTRIENTS).some(field=>number(row[field])!==null))reasons.push('확인된 영양 수치 없음');
 return {status:reasons.length?'pending':'candidate',reasons};
}
export function buildURL(key,name,pageNo=1,numOfRows=100){if(!key)throw new Error('FOOD_API_KEY가 설정되지 않았습니다.');let decoded=key.trim();try{decoded=decodeURIComponent(decoded)}catch{throw new Error('인증키 인코딩을 확인하세요.')}const url=new URL(ENDPOINT);url.search=new URLSearchParams({serviceKey:decoded,FOOD_NM_KR:name,pageNo:String(pageNo),numOfRows:String(numOfRows),type:'json'});return url;}
export function parseResponse(data){const root=data?.response??data;const code=String(root?.header?.resultCode??'');if(code==='03')return {items:[],total:0};if(!['00','0'].includes(code))throw new Error('API가 요청을 거절했습니다. 인증·활용신청·호출 한도를 확인하세요.');const body=root?.body;if(!body)throw new Error('API 응답 body가 없습니다.');const total=Number(body.totalCount);if(!Number.isSafeInteger(total)||total<0)throw new Error('API 전체 결과 수가 올바르지 않습니다.');let items=body.items?.item??body.items;if(items==null||items==='')items=[];else if(!Array.isArray(items))items=[items];if(items.some(x=>!x||typeof x!=='object'||Array.isArray(x)))throw new Error('API 항목 형식이 올바르지 않습니다.');return {items,total};}
export async function collect({key,name,fetchImpl=fetch,maxPages=100}){const rows=[];let expected;
 for(let page=1;page<=maxPages;page++){let response;try{response=await fetchImpl(buildURL(key,name,page),{signal:AbortSignal.timeout(20000),redirect:'error'})}catch{throw new Error('API 연결 실패 또는 시간 초과입니다. 네트워크를 확인하세요.');}if(!response.ok)throw new Error(`API HTTP 오류 (${response.status}).`);let data;try{data=await response.json()}catch{throw new Error('API가 JSON 대신 오류 응답을 반환했습니다. 인증과 활용신청을 확인하세요.');}const {items,total}=parseResponse(data);if(expected!==undefined&&expected!==total)throw new Error('수집 중 결과 수가 바뀌었습니다. 다시 실행하세요.');expected=total;rows.push(...items);if(rows.length>=total){if(rows.length!==total)throw new Error('API 결과 수가 일치하지 않습니다.');return rows.map(snapshot)}if(!items.length)throw new Error('페이지 일부가 누락돼 저장하지 않았습니다.');}
 throw new Error('페이지 한도를 초과해 수집을 중단했습니다. 검색어를 좁혀 주세요.');
}
export function verifiedRecord(row,target,checked){const result=classify(row,target);if(result.status!=='candidate')throw new Error('이름·제조사·용량·기준량·출처 검증을 통과하지 못한 항목입니다.');return {productId:target.productId,foodCode:row.FOOD_CD,name:row.FOOD_NM_KR,manufacturer:row.MAKER_NM,volumeMl:quantity(row.Z10500).amount,itemReportNo:row.ITEM_REPORT_NO||null,basis:{...quantity(row.SERVING_SIZE),raw:row.SERVING_SIZE},nutrients:Object.fromEntries(Object.entries(NUTRIENTS).map(([key,field])=>[key,number(row[field])])),source:{provider:'식품의약품안전처',title:'식품영양성분DB정보',url:SOURCE_URL,origin:row.SUB_REF_NAME||null,created:date(row.RESEARCH_YMD),updated:date(row.UPDATE_DATE),checked,scope:'API의 해당 식품코드·제품 용량 기준. 현재 유통 제품의 배합 일치는 별도 확인 필요.'},separateVerification:{ingredients:null,sweeteners:null,caffeine:null,allergens:null}};}
