# 데이터베이스 스키마 기획 (Supabase)

Supabase는 별도의 백엔드 서버 구축 없이 프론트엔드에서 직접 안전하게 접근할 수 있는 PostgreSQL 기반의 클라우드 데이터베이스 서비스(BaaS)입니다. 본 프로젝트의 주요 테이블 구조는 아래와 같습니다.

## 1. Users 테이블 (사용자 정보)
*   **id (UUID):** 유저 고유 식별자 (Primary Key)
*   **email (String):** 유저 이메일 (Supabase Auth 기반)
*   **created_at (Timestamp):** 가입 일자

## 2. Tracks 테이블 (트랙/할 일 목록)
*   *기존 Tasks 테이블에서 프로젝트 컨셉에 맞춰 명칭을 Tracks로 변경.*
*   **id (UUID):** 트랙 고유 식별자 (Primary Key)
*   **user_id (UUID):** 이 트랙을 작성한 유저의 ID (Foreign Key)
*   **title (String):** 트랙(할 일)의 내용 (예: "기획 문서 작성하기")
*   **is_completed (Boolean):** 완료 여부 (True/False)
*   **date (Date):** 트랙이 소속된 날짜 (앨범 매칭용)
*   **created_at (Timestamp):** 생성된 시간

## 3. Albums 테이블 (하루 단위 데이터 및 앨범 커스텀)
*   **id (UUID):** 앨범 고유 식별자 (Primary Key)
*   **user_id (UUID):** 유저 ID (Foreign Key)
*   **date (Date):** 앨범이 기록된 날짜 (Unique)
*   **cover_style (String):** 사용자가 선택한 앨범 커버의 디자인/색상 테마 (추후 커스터마이징 기능 지원용)
*   **total_tracks (Integer):** 그날 작성된 총 트랙 개수
*   **completed_tracks (Integer):** 그날 완료된 트랙 개수 (아카이브 화면에서 앨범 달성률 등을 시각적으로 표현할 때 활용)
