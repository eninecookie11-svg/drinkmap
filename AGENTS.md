# 작업 지침
드링크맵은 로그인 없이 제로음료 성분·카페인·가격을 탐색하고 비교하는 음료 도감이다.
비전공자가 제품 JSON을 수정해 운영하는 무료 정적 웹사이트다.
자세한 의도는 docs/brief.md.

## 실행·확인·배포
- 설치: npm.cmd ci
- 개발: npm.cmd run dev → http://127.0.0.1:4173
- 데이터 확인: npm.cmd test
- 실제 Chrome 확인: 개발 서버 실행 후 npm.cmd run test:browser
- Chrome 경로가 다르면 CHROME_PATH 환경 변수를 지정한다.
- 빌드: npm.cmd run build → dist
- 빌드 미리보기: 개발 서버 종료 후 npm.cmd run preview
- Cloudflare CLI 배포: 로그인 후 npm.cmd run deploy
- Git 연동 Pages: 빌드 npm run build, 출력 dist, Node 22.13 이상.

## 구조
- public/index.html: 첫 화면, 탐색 메뉴, 검색·필터 골격.
- public/app.js: 화면·상세·비교·가격 계산. public/search.js: 제품명 우선 검색 규칙.
- public/data/products.json: 유일한 제품 데이터 원본. 수정은 여기서 한다.
- public/data/dictionary.json: 감미료 설명. source.json: 공통 자료 안내.
- public/tokens.css: 색·글꼴·글자 크기·간격·둥글기 등 디자인 값.
- public/style.css: 화면 배치와 반응형 표현.
- public/assets: 직접 만든 SVG 및 권리 확인 후 추가할 제품 사진.
- scripts/serve.mjs, build.mjs: 로컬 서버와 정적 배포 파일 생성.
- tests/check.mjs, browser.mjs: 데이터 검사와 실제 브라우저 기능 확인.
- docs/data-guide.md, product-template.json: 한국어 데이터 수정법과 복사용 양식.
- docs/image-rights.md: 이미지 권리 기록. README.md: 실행·배포 안내.

## 디자인
- 편의점 냉장고에서 꺼내 보는 믿을 수 있는 음료 도감.
- 아이보리·잉크·라임. 글자형 드링크맵 헤더, 짧은 검색 안내와 큰 검색창.
- 헤더는 음료 찾기·감미료 사전·가격 정보만. 히어로 진열 그림은 사용하지 않는다.
- 휴대폰 상세 필터는 처음에 접고, 제품 탐색을 먼저 보여준다.
- 제품명 검색에 제조사 제품을 섞지 않는다. 전체 제조사 이름 검색과 브랜드 필터는 유지.
- 모든 디자인 값은 public/tokens.css에서 관리하고 화면 전체에 일관되게 쓴다.
- 헤더 글자 크기는 유지하고 본문·필터·성분 정보를 휴대폰에서도 읽기 쉽게 표시한다.
- 정렬은 도감 순·이름 가나다순·카페인 적은 순만 제공한다. 검색창은 새로 열 때 세 제품명 예시 중 하나를 표시한다.

## 지킬 것
- 브리프의 조건과 넣지 않는 것을 유지한다. Cloudflare Pages, 무료 운영 우선.
- 로그인 강제, 건강 점수·안전성 순위, 미검증 자동 수집 가격, 가짜 후기 금지.
- API 키 등 비밀 값을 코드·문서·저장소에 쓰지 않는다.
- 미확인은 null, 카페인 없음 확인만 0. 미확인을 무함유로 해석하지 않는다.
- 확인한 데이터는 출처·날짜·적용 범위를 함께 수정한다. 현재와 과거 값을 혼합하지 않는다.
- 현재 2024년 조사 14종과 확인 대기 1종. 최신 성분·30종 확대·실제 사진은 미완료다.
- 사진 사용 권리를 확인하고, 일러스트를 실제 사진이라고 표시하지 않는다.
- 광고는 검색·성분 확인을 방해하지 않는다. 현재 광고 스크립트는 없다.

## 일하는 방식
- 고친 뒤 실행해서 직접 확인한다. PC·390px·320px에서 확인하고 못 본 것은 명시한다.
- 한국어로 답한다. 만드는 사람은 비전공자이므로 전문 용어는 짧게 풀어준다.
