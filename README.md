# 드링크맵
로그인 없이 감미료·카페인·영양정보를 확인하고 음료를 비교하는 정적 웹사이트입니다.
자세한 의도는 docs/brief.md를 참고하세요.

## 실행
Node.js 22.13 이상이 필요합니다. PowerShell에서는 npm 대신 npm.cmd를 쓰면 실행 정책 오류를 피할 수 있습니다.

```sh
npm.cmd ci
npm.cmd run dev
```
http://127.0.0.1:4173 을 열고 제품명 검색 → 상세 성분 라벨 → 비교 추가를 눌러보세요.
검색은 제품명 일치를 우선합니다. `코카콜라`는 코카콜라 제품만, `코카-콜라음료`는 제조사 제품을 찾습니다.
휴대폰에서는 상세 필터를 펼쳐 조건을 고릅니다. 비교는 제품의 + 비교 버튼으로 시작합니다.
최근 본 음료는 브라우저에만 저장됩니다. 가격 계산 입력값과 결과는 저장하지 않습니다.

카드·상세·감미료 사전·필터의 감미료는 현재 등록 제품의 사용 빈도순으로 자동 정렬합니다. 동률은 가나다순이며 스테비올배당체와 효소처리스테비아는 별도로 셉니다. [현재 집계 기준](docs/research/catalog-sweetener-order.md)을 참고하세요. 과거 외부20종 표본의 [조사 보고서](docs/research/sweeteners-2026.md)는 기록으로 보존하며 현재 화면 정렬에 사용하지 않습니다.

식약처 공식 API의 영양정보는 로컬에서 수집·검토한 뒤 `public/data/drinks.json`으로 공개합니다. 인증키는 `FOOD_API_KEY` 환경변수에만 설정하며, 방문자는 API 대신 JSON만 읽습니다. 조회·등록 방법은 [docs/food-api.md](docs/food-api.md)를 참고하세요. 아직 검증된 API 제품 데이터는 없으며 제품별 출처가 있는 기존 자료와 신규 확인 대기 기록을 유지합니다.
서버 실행을 종료할 때는 터미널에서 Ctrl+C를 누르세요.

## 확인
```sh
npm.cmd test
npm.cmd run test:browser
npm.cmd run build
```
브라우저 검사는 dev 서버가 실행 중이어야 합니다. Windows 기본 Chrome 경로를 사용하며 다른 환경에서는 CHROME_PATH 환경 변수로 Chrome 실행 파일을 지정합니다.
스크린샷은 test-results 폴더에 저장됩니다.

## 데이터 수정
[한국어 수정 안내](docs/data-guide.md)를 참고하여 public/data/products.json을 고치세요.
[복사용 제품 양식](docs/product-template.json)이 있습니다. 제품 수·필터·비교는 자동으로 갱신됩니다.
2024년 시험값을 현재 제품 배합으로 보장하지 않습니다. 최신 확인이 없는 값은 미확인입니다.

## Cloudflare Pages 배포
1. Cloudflare 계정에서 Workers & Pages → Pages → Git 저장소 연결을 선택합니다.
2. Framework preset: None, Build command: `npm run build`, Build output directory: `dist`.
3. 환경 변수 NODE_VERSION: 22.13.0 이상. API 키는 필요 없습니다.
4. 배포 완료 후 발급받은 pages.dev 주소에서 검색·제품 링크·모바일 비교를 확인합니다.
5. 이후 products.json을 수정해 GitHub에 올리면 연결된 Pages가 다시 빌드합니다.

직접 업로드를 택하면 `npm.cmd run build` 후 dist를 업로드할 수도 있습니다.
CLI를 쓰려면 Cloudflare 로그인 후 `npm.cmd run deploy`를 실행합니다. 프로젝트 이름은 drinkmap입니다.
현재 Cloudflare 계정 연결·공개 배포는 수행하지 않았습니다.

## 운영 전에
- 사진 재사용 허락 확보 후 SVG를 교체하세요. docs/image-rights.md에 근거를 기록하세요.
- 현재 28종입니다. 기본순은 사용자 목록 순서이며 광고·인지도·판매량 순위가 아닙니다. 펩시 파인애플·노브랜드·탐스제로 오렌지·펩시 모히토는 사용자 요청으로 제외했습니다. 신규 제품의 영양·원재료는 일부 판매표시를 참고했으며, 카페인은 별도 사용자 인터넷 조사값과 기존 출처를 구분합니다. 자세한 적용 범위는 docs/research/catalog-expansion-2026.md를 참고하세요. 최신 성분 전수 검증·실제 사진 확보는 미완료입니다.
- 현재 전체 원재료·알레르기·일부 영양정보·최신 판매 여부는 미확인입니다.
- AdSense 공간만 마련했습니다. 승인 후 실제 광고를 연결하고 개인정보 안내를 갱신하세요.
- 유료 서버·API, 로그인, 자동 가격 수집, 건강 점수, 가짜 후기를 넣지 않습니다.

