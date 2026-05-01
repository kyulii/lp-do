# 데이터베이스 및 데이터베이스 기획 (Supabase)

Supabase는 PostgreSQL 기반의 데이터베이스를 제공합니다. 초기 기획 단계의 주요 테이블(Table) 구조는 아래와 같습니다.

## 1. Users 테이블 (사용자 정보)
- `id` (UUID): 유저 고유 아이디 (Primary Key)
- `email` (String): 유저 이메일 (Supabase Auth 연동)
- `created_at` (Timestamp): 가입 일자

## 2. Tasks 테이블 (트랙/할 일 목록)
- `id` (UUID): 할 일 고유 아이디 (PK)
- `user_id` (UUID): 이 할 일을 작성한 유저의 ID (Foreign Key)
- `title` (String): 할 일의 내용 (예: "장보기", "코딩하기")
- `is_completed` (Boolean): 완료 여부 (True/False)
- `date` (Date): 할 일이 배정된 날짜
- `created_at` (Timestamp): 작성된 시간

## 3. Albums 테이블 (하루 마감 데이터)
- `id` (UUID): 앨범 고유 아이디 (PK)
- `user_id` (UUID): 유저 ID (FK)
- `date` (Date): 앨범이 기록된 날짜
- `cover_style` (String): 앨범 커버의 디자인 테마 식별자 (예: 'gold', 'sketch', 'retro')
- `total_tasks` (Integer): 그 날의 총 목표치
- `completed_tasks` (Integer): 그 날 완료한 트랙 개수 (이것으로 달성률 계산)
