# 식약처 영양성분 API 수집·검토·등록

일반 방문자는 정적 JSON만 읽습니다. API는 내 PC에서 수집할 때만 호출합니다.
로그인·유료 서버·실시간 브라우저 API 요청은 없습니다.

## 파일 구분

- `public/data/products.json`: 제품 id·제품명·브랜드·용량·이미지와 기존 조사 자료. 기존 15종과 디자인은 유지합니다.
- `public/data/drinks.json`: 검토를 마친 식약처 영양정보 스냅샷. 처음에는 빈 목록입니다. 실제 API 결과가 검증되기 전 가짜 수치를 넣지 않습니다.
- `.local/food-api/report.json`: 로컬 전용 수집 보고서. Git과 빌드에서 제외합니다. 이 보고서를 public에 복사하지 마세요.
- `scripts/collect-food.mjs`: 조회·검토 후 등록 명령.
- `public/nutrition.js`: 검증된 JSON을 기존 제품에 연결하고, 다른 시점의 성분 혼합을 막습니다.

새 제품은 먼저 products.json에 고유 id와 확인한 기본정보를 추가하세요. 기존 id는 바꾸지 마세요.

## 1. 인증키 준비

[공식 활용신청 페이지](https://www.data.go.kr/data/15127578/openapi.do)에서 해당 API 활용신청과 승인을 확인하세요.
키는 **로컬 환경변수 `FOOD_API_KEY`**에만 설정합니다. 채팅·소스·JSON·명령 인수·스크린샷·GitHub에 붙여 넣지 마세요.
PowerShell에서는 다음처럼 화면과 명령 기록에 키를 남기지 않고 현재 창에만 설정할 수 있습니다.

```powershell
$foodSecureKey = Read-Host '공공데이터포털 인증키' -AsSecureString
$foodCredential = [System.Management.Automation.PSCredential]::new('food-api', $foodSecureKey)
$env:FOOD_API_KEY = $foodCredential.GetNetworkCredential().Password
```

일반 인증키와 URL 인코딩 인증키를 모두 받습니다. URL은 스크립트에서 한 번만 인코딩합니다.
`.env`는 자동으로 읽지 않습니다. Cloudflare에 키를 설정할 필요가 없습니다.

## 2. 제품명 조회

```powershell
npm.cmd run food:collect -- --name "코카콜라 제로"
```

이 명령은 이름으로 조회만 합니다. 제조사·용량·연결 제품을 검증할 수 없으므로 확인 대기로 남습니다.
등록 후보까지 분류하려면 정확한 기대값을 지정하세요.

```powershell
npm.cmd run food:collect -- --name "코카콜라 제로" --product-id coke --manufacturer "코카-콜라음료" --volume 355
```

이 예시는 검색 방법이며 실제 API의 제품명·제조사·결과 존재를 보증하지 않습니다.
실제 공식 이름과 업체명이 다르면 보고서를 읽고 포장·공식 자료와 대조한 뒤 올바른 기대값으로 다시 조회하세요.
제조사를 생략하면 products.json의 brand, 용량을 생략하면 volume을 기대값으로 사용합니다.

후보 조건은 다음과 같습니다.

1. 식품명과 업체명이 기대값과 정확히 일치. 대소문자·공백·유니코드 표기만 정규화하며 브랜드·제조사 별칭, 맛, 무카페인 여부를 추측하지 않습니다.
2. `Z10500`에 명시된 **ml 용량**과 제품의 한 캔 용량이 일치. `355g`, 단위 없는 `355`, 묶음·범위 표시는 확인 대기입니다. 영양 기준량·1회 섭취참고량을 포장 용량으로 사용하지 않습니다.
3. `DB_CLASS_NM`이 `상용제품`, 식품코드·영양 기준량·자료 날짜가 존재하고 하나 이상의 영양 수치가 확인됨.
4. 연결할 기존 제품 id가 있고 그 제품 용량도 일치.

API 검색이 부분 검색이어도 후보 판정은 부분 일치를 사용하지 않습니다.
모든 페이지 수집이 성공해야 보고서를 저장합니다. 오류·누락·한도 초과 시 공개 데이터는 바꾸지 않습니다.
동일 이름의 결과가 여러 개면 식품코드·품목제조보고번호·생성/수정일·기준량을 직접 대조하세요.
같은 식품코드가 중복된 결과는 등록할 수 없습니다.

## 3. 검토 후 공개 데이터에 등록

보고서의 후보와 실제 제품을 검토한 뒤, 해당 식품코드 하나만 지정합니다.

```powershell
npm.cmd run food:publish -- --food-code "보고서에서 확인한 식품코드" --confirm
npm.cmd test
npm.cmd run build
```

`--confirm`은 **제품 식별·기준량·자료 적용 범위를 직접 확인했다는 뜻**입니다. 확인 대기 행은 이 옵션으로도 강제 등록할 수 없습니다.
기존 같은 productId의 API 스냅샷은 교체합니다. 다른 제품은 유지하며 수집 오류 때 이전 파일은 그대로 둡니다.
새 스냅샷을 등록하면 이전 별도 검증값을 자동으로 이월하지 않습니다.
이미 ml 용량을 확인할 수 없는 자료라면 포장 근거를 확보하기 전까지 등록하지 마세요.

## 기준량과 미확인 처리

- `SERVING_SIZE`가 `100g`이면 수치도 **100g 기준 그대로** 보여줍니다. 밀도를 가정해 ml나 한 캔으로 환산하지 않습니다.
- `AMT_NUM1` → kcal, `AMT_NUM3` → 단백질(g), `AMT_NUM4` → 지방(g), `AMT_NUM6` → 탄수화물(g), `AMT_NUM7` → 당류(g), `AMT_NUM13` → 나트륨(mg).
- 빈칸·누락·`-`·불검출·미만·부등호·단위 섞인 수치는 `null`로 둡니다. 명확한 숫자 `0`만 0입니다.
- 성분 기준량, 식품코드, DB 제품명·업체명, 원출처, 생성일·수정일, 수집 확인일을 함께 저장하고 상세 화면에 표시합니다. 수집일은 현재 포장 배합 확인일이 아닙니다.
- API 스냅샷이 있는 제품은 기존 영양·카페인·감미료·원재료·알레르기 값을 가져오지 않습니다. API 스냅샷이 없는 제품만 기존 자료를 그대로 표시합니다.
- 과거 가격은 별도의 날짜가 있는 과거 기록으로 유지합니다. 영양성분과 같은 시점의 자료라고 표시하지 않습니다.

## 원재료·감미료·카페인 별도 검증

수집기는 이 값들을 `separateVerification` 아래 `null`로 생성합니다. 영양 DB의 알룰로스 등 개별 영양 수치로 전체 원재료·감미료 목록을 추정하지 않습니다.
동일 제품·용량의 포장이나 공식 자료로 별도 확인했을 때만 drinks.json의 해당 항목을 다음 양식으로 수정할 수 있습니다.

```json
{
  "value": 0,
  "volumeMl": 355,
  "source": {
    "title": "동일 제품 포장의 무카페인 표시",
    "url": "https://공식-출처-또는-권리확인한-라벨사진-주소",
    "checked": "YYYY-MM-DD",
    "scope": "확인한 제품명·용량·포장 시점과 해당 표시"
  }
}
```

위 양식은 `caffeine` 예시입니다. **0은 무카페인 표시가 확인됐을 때만** 사용합니다. 카페인은 한 캔 기준 mg입니다.
`ingredients.value`는 원재료명 문자열, `sweeteners.value`는 한 캔 기준 `[["수크랄로스", null, "mg"]]`, `allergens.value`는 `["우유"]` 같은 목록입니다.
미확인은 항목 전체를 `null`로 두세요. 출처·확인일·적용 용량 없는 수치는 검사에서 거절합니다. 별도 출처는 상세 화면에도 표시됩니다.

## 공식 명세 확인 기록

### 활용 중인데 401이 반복될 때

키를 설정한 같은 터미널에서 `npm.cmd run food:diagnose`를 실행하세요.
공식 주소에 최소 XML 요청·최소 JSON 요청·제품명 JSON 검색을 각각 한 번 보내 HTTP 상태와 정해진 인증 오류 안내만 표시합니다. 키는 길이·공백 등 입력 형식만 확인하고 키 내용·요청 URL·응답 원문은 출력하지 않습니다. 파일도 수정하지 않습니다.
세 요청 모두 401이면 제품명이나 JSON 형식만의 문제는 아닙니다. 다만 키 자체·해당 API 권한·게이트웨이 반영 상태 중 어느 원인인지는 이 결과만으로 단정할 수 없습니다.
공공데이터포털의 해당 서비스 상세기능 실행 결과와 비교하세요. 포털에서도 거절되면 공식 문의 시 서비스명·활용 상태·키 발급 시각·HTTP 상태만 전달하고 키는 첨부하지 마세요.

확인일: 2026-11-11. [공공데이터포털 공식 상세 페이지](https://www.data.go.kr/data/15127578/openapi.do)의 내장 Swagger 2.0을 직접 확인했습니다.
필드 발췌는 `docs/api/food-nutrition-fields.json`에 있습니다.

- 호출: `https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo03/getFoodNtrCpntDbInq03`
- 요청: `serviceKey`, `FOOD_NM_KR`, `type=json`, `pageNo`, `numOfRows`.
- 응답: `header.resultCode`, `body.items.item`, `body.totalCount`. JSON 직렬화 시 배열형 items와 response 래퍼도 처리합니다.
- `FOOD_NM_KR`: 식품명, `MAKER_NM`: 업체명, `Z10500`: 식품중량, `SERVING_SIZE`: 영양성분함량기준량.
- `FOOD_CD`: 식품코드, `ITEM_REPORT_NO`: 품목제조보고번호, `SUB_REF_NAME`: 출처명, `RESEARCH_YMD`: 데이터생성일자, `UPDATE_DATE`: 데이터수정일자.

현재 개발 환경에 인증키가 없어 실제 인증 API 응답은 확인하지 못했습니다. 자동 검사는 공식 필드에 맞춘 **모의 응답**으로 수행하며, 실제 제품 수치로 배포하지 않습니다.

## 키 노출 방지

- API 요청 URL·서버 오류 본문·인증키는 출력하거나 저장하지 않습니다. 응답도 필요한 필드만 추립니다.
- 공개 폴더에는 검토된 자료만 저장합니다. 수집 보고서는 `.local`에 있으며 Git에서 제외합니다.
- 빌드는 public만 복사하고, 비밀 설정 파일·인증 쿼리·현재 환경변수의 키가 public 안에 있으면 중단합니다.
- 브라우저는 `drinks.json`만 읽고 `apis.data.go.kr`에는 요청하지 않습니다.
- 작업을 마치면 `Remove-Item Env:FOOD_API_KEY`로 현재 PowerShell의 키를 지울 수 있습니다.
