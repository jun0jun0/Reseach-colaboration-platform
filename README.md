# ResearchLink

연구생이 연구 프로젝트와 진행 상황을 공유하고 유형별 피드백을 주고받는 커뮤니티입니다. 제공된 기획·설계·디자인 문서의 MVP 요구사항(FR-01~FR-15)을 바탕으로 구현했습니다.

## 주요 기능

- 이메일 회원가입·로그인·로그아웃·비밀번호 변경
- 항목별 공개 설정을 지원하는 연구생 프로필
- 연구 프로젝트 등록·수정·삭제와 공개 범위 설정
- 자유·프로젝트·기술·공지 게시판, 코드 블록과 첨부 파일
- 유형별 피드백과 1단계 답글, 좋아요·북마크
- 검색, 연구 분야·학위·기간·진행 상태 필터와 최근 7일 인기 글
- 댓글·답글 알림과 읽음 처리
- 관리자 회원·콘텐츠·카테고리·공지 관리, 신고 처리와 조치 이력

프로젝트 피드백은 연결된 공유 게시글에서 작성합니다. 비공개·삭제 프로젝트에 연결된 게시글은 일반 목록, 검색, 인기 글과 직접 열람에서 제외됩니다. 세부 동작과 검증 범위는 [기능 설명 문서](./RESEARCHLINK.md)를 참고하세요.

## 기술 구성과 저장 방식

React와 TypeScript로 화면을 구성하고 Vinext 및 Cloudflare Worker에서 서버를 실행합니다. 데이터 관계는 Drizzle 스키마로 관리합니다.

회원, 프로젝트, 게시글, 댓글, 좋아요, 북마크, 알림, 신고, 세션과 운영 이력은 D1(SQLite)에 저장합니다. 첨부 파일의 실제 내용은 R2에, 파일 정보는 데이터베이스에 저장합니다. 브라우저를 닫거나 다시 로그인해도 서버에 저장한 내용을 불러올 수 있습니다.

로컬 데이터는 `.wrangler/state`에 보관합니다. **이 폴더를 삭제하면 로컬에 저장한 데이터와 첨부 파일이 사라집니다.** 로컬 데이터와 게시 환경의 데이터는 별개입니다. 현재 로컬 사이트는 온라인에 게시되지 않았습니다.

## 로컬 실행

Node.js 22.13.0 이상이 필요합니다. 아래 명령은 `researchlink` 폴더에서 실행합니다.

```powershell
npm ci
npm run dev -- --hostname 127.0.0.1 --port 5173
```

