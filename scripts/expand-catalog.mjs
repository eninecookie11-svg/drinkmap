// One-off reviewed catalog expansion. Existing records are preserved byte-for-value.
import fs from 'node:fs';
const file='public/data/products.json';
const products=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const day='2026-11-11';
const source=(title,url,scope,evidenceType='product-reference')=>({title,url,published:'미확인',checked:day,scope,evidenceType});
const pending='제품명·대표 용량 참고 자료. 영양성분·전체 원재료·감미료·카페인 함량·알레르기·현재 배합은 확인 전까지 미확인. 다른 맛·용량의 수치를 옮기지 않음.';
const rows=[
 ['welchs-shine','웰치스 제로 샤인머스캣','농심','과일 탄산',355,'샤인머스캣','#86a745','농심 공식 제품 목록','https://brand.nongshim.com/welchs/product/list'],
 ['fanta-grape','환타 제로 포도','코카-콜라음료','과일 탄산',350,'포도','#74539b','GS SHOP · 환타 제로 3종 표시 이미지','https://www.gsshop.com/prd/prd.gs?prdid=1058874735'],
 ['tams-pineapple','탐스제로 파인애플','롯데칠성음료','과일 탄산',355,'파인애플','#c7a53c','동원몰 · 탐스제로 파인애플 355ml','https://www.dongwonmall.com/product/detail.do?productId=003645658'],
 ['pepsi-mojito','펩시 제로슈거 모히토','롯데칠성음료','콜라',355,'모히토','#327f72','뉴스핌 · 펩시코 모히토향 출시 안내','https://www.newspim.com/news/view/20250331000107'],
 ['pepsi-pineapple','펩시 제로슈거 파인애플','롯데칠성음료','콜라',355,'파인애플','#9a963a','동원몰 · 펩시 제로슈거 파인애플 355ml','https://www.dongwonmall.com/product/detail.do?productId=003674038'],
 ['chilsung-lime','칠성사이다 제로 라임','롯데칠성음료','사이다',355,'라임','#54846a','칠성몰 · 칠성사이다 제로 라임 355ml','https://mall.lottechilsung.co.kr/product-detail?productNo=132029303'],
 ['tams-apple','탐스제로 사과','롯데칠성음료','과일 탄산',355,'사과','#699853','롯데ON · 탐스제로 사과 355ml','https://www.lotteon.com/p/product/LE1221943760'],
 ['narangd-apple','나랑드사이다 제로 그린애플','동아오츠카','사이다',245,'그린애플','#7c9b44','GS SHOP · 나랑드사이다 245ml 3종 표시','https://m.gsshop.com/prd/prd.gs?prdid=1054612243'],
 ['narangd-pineapple','나랑드사이다 제로 파인애플','동아오츠카','사이다',245,'파인애플','#bb9a43','GS SHOP · 나랑드사이다 245ml 3종 표시','https://m.gsshop.com/prd/prd.gs?prdid=1054612243'],
 ['lipton-peach','립톤 아이스티 복숭아 제로','롯데칠성음료','차음료',500,'복숭아','#bd795b','SSG.COM · 립톤 제로 아이스티 복숭아 500ml','https://m.ssg.com/item/itemView.ssg?itemId=0000008060350'],
 ['two-percent-peach','2% 부족할 때 복숭아 제로','롯데칠성음료','혼합음료',500,'복숭아','#b4828e','이마트몰 · 이프로 복숭아 제로 500ml','https://emart.ssg.com/item/itemView.ssg?itemId=1000738535896'],
 ['toreta-zero','토레타! 제로','코카-콜라음료','수분보충음료',500,'과채','#589178','GS SHOP · 토레타 제로 500ml 표시','https://www.gsshop.com/prd/prd.gs?prdid=1051966763'],
 ['powerade-zero','파워에이드 제로','코카-콜라음료','스포츠음료',600,'기본','#527ca4','쿠팡 · 파워에이드 제로 2종 600ml 구성','https://www.coupang.com/vp/products/8880002250'],
 ['powerade-lime','파워에이드 제로 라임향','코카-콜라음료','스포츠음료',600,'라임','#759c51','코카콜라 공식 스토어 · 파워에이드 제로 라임향 600PET','https://cokeplay.cocacola.co.kr/store/main?brandMap=powerade'],
 ['monster-zero','몬스터 에너지 제로 슈거','코카-콜라음료','에너지음료',355,'오리지널','#405d42','몬스터 공식 · 에너지 제로 슈거','https://www.monsterenergy.com/ko-kr/energy-drinks/monster-energy/몬스터-에너지-제로-슈거/'],
 ['monster-ultra','몬스터 에너지 울트라','코카-콜라음료','에너지음료',355,'시트러스','#818a83','몬스터 공식 · 에너지 울트라','https://www.monsterenergy.com/ko-kr/energy-drinks/monster-ultra/몬스터-에너지-울트라/'],
 ['monster-peach','몬스터 울트라 피치 킨','코카-콜라음료','에너지음료',355,'복숭아','#b97b85','몬스터 공식 · 울트라 피치 킨','https://www.monsterenergy.com/ko-kr/energy-drinks/monster-ultra/monster-energy-peachy-keen/']
];
for(const [id,name,brand,type,volume,flavor,color,title,url] of rows){
 if(products.some(p=>p.id===id))throw new Error(`이미 추가됨: ${id}`);
 products.push({id,name,brand,type,volume,flavor,color,kcal:null,caffeine:null,caffeineStatus:'미확인',sugar:null,sweeteners:[],ingredients:null,allergens:null,carbs:null,sodium:null,status:'현재 판매·배합 확인 필요',image:`assets/${id}.svg`,imageType:'임시 구분용 일러스트 · 실제 제품 이미지 아님',historicalPrice:null,source:source(title,url,pending)});
}
const get=id=>products.find(p=>p.id===id);
function label(id,values,scope){const p=get(id);Object.assign(p,values,{nutritionBasis:{amount:p.volume,unit:'ml'}});p.source.evidenceType='retailer-label';p.source.scope=scope+' 판매 페이지 게시일·제조일·현재 배송 제품과의 일치는 미확인. 카페인·알레르기는 별도 표시가 없으면 미확인. 표시되지 않은 값은 추정하지 않음.';}
for(const [id,sodium,amount,ingredients] of [
 ['narangd-apple',50,.51,'정제수, 탄산가스, 액상알룰로오스, 향료, 사과산, 난소화성 말토덱스트린, 사과농축과즙, 구연산, 구연산삼나트륨, 정제소금, 염화칼륨, 젖산칼슘, 감미료(아세설팜칼륨, 수크랄로스)'],
 ['narangd-pineapple',60,1,'정제수, 탄산가스, 액상알룰로오스, 파인애플농축과즙, 구연산, 사과산, 구연산삼나트륨, 정제소금, 난소화성말토덱스트린, 향료, 감미료(아세설팜칼륨, 수크랄로스)']
])label(id,{kcal:0,sodium,carbs:1,sugar:'0g',protein:0,fat:0,ingredients,sweeteners:[['알룰로스',amount,'g'],['아세설팜칼륨',null,'mg'],['수크랄로스',null,'mg']]},`해당 맛 245ml 한 캔의 개별 표시 영양정보·원재료명 참고. 알룰로오스 표기는 알룰로스로 정규화.`);
label('lipton-peach',{ingredients:'정제수, 홍차추출분말(아일랜드산), DL-사과산, 구연산, 향료(복숭아향), 구연산삼나트륨, 복숭아과즙분말(아일랜드산), 비타민C, 아세설팜칼륨(감미료), 수크랄로스(감미료), 스테비올배당체(감미료)',sweeteners:[['아세설팜칼륨',null,'mg'],['수크랄로스',null,'mg'],['스테비올배당체',null,'mg']],allergens:['복숭아','밀']},'국내 롯데칠성 제조 립톤 복숭아 제로 500ml 상품의 원재료·알레르기 표시만 적용. 해외 수입 립톤 및 355ml 자료와 혼합하지 않음. 영양성분·카페인 함량 미확인.');
label('tams-pineapple',{ingredients:'정제수, 액상알룰로스, 이산화탄소, 구연산, 혼합제제(글리세린, 정제수, 아라비아검, D-소비톨, 가공유지, 자당에스테르, 주정), 혼합제제(유화제, 합성향료, 라임오일), 혼합제제(유화제, 합성향료, 정제수, 오렌지오일), 구연산삼나트륨, 수크랄로스(감미료), 아세설팜칼륨(감미료), 효소초리루틴, 파인애플청징농축액, 식용색소황색제4호(착색료), 식용색소황색제5호(착색)',sweeteners:[['알룰로스',null,'g'],['소비톨',null,'g'],['수크랄로스',null,'mg'],['아세설팜칼륨',null,'mg']]},'탐스제로 파인애플 355ml 고시 원재료명 참고. 원문의 효소초리루틴 등 표기를 유지. 영양성분은 Y로만 표시되어 수치 미확인. 사과키위·오렌지 자료를 적용하지 않음.');
label('toreta-zero',{kcal:4,sugar:'0g',carbs:1,sodium:271,protein:0,fat:0,ingredients:'정제수, 혼합과채즙청징농축액 0.52%[정제수 50%, 야채착즙액 10%(국산/정제수50%, 당근20%, 양배추15%, 케일 15%), 청포도과즙농축액6.9%(미국산), 사과과즙농축액6.8%(중국산), 배과즙농축액6.8%(중국산), 자몽과즙농축액6.4%(미국산), 감귤과즙농축액6.3%(국산), 망고퓨레농축액5.7%(인도산), 레몬과즙농축액1.1%(아르헨티나산)], 구연산, 소금(오스트리아산), 구연산삼나트륨, 합성향료, 향료, 향료제제(향료, 식염, 젖산, 구연산), 사과산, 아세설팜칼륨(감미료), 염화칼륨, 비타민C, 수크랄로스(감미료), 프로필렌글리콜',sweeteners:[['아세설팜칼륨',null,'mg'],['수크랄로스',null,'mg']]},'GS SHOP 상품 상세의 토레타 제로 500ml 한 병 표시값 4kcal·나트륨271mg 등과 원재료 기준. 제로라는 제품명만으로 0kcal로 바꾸지 않음.');
get('fanta-grape').source.scope='맛별 표시 이미지에 350ml가 있으나 상품 옵션에는 355ml로 혼재. 대표 용량은 이미지의 350ml 참고이며 실제 배송 용량·배합을 보증하지 않음. 영양성분·원재료는 혼동 방지를 위해 적용 보류.';
get('tams-apple').source.scope='판매 상품명은 사과 355ml. 다른 자료의 사과키위향과 동일 배합인지 미확인하므로 사과키위의 성분을 적용하지 않음. '+pending;
for(const id of ['monster-zero','monster-ultra','monster-peach'])get(id).source.scope='공식 한국 페이지에서 제로슈거 제품 존재 확인. 공식 페이지의 카페인은 16 fl oz 기준이라고 표시되어 국내 355ml에 적용하지 않음. 열량·당류도 기준량 명확성 확인 전까지 보류. 355ml 구성은 국내 판매 목록 참고. 제로슈거가 0kcal를 뜻하지 않음. '+pending;
const order=['pepsi','coke','chilsung','narangd','sprite','milkis','drpepper','welchs','welchs-shine','fanta','fanta-grape','tams','tams-pineapple','mccol','galbae','pepsi-free','pepsi-mojito','pepsi-pineapple','chilsung-lime','tams-apple','narangd-apple','narangd-pineapple','lipton-peach','two-percent-peach','toreta-zero','powerade-zero','powerade-lime','monster-zero','monster-ultra','monster-peach'];
const old=products.filter(p=>!order.includes(p.id));
fs.writeFileSync(file,JSON.stringify([...order.map(get),...old],null,2)+'\n');
// Original simple vectors: no official photographs, logos, or copied packaging.
for(const [id,name,,type,volume,flavor,color] of rows){const bottle=volume>=500;const title=name.startsWith('몬스터')?'몬스터':name.split(' ')[0];fs.writeFileSync(`public/assets/${id}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="280" height="400" viewBox="0 0 280 400"><title>${name} 구분용 일러스트</title><ellipse cx="140" cy="374" rx="65" ry="9" fill="#222b1f" opacity=".1"/><rect x="${bottle?87:69}" y="${bottle?54:33}" width="${bottle?106:142}" height="${bottle?306:326}" rx="${bottle?34:23}" fill="${color}"/><rect x="${bottle?107:78}" y="${bottle?28:29}" width="${bottle?66:124}" height="${bottle?37:15}" rx="7" fill="#bfc7bc"/><path d="M90 90v230" stroke="#ffffff" opacity=".15" stroke-width="12"/><text x="140" y="180" text-anchor="middle" fill="white" font-family="sans-serif" font-size="20" font-weight="700">${title}</text><text x="140" y="217" text-anchor="middle" fill="white" font-family="sans-serif" font-size="26" font-weight="700">ZERO</text><text x="140" y="251" text-anchor="middle" fill="white" font-family="sans-serif" font-size="15">${flavor}</text><text x="140" y="300" text-anchor="middle" fill="white" font-family="sans-serif" font-size="12">${volume} ml · ILLUSTRATION</text></svg>\n`);}
console.log(`목록 ${order.length}종 + 기존 유지 ${old.length}종 = ${products.length}종`);
