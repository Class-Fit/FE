# ClassFit Frontend

공공 체육 강좌를 검색하고 상세 정보를 확인하며 로그인 사용자가 관심 강좌를 찜할 수 있는 ClassFit 웹 프론트엔드입니다.

## 실행 환경

- Node.js `20.19.0` 이상 또는 `22.12.0` 이상
- npm `11` 이상 권장
- ClassFit 백엔드 기본 주소: `http://localhost:8080`

## 로컬 실행

```bash
npm install
npm run dev
```

기본 접속 주소는 `http://localhost:5173`입니다. Vite 개발 서버는 `/api`, `/oauth2`, `/login` 요청을 백엔드로 프록시하므로 브라우저에서는 같은 출처처럼 세션 쿠키를 사용할 수 있습니다.

백엔드 주소가 다르면 실행 전에 `VITE_BACKEND_URL`을 지정합니다.

```bash
VITE_BACKEND_URL=http://localhost:8081 npm run dev
```

## 검증

```bash
npm test -- --run
npm run build
npm run lint
```

## Vercel 운영 배포

Vercel 프로젝트의 Root Directory는 저장소 루트로 두고 Framework Preset은 Vite를 선택합니다. Production 환경변수 `VITE_BACKEND_URL`에는 실제 백엔드 HTTPS Origin(예: `https://api.example.com`)을 설정합니다. 경로나 끝 슬래시는 넣지 않습니다. 설정이 빠지거나 HTTP 주소이면 운영 빌드가 실패합니다.

`vercel.json`은 `/courses` 같은 클라이언트 경로로 직접 접속하거나 새로고침해도 React 앱을 제공하도록 구성합니다.

운영 번들의 API 요청과 카카오 로그인 링크는 이 주소로 이동합니다. 백엔드에는 해당 Vercel 배포 주소를 `CLASSFIT_FRONTEND_ORIGIN`으로 등록해야 하며, 로그인 성공 시 프론트 강좌 페이지로 돌아오도록 설정해야 합니다.

- `test`: Vitest와 React Testing Library로 API 변환, 검색 URL, 상세 상태, 인증과 찜 동작을 검증합니다.
- `build`: TypeScript 검사 후 production 번들을 생성합니다.
- `lint`: ESLint로 TypeScript와 React Hook 규칙을 검사합니다.

## 현재 구현 범위

- 데스크톱 상단·모바일 하단 반응형 내비게이션
- 검색어·지역·종목과 페이지를 URL에 보존하는 강좌 검색
- 로딩, 빈 결과, 오류 재시도 상태
- 강좌 일정, 비용, 시설과 설명을 표시하는 상세 화면
- 비로그인 카카오 로그인 안내
- 로그인 사용자의 찜 등록·취소와 실패 시 상태 복구

지역·종목 옵션은 백엔드 CSV에서 생성합니다. 백엔드 코드 데이터가 바뀌면 다음 명령을 실행하고 결과 파일을 함께 커밋합니다.

```bash
node scripts/generate-course-filters.mjs
```

## 백엔드 연동 제약

- 카카오 로그인 시작 주소는 `/oauth2/authorization/kakao`입니다.
- 현재 백엔드는 로그인 성공 후 `/api/members/me` JSON으로 이동합니다. 완성된 로그인 사용자 흐름을 위해 OAuth2 성공 URL을 프론트 주소로 변경해야 합니다.
- 로그아웃 API는 CSRF 토큰이 필요하지만 프론트에 토큰을 전달하는 계약이 아직 없어 이번 범위에는 로그아웃 버튼을 포함하지 않았습니다.
- 개발 서버 프록시를 사용하지 않고 서로 다른 도메인에 배포하면 백엔드 CORS와 세션 쿠키의 `SameSite`·`Secure` 정책을 함께 설정해야 합니다.