브라우저에서 [ResearchLink 로컬 사이트](http://127.0.0.1:5173)를 엽니다. Windows에서는 `start-researchlink.cmd`를 실행해도 됩니다. 이미 미리보기 서버가 실행 중이면 기존 서버를 사용합니다.

Windows의 npm 실행 파일이 잘못된 상대 경로를 사용하는 경우 설치된 npm 진입점을 직접 실행할 수 있습니다. 일반적인 Node.js 설치 경로의 예시는 다음과 같습니다.

```powershell
& 'C:/Program Files/nodejs/node.exe' 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' ci
node scripts/run-framework.mjs dev --hostname 127.0.0.1 --port 5173
```

현재 작업 폴더에는 데이터베이스 초기화가 완료되어 있으므로 초기 SQL을 다시 적용하지 않습니다.

## 새 환경의 데이터베이스 초기화

새 작업 폴더에서 처음 실행할 때는 먼저 빌드하여 Worker 설정을 생성한 다음 초기 SQL을 적용합니다.

```powershell
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_clear_demogoblin.sql
npm run dev -- --hostname 127.0.0.1 --port 5173
```

이미 적용한 SQL을 다시 실행하지 않습니다. 스키마 변경 후에는 `npm run db:generate`로 마이그레이션을 생성하고 아직 적용하지 않은 파일만 순서대로 적용합니다. 저장 위치는 `.wrangler/state`이며 버전별 하위 폴더는 Wrangler가 생성합니다. 위 명령은 로컬 데이터만 변경합니다.

## 계정과 첨부 파일

비밀번호는 bcrypt로 해시하고 로그인은 HttpOnly 세션 쿠키로 관리합니다. 수정 요청에는 CSRF와 서버 권한 검사를 적용합니다. 첫 실제 가입 계정의 관리자 초기화는 로컬 또는 비공개 소유자 환경에서만 허용합니다. 현재 로컬의 ‘안준영’ 계정은 사용자 승인에 따라 관리자로 지정되어 있습니다.

예시 연구자 계정 3개의 비밀번호 로그인은 비활성화되어 있습니다. 시작 콘텐츠는 사용 방법을 보여 주는 예시입니다.

첨부 파일은 파일당 10MB, 콘텐츠당 10개까지 지원합니다. 허용 형식은 PDF, TXT, CSV, JSON, PNG, JPG, WEBP입니다. 서버는 업로드와 다운로드 시 접근 권한을 검사하고 원래 파일명을 저장 키로 사용하지 않습니다.

## 폴더 구성

| 경로 | 역할 |
| --- | --- |
| `app/researchlink.tsx` | 사용자 화면과 관리자 화면 |
| `app/globals.css` | 공통 디자인과 반응형 스타일 |
| `app/api/[...path]/route.ts` | API 요청 진입점 |
| `lib/research-api.ts` | 인증·권한·저장·검색·관리자 처리 |
| `db/schema.ts` | 데이터베이스 테이블과 관계 |
| `db/index.ts` | D1 연결 |
| `drizzle/` | 데이터베이스 마이그레이션 |
| `components/ui/` | 공통 화면 컴포넌트 |
| `scripts/` | 실행·설치·검증 도구 |
| `build/` | Worker와 로컬 미리보기 연결 도구 |
| `.openai/hosting.json` | 게시 환경의 D1·R2 바인딩 선언 |
| `.wrangler/state/` | 로컬 데이터베이스와 첨부 파일 저장소 |

`dist/`, `.next/`, `.vinext/`와 `.sites-runtime/`은 생성 결과 또는 로컬 도구 상태입니다. 의존성인 `node_modules/`와 함께 소스 버전 관리에서 제외합니다. `.wrangler/` 역시 버전 관리에서 제외하지만 실제 로컬 데이터를 포함하므로 보존해야 합니다. 비밀 환경 변수는 버전 관리에서 제외한 `.env*` 파일에 저장합니다.

## 실행과 검증 명령

| 명령 | 용도 |
| --- | --- |
| `npm run dev` | 개발 서버와 변경 사항 자동 반영 |
| `npm run build` | 운영용 빌드 생성 |
| `npm start` | 빌드한 Worker를 로컬에서 실행 |
| `npm run lint` | 소스 정적 검사 |
| `node node_modules/typescript/bin/tsc --noEmit` | TypeScript 타입 검사 |
| `npm run db:generate` | 스키마 변경에 따른 SQL 생성 |

`npm start`는 `dist/server/wrangler.json`과 `.wrangler/state`를 사용합니다. 서버가 출력한 주소로 접속하며 온라인 배포를 수행하지 않습니다.

실제 API 흐름 검증은 다음 명령으로 실행합니다.

```powershell
node scripts/verify-researchlink.mjs http://127.0.0.1:5173
```

이 검증은 계정과 콘텐츠를 생성하고 수정하므로 별도의 로컬 테스트 데이터 환경에서 실행합니다. 회원가입·로그인·저장 후 재로그인·CSRF·소유권·공개 범위·댓글·좋아요·북마크·알림·첨부·신고·삭제를 확인합니다.

## 실행 환경과 설치 도구

Windows·macOS·Linux에서 사용할 수 있는 일반 실행 환경과 관리형 Linux 실행 환경을 지원합니다. 선택값은 버전 관리에서 제외한 `.sites-runtime/execution-profile.json`에 저장합니다. 선택값이 없는 새 작업 폴더는 일반 실행 환경을 사용합니다.

일반 실행 환경은 사용자의 HOME, npm 캐시, 레지스트리, 프록시와 임시 폴더 설정을 유지합니다. 관리형 Linux 도구는 Bash, flock, curl, sha256sum과 GNU timeout을 사용해 설치 잠금과 제한 시간을 적용합니다. 의존성 설치를 동시에 실행하지 않습니다.

`scripts/sites-env.mjs`는 Wrangler와 Miniflare의 상태를 작업 폴더 안에 저장합니다. 로컬 도구 사용량 수집은 기본적으로 꺼져 있으며 `WRANGLER_SEND_METRICS=true`로 활성화할 수 있습니다. 이 프로젝트는 별도의 `wrangler.jsonc` 대신 빌드 과정에서 생성한 Worker 설정을 사용합니다.

## 선택적 ChatGPT 로그인과 앱 연결

현재 ResearchLink는 자체 이메일 로그인을 사용합니다. `app/chatgpt-auth.ts`는 게시 플랫폼이 제공하는 ChatGPT 로그인을 향후 연결할 때 사용할 서버 전용 보조 함수입니다.

- `getChatGPTUser()`는 로그인 정보를 선택적으로 조회합니다.
- `requireChatGPTUser(returnTo)`는 로그인이 필요한 서버 페이지에서 사용합니다.
- `chatGPTSignInPath(returnTo)`와 `chatGPTSignOutPath(returnTo)`는 로그인·로그아웃 이동 경로를 만듭니다.

ChatGPT 로그인은 최상위 브라우저 이동으로 시작하며 로그인 링크에는 `target="_top"`을 사용합니다. `returnTo`는 같은 사이트의 상대 경로여야 합니다. `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`과 OAuth 쿠키는 게시 플랫폼이 관리하므로 같은 경로의 애플리케이션 라우트를 추가하지 않습니다.

게시 플랫폼의 `oai-authenticated-user-id`는 사이트 내의 안정적인 사용자 키입니다. 이메일은 표시·연락 목적으로 사용합니다. 선택적 이름 헤더인 `oai-authenticated-user-full-name`은 `oai-authenticated-user-full-name-encoding`이 `percent-encoded-utf-8`일 때 디코딩하며 이름이 없으면 이메일을 사용합니다. 로그인 사실만으로 조직 소속이나 ResearchLink 관리자 권한이 부여되지는 않습니다.

`lib/connector-*`, `lib/connectors.ts`와 `scripts/connector-preview/`는 선택적 외부 앱 연결을 위한 기반 코드입니다. 호출 권한과 인증 정보는 서버 또는 미리보기 담당 호스트가 관리합니다. 제공자 응답이 불확실하면 자동으로 작업을 재실행하지 않습니다.
