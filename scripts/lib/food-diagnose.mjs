import {buildURL,httpError,parseResponse} from './food-api.mjs';
export async function diagnose({key,fetchImpl=fetch}){
 if(!key)throw new Error('FOOD_API_KEY가 설정되지 않았습니다.');
 let decoded=key.trim();try{decoded=decodeURIComponent(decoded)}catch{}
 const lines=['키 로드: 확인됨',`키 길이 (디코딩 후): ${decoded.length}자`,`키에 줄바꿈·비ASCII 문자: ${/[^\x21-\x7E]/.test(decoded)?'있음 — 복사 내용을 확인하세요':'없음'}`,`키 앞뒤 공백: ${key!==key.trim()?'있음 (요청 시 제거)':'없음'}`,`키에 따옴표 포함: ${/["']/.test(key)?'있음 — 키만 다시 입력하세요':'없음'}`];
 // Compare the successful portal's XML format with JSON using the same local key.
 for(const probe of [{label:'최소 요청 XML',format:'xml',named:false},{label:'최소 요청 JSON',format:'json',named:false},{label:'제품명 검색 JSON',format:'json',named:true}]){
  const url=buildURL(key,'코카콜라 제로',1,1);if(!probe.named)url.searchParams.delete('FOOD_NM_KR');url.searchParams.set('type',probe.format);
  const label=probe.label;
  try{const response=await fetchImpl(url,{signal:AbortSignal.timeout(20000),redirect:'error'});lines.push(`${label}: HTTP ${response.status}`);
   if(!response.ok){lines.push((await httpError(response)).message);continue;}
   if(probe.format==='xml'){const body=await response.text();lines.push(/<resultCode>\s*(?:00|0|03)\s*<\/resultCode>/.test(body)?'인증·XML 응답: 정상':'HTTP 연결은 성공했지만 XML 결과 코드 확인이 필요합니다.');continue;}
   let data;try{data=await response.json()}catch{lines.push('응답 형식: JSON 아님. 원문은 키 보호를 위해 출력하지 않습니다.');continue;}
   try{parseResponse(data);lines.push('인증·JSON 응답: 정상')}catch{lines.push('HTTP 연결은 성공했지만 API 결과 코드 또는 응답 구조 확인이 필요합니다.');}
  }catch{lines.push(`${label}: 요청 실패. 네트워크·인증키 입력 형식을 확인하세요.`);}
 }
 return lines;
}
