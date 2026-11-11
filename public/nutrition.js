const nutrientKeys=['kcal','protein','fat','carbs','sugar','sodium'];
const exact=(object,keys)=>object&&typeof object==='object'&&!Array.isArray(object)&&Object.keys(object).length===keys.length&&keys.every(k=>Object.hasOwn(object,k));
const text=v=>typeof v==='string'&&v.trim().length>0;
const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
export function validateDrinks(data,products){
 const fail=()=>{throw new Error('공식 영양 데이터 형식·출처·제품 연결 확인 필요');};
 if(!exact(data,['schemaVersion','drinks'])||data.schemaVersion!==1||!Array.isArray(data.drinks))fail();
 const ids=new Set();for(const r of data.drinks){const p=products.find(p=>p.id===r.productId);
 if(!exact(r,['productId','foodCode','name','manufacturer','volumeMl','itemReportNo','basis','nutrients','source','separateVerification'])||!p||ids.has(r.productId)||r.volumeMl!==p.volume||!text(r.foodCode)||!text(r.name)||!text(r.manufacturer)||(r.itemReportNo!==null&&!text(r.itemReportNo)))fail();ids.add(r.productId);
 if(!exact(r.basis,['amount','unit','raw'])||!Number.isFinite(r.basis.amount)||r.basis.amount<=0||!['ml','g'].includes(r.basis.unit)||!text(r.basis.raw))fail();
 const basisMatch=r.basis.raw.normalize('NFKC').trim().match(/^(\d+(?:\.\d+)?)\s*(ml|mL|g|kg|L|l)$/);if(!basisMatch)fail();const unit=basisMatch[2].toLowerCase(),amount=Number(basisMatch[1])*(['l','kg'].includes(unit)?1000:1);if(r.basis.amount!==amount||r.basis.unit!==(['ml','l'].includes(unit)?'ml':'g'))fail();
 if(!exact(r.nutrients,nutrientKeys)||!nutrientKeys.every(k=>r.nutrients[k]===null||(typeof r.nutrients[k]==='number'&&Number.isFinite(r.nutrients[k])&&r.nutrients[k]>=0))||!nutrientKeys.some(k=>r.nutrients[k]!==null))fail();
 const s=r.source;if(!exact(s,['provider','title','url','origin','created','updated','checked','scope'])||s.provider!=='식품의약품안전처'||s.title!=='식품영양성분DB정보'||s.url!=='https://www.data.go.kr/data/15127578/openapi.do'||!text(s.scope)||!validDate(s.checked)||![s.created,s.updated].every(v=>v===null||validDate(v))||(!s.created&&!s.updated)||(s.origin!==null&&!text(s.origin)))fail();
 if(!exact(r.separateVerification,['ingredients','sweeteners','caffeine','allergens']))fail();
 for(const [key,v] of Object.entries(r.separateVerification)){if(v===null)continue;if(!exact(v,['value','volumeMl','source'])||v.volumeMl!==r.volumeMl||!exact(v.source,['title','url','checked','scope'])||!text(v.source.title)||!text(v.source.scope)||!validDate(v.source.checked)||!/^https:\/\/[^\s?#]+(?:\?[^\s#]*)?$/.test(v.source.url))fail();
 if(key==='ingredients'&&!text(v.value))fail();
 if(key==='caffeine'&&(typeof v.value!=='number'||!Number.isFinite(v.value)||v.value<0))fail();
 if(key==='allergens'&&(!Array.isArray(v.value)||!v.value.every(text)))fail();
 if(key==='sweeteners'&&(!Array.isArray(v.value)||!v.value.every(x=>Array.isArray(x)&&x.length===3&&text(x[0])&&(x[1]===null||(typeof x[1]==='number'&&Number.isFinite(x[1])&&x[1]>=0))&&['g','mg',''].includes(x[2]))))fail();
 }
 }return data;
}
export function applyDrinks(products,data){validateDrinks(data,products);const byId=new Map(data.drinks.map(r=>[r.productId,r]));return products.map(p=>{const r=byId.get(p.id);if(!r)return p;const v=r.separateVerification;return {...p,kcal:null,carbs:null,sodium:null,sugar:null,caffeine:v.caffeine?.value??null,caffeineSource:null,caffeineStatus:v.caffeine?'별도 확인':'미확인',ingredients:v.ingredients?.value??null,sweeteners:v.sweeteners?.value??[],allergens:v.allergens?.value??null,officialNutrition:r,source:{title:r.source.title,url:r.source.url,published:r.source.updated||r.source.created,checked:r.source.checked,scope:r.source.scope}};});}
export const nutritionBasis=p=>p.officialNutrition?`${p.officialNutrition.basis.amount}${p.officialNutrition.basis.unit} 기준`:p.nutritionBasis?`${p.nutritionBasis.amount}${p.nutritionBasis.unit} 한 캔 기준`:'한 캔 기준';
export const nutrient=(p,key)=>p.officialNutrition?p.officialNutrition.nutrients[key]:p[key];
