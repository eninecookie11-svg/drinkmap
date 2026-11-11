import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collect,classify,verifiedRecord} from './lib/food-api.mjs';
import {validateDrinks} from '../public/nutrition.js';
import {diagnose} from './lib/food-diagnose.mjs';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const json=async file=>JSON.parse((await fs.readFile(file,'utf8')).replace(/^\uFEFF/,''));
async function write(file,value,key){const body=JSON.stringify(value,null,2)+'\n';if(key){let decoded=key;try{decoded=decodeURIComponent(key)}catch{}if([key,decoded,encodeURIComponent(decoded)].some(secret=>secret&&body.includes(secret)))throw new Error('응답에 인증값이 포함돼 저장을 중단했습니다.');}await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file+'.tmp',body,'utf8');await fs.rename(file+'.tmp',file);}
function args(argv){const result={};for(let i=0;i<argv.length;i++){const k=argv[i];if(['--confirm','--help'].includes(k))result[k]=true;else if(['--name','--manufacturer','--volume','--product-id','--food-code'].includes(k)&&argv[i+1]&&!argv[i+1].startsWith('--')){result[k]=argv[++i]}else throw new Error('지원하지 않거나 값이 빠진 옵션입니다. --help를 확인하세요.');}return result;}
export async function main(argv=process.argv.slice(2),{root=ROOT,fetchImpl=fetch,key=process.env.FOOD_API_KEY}={}){
 const REPORT=path.join(root,'.local/food-api/report.json'),PUBLIC=path.join(root,'public/data/drinks.json');
 const command=argv[0];const a=args(argv.slice(1));if(a['--help']||!command){console.log('조회: npm run food:collect -- --name "제품명" [--product-id coke] [--manufacturer "정확한 업체명"] [--volume 355]\n검토 후 등록: npm run food:publish -- --food-code "식품코드" --confirm\n인증키는 FOOD_API_KEY 환경변수만 사용합니다. 후보: .local/food-api/report.json');return;}
 if(command==='diagnose'){console.log((await diagnose({key,fetchImpl})).join('\n'));return;}
 const products=await json(path.join(root,'public/data/products.json'));
 if(command==='collect'){
  const name=a['--name']?.trim();if(!name)throw new Error('--name 제품명을 입력하세요.');if(!key)throw new Error('FOOD_API_KEY가 설정되지 않았습니다. 로컬 환경변수에 설정하세요.');
  const product=a['--product-id']?products.find(p=>p.id===a['--product-id']):null;if(a['--product-id']&&!product)throw new Error('products.json에 없는 제품 id입니다.');
  const volumeMl=a['--volume']?Number(a['--volume']):product?.volume??null;if(volumeMl!==null&&(!Number.isFinite(volumeMl)||volumeMl<=0))throw new Error('용량은 양수 ml로 입력하세요.');if(product&&product.volume!==volumeMl)throw new Error('기존 제품의 용량과 요청 용량이 다릅니다.');
  const target={productId:product?.id??null,name,manufacturer:a['--manufacturer']?.trim()||product?.brand||null,volumeMl};
  const rows=await collect({key,name,fetchImpl});const checked=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
  const report={schemaVersion:1,checked,target,complete:true,results:rows.map(row=>({row,...classify(row,target)}))};await write(REPORT,report,key);
  const count=report.results.filter(r=>r.status==='candidate').length;console.log(`수집 ${rows.length}건 · 등록 후보 ${count}건 · 확인 대기 ${rows.length-count}건\n.local/food-api/report.json에서 식품코드·기준량·날짜를 검토하세요. 공개 파일은 변경하지 않았습니다.`);return;
 }
 if(command==='publish'){
  if(!a['--confirm']||!a['--food-code'])throw new Error('후보를 직접 검토한 뒤 --food-code와 --confirm을 지정하세요.');
  const report=await json(REPORT);if(report.schemaVersion!==1||report.complete!==true||!Array.isArray(report.results))throw new Error('완료된 수집 보고서가 아닙니다.');
  const product=products.find(p=>p.id===report.target?.productId);if(!product||product.volume!==report.target.volumeMl)throw new Error('제품 id 또는 용량이 변경됐습니다. 다시 수집하세요.');
  const found=report.results.filter(r=>r.row?.FOOD_CD===a['--food-code']);if(found.length!==1)throw new Error('식품코드가 없거나 중복입니다. 다시 확인하세요.');
  const record=verifiedRecord(found[0].row,report.target,report.checked);const data=await json(PUBLIC);validateDrinks(data,products);data.drinks=data.drinks.filter(r=>r.productId!==record.productId);data.drinks.push(record);data.drinks.sort((a,b)=>a.productId.localeCompare(b.productId));validateDrinks(data,products);await write(PUBLIC,data,key);
  console.log('검토한 영양정보를 public/data/drinks.json에 저장했습니다. npm test와 npm run build로 확인하세요.');return;
 }
 throw new Error('collect 또는 publish 명령을 사용하세요.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){main().catch(error=>{const known=error?.message;const safe=typeof known==='string'&&!/https?:|serviceKey|ENOENT|ENOTFOUND|[\\/]/.test(known);console.error(safe?known:'수집 또는 저장 실패입니다. 파일 경로·네트워크·권한을 확인하세요. 인증키와 원본 오류는 출력하지 않습니다.');process.exitCode=1;});}
