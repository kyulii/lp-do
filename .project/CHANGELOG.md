# CHANGELOG

LP-DO 프로젝트의 주요 변경 사항을 기록한다.
포맷은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)을 기반으로 하며, 날짜는 `YYYY-MM-DD`(KST)로 표기한다.
별도의 문서 수정 이력 섹션은 기입하지 않는다.

---

## [Unreleased]

### Fixed — 2026-05-02 (보완 3)

#### 턴테이블 박스가 트랙리스트를 가리는 레이아웃 버그 수정

화면 세로 높이가 줄어들면 우측 패널의 빨간 레코드 박스(`.tt-base`)가 그 아래 트랙리스트 영역 위로 흘러나와 헤더 텍스트("SATURDAY, JUNE …")를 덮어버리는 문제 수정. 원인 3가지(빈 그리드 행 / 셀 overflow visible / positioned-vs-static painting order)가 맞물려 발생.

- `src/styles/lp-bar-turntable.css`
  - `.tt` `grid-template-rows: auto auto 1fr` → `auto 1fr` — 자식 수(2개)에 맞게 행 정의 정정. `.tl`이 두 번째 `1fr` 행을 차지해 남는 공간 확보
  - `.tt-graphic` `min-height: 220px` → `180px`, `overflow: hidden` 추가 — 박스가 셀 밖으로 못 나가도록. painting order 우회 효과까지 동시 해결
  - `.tt-base` `max-height: 100%` 추가 — `aspect-ratio`가 자동으로 너비도 줄여 박스가 컨테이너에 비례 축소되도록

### Fixed — 2026-05-02 (보완 2)

#### Add Track 토스트 타이밍 + 카피 정정

`+ Add Track` 클릭만으로 "Cut to vinyl." 토스트가 떠 저장이 끝났다고 오해되는 문제 수정. 토스트 카피도 표준 영어 관용구로 정정해 한국인 가독성 개선.

- `src/components/LPBarApp.tsx`
  - `addTrack`의 `onToast?.("Cut to vinyl.")` 호출 제거 — 빈 트랙은 편집 모드 진입용 placeholder이므로 저장 토스트 부적절
  - `updateTrack` 토스트 멘트 `Cut to vinyl.` → `Cut A Record.` (영어 관용구 표준화)
- 시드 트랙(`src/lib/lpb.ts`의 May 2 To-Do 항목 "Cut to vinyl")은 사용자 작성 컨텍스트라 유지

### Changed — 2026-05-02 (보완)

#### 아카이브 월 네비게이션 동적화

좌우 화살표가 May 2026 고정 토스트만 띄우던 것을 실제 월 전환으로 교체. 헤더 `Volume {month} : {year}` + 턴테이블 호선 라벨 + Tracklist 타이틀이 현재 보고 있는 월/연 따라 동기화되도록 일반화.

**데이터 헬퍼 일반화**
- `src/lib/lpb.ts`
  - `makeAlbums()` → `makeAlbums(year, month)`. `Date` API로 1일 요일 + 월 일수 + 이전 월 마지막일 계산해 6×7 그리드 동적 생성
  - `weekdayOfMay(d)` → `weekdayOf(year, month, day)` 일반화
  - `MONTH_NAMES` (대문자) / `MONTH_NAMES_TITLE` (타이틀케이스) 상수 추가
  - 시드 트랙은 `year === 2026 && month === 5`일 때만 적용 — 다른 월은 빈 캘린더

**상태 / 영속화 리팩터**
- `src/components/LPBarApp.tsx`
  - `currentMonth: { year, month }` 상태 추가
  - 저장 구조 `Album[]` → `Record<"YYYY-MM", Album[]>`. `STORAGE_KEY`를 `lpbar:albums:v2`로 bump
  - `shiftMonth(±1)` 핸들러로 prev/next 월 전환 + 새 월 1일 자동 선택. 연 경계(12↔1) 처리
  - `handleToday` `useCallback`으로 안정화 (effect deps 경고 해소)
  - 기존 `"Volume 4 not yet pressed."` / `"Volume 6 not yet pressed."` 토스트 제거 — 실제 동작으로 대체

**컴포넌트 라벨 동적화**
- `src/components/Turntable.tsx` — `year`/`month` props로 호선 텍스트(`MAY 2026` 하드코딩 제거) + 요일명 동적 계산
- `src/components/Tracklist.tsx` — `year`/`month` props로 `Sunday, May 2` 형식 타이틀 동적화

### Notes — 2026-05-02 (보완)

- `localStorage` v1 → v2 마이그레이션은 생략 (프로토타입 단계). 새 시드는 `{ "2026-05": makeAlbums(2026, 5) }`
- 키보드 ←/→는 현재 월 내 이동 유지 (월 경계 넘김은 별도 요청 없음)
- 검증: `npm run lint` 0 errors / `npx tsc --noEmit` 클린 / `npm run build` 성공

### Added — 2026-05-02

#### LP Bar 프로토타입 (Pop Art Studio) 구현

