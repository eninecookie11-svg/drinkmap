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

식약처 공식 API의 영양정보는 로컬에서 수집·검토한 뒤 `public/data/drinks.json`으로 공개합니다. 인증키는 `FOOD_API_KEY` 환경변수에만 설정하며, 방문자는 API 대신 JSON만 읽습니다. 조회·등록 방법은 [docs/food-api.md](docs/food-api.md)를 참고하세요. 아직 검증된 API 제품 데이터는 없으며 기존 15종은 유지됩니다.
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
- 15종(공식 조사 14종, 확인 대기 1종)이 있으며 30종 확대 목표는 아직 달성하지 못했습니다.
- 현재 전체 원재료·알레르기·일부 영양정보·최신 판매 여부는 미확인입니다.
- AdSense 공간만 마련했습니다. 승인 후 실제 광고를 연결하고 개인정보 안내를 갱신하세요.
- 유료 서버·API, 로그인, 자동 가격 수집, 건강 점수, 가짜 후기를 넣지 않습니다.

