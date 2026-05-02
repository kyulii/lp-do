# CHANGELOG

LP-DO 프로젝트의 주요 변경 사항을 기록한다.
포맷은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)을 기반으로 하며, 날짜는 `YYYY-MM-DD`(KST)로 표기한다.
별도의 문서 수정 이력 섹션은 기입하지 않는다.

---

## [Unreleased]

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