Claude Design 핸드오프 번들(`lp-do/`)을 기반으로 메인 화면을 Next.js 16 / React 19로 포팅. 프로토타입 디자인을 픽셀 단위로 재현하면서 프레임워크 컨벤션에 맞게 컴포넌트를 분리.

**데이터 / 도메인**
- `src/lib/lpb.ts`
  - 2026년 5월 시드 앨범 / 트랙 데이터 (일요일 시작 6×7 = 42셀, 앞뒤 패딩 포함)
  - `makeAlbums`, `weekdayOfMay`, `pad2` 등 헬퍼와 `WEEKDAYS / DAYNAMES / DAYNAMES_FULL` 상수
  - `Album`, `Track` 타입 정의

**스타일 (Pop Art Studio 토큰화)**
- `src/styles/lp-bar-archive.css` — 좌측 아카이브 / 앨범 카드 / LP 슬라이드 아웃
- `src/styles/lp-bar-turntable.css` — 우측 턴테이블 / 트랙리스트 + `.lpb-popart` 테마 변수
- `src/styles/lp-bar-prototype.css` — 사인인 화면 / 토스트 / 셸
- 글로벌 hook의 500줄 제한에 맞춰 원본 `lp-bar.css`를 위 3개 파일로 분리

**컴포넌트 (`src/components/`)**
- `SignIn.tsx` — MEMBERS ONLY LP + Google CTA, 페이드 아웃 후 진입
- `Toast.tsx` — "Cut to vinyl." 알림
- `AlbumCard.tsx` — 슬리브 + 호버 시 LP 슬라이드 아웃 (480ms cubic-bezier)
- `Turntable.tsx` — 회전 LP, 호선 텍스트 라벨(`MAY 2026` / 요일 / `No. NN`)
- `Tracklist.tsx` — 체크박스 토글(취소선 제거, muted 처리만), 인라인 편집, 추가 / 삭제, 자체 스크롤
- `Archive.tsx` — 헤더(`LP BAR` + *Volume 5 : 2026* italic Fraunces), TODAY / prev / next, 사용자 메뉴
- `LPBarApp.tsx` — 상태 / localStorage 영속화 / `←` `→` `T` 키보드 단축키
- `LPBarPrototype.tsx` — 사인인 게이트 + 토스트 셸
- `LPBarPrototypeClient.tsx` — `next/dynamic({ ssr: false })` 래퍼

**App Router 연결**
- `src/app/layout.tsx` — `next/font/google`로 Bebas Neue, Space Grotesk, Fraunces, Cormorant, Inter, DM Mono 로드. Material Symbols Outlined는 `<link>`로 연결
- `src/app/globals.css` — LP Bar 스타일시트 3종 import + 풀 블리드 레이아웃
- `src/app/page.tsx` — `LPBarPrototypeClient` 렌더 (서버 컴포넌트)
- 사용하지 않는 `src/app/page.module.css` 제거

### Changed — 2026-05-02

- `src/app/layout.tsx` — 기본 Geist 폰트 세팅을 LP Bar 디자인용 6종 폰트로 교체. `metadata.title`을 "LP Bar — Daily Records"로 변경
- `src/app/globals.css` — 기본 reset / 다크 모드 토큰 제거, LP Bar 스타일시트 import 및 풀 블리드(`overflow: hidden`) 셸로 교체

### Removed — 2026-05-02

- `src/app/page.module.css` — Next.js 기본 템플릿 잔여물

### Notes — 2026-05-02

- React 19의 `react-hooks/set-state-in-effect` 규칙 대응을 위해 localStorage 초기 로드를 `useState` lazy initializer로 옮기고, SSR 하이드레이션 미스매치는 `next/dynamic` `ssr: false` 래퍼로 회피
- 비차단 lint 경고 2건(`@next/next/google-font-display`, `@next/next/no-page-custom-font`)이 Material Symbols `<link>`에서 발생. `next/font/google`이 Material Symbols 축(axes)을 지원하지 않아 잠정 유지
- 검증: `npm run lint` 0 errors / `npx tsc --noEmit` 클린 / `npm run build` 성공 / `next dev` GET / 200 응답 확인

### 참고 — 디자인 베이스

- 핸드오프 번들 ID: `t2Vl7a1UbwEZgUsaDp_WmQ`
- 채택 컨셉: "Pop Art Studio" (3개 가설 중 사용자가 보완 요청한 방향)
- 주요 보완 반영
  - 캘린더 일요일 시작 / 6행이 한 화면에 들어오는 그리드
  - 헤더 라벨을 *Volume 5 : 2026* italic Fraunces로 교체
  - TODAY 배지 / 우상단 점 / 빈 앨범 점 제거
  - 완료 트랙은 muted 색상만, 취소선 제거
  - 턴테이블 라벨을 호선 텍스트 3개로 분산(스핀들과 충돌 X)
  - 트랙리스트 자체 스크롤 + 가로 풀폭 `+ Add Track` 버튼
  - 카트리지 아이콘을 사용자 아이콘으로 교체
