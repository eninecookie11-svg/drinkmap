import fs from 'node:fs';
import path from 'node:path';
export function checkPublicSafety(root='public'){
 let key=process.env.FOOD_API_KEY||'';try{key=decodeURIComponent(key)}catch{}
 const secrets=[process.env.FOOD_API_KEY,key,key?encodeURIComponent(key):''].filter(Boolean);
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isSymbolicLink())throw new Error('공개 폴더에는 심볼릭 링크를 넣지 마세요.');if(/^(?:\.env(?:\..*)?|\.dev\.vars(?:\..*)?)$|\.(?:key|pem)$/i.test(entry.name))throw new Error('공개 폴더에 비밀 설정 파일이 있습니다.');if(entry.isDirectory()){walk(file);continue}const text=fs.readFileSync(file).toString('utf8');if(secrets.some(secret=>text.includes(secret))||/serviceKey\s*(?:[=:]|%3[dD])/i.test(text))throw new Error('공개 파일에서 인증키 또는 인증 쿼리를 발견해 빌드를 중단했습니다.');}}
 walk(root);
}
