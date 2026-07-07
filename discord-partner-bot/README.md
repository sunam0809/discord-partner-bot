# 🤖 디스코드 파트너봇

디스코드 파트너 채널에 자동으로 메시지를 발송해주는 봇입니다.

## ✨ 기능

| 명령어 | 설명 |
|--------|------|
| `/웹훅등록 [url]` | 웹훅 URL 등록 (최대 20개) |
| `/주기설정 [시간]` | 발송 주기 설정 (예: 24 = 24시간에 1번) |
| `/보낼문구 [메시지]` | 전송할 메시지 내용 설정 |
| `/보내기시작 [봇이름]` | 자동 발송 시작 + 봇 이름 설정 |
| `/보내기중지` | 자동 발송 중지 (설정은 유지됨) |
| `/세팅초기화` | 모든 설정 초기화 및 발송 중지 |
| `/도움말` | 사용법 안내 |

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/YOUR_USERNAME/discord-partner-bot.git
cd discord-partner-bot
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp .env.example .env
```
`.env` 파일을 열고 `DISCORD_TOKEN`과 `DISCORD_CLIENT_ID`를 입력하세요.

### 4. 슬래시 커맨드 등록
```bash
npm run deploy
```

### 5. 봇 실행
```bash
npm start
```

## 📋 디스코드 개발자 포털 설정

1. https://discord.com/developers/applications 접속
2. **New Application** 클릭 → 앱 이름 입력
3. **Bot** 탭 → **Add Bot** → `TOKEN` 복사 → `.env`의 `DISCORD_TOKEN`에 입력
4. **OAuth2** 탭 → `CLIENT ID` 복사 → `.env`의 `DISCORD_CLIENT_ID`에 입력
5. **OAuth2 → URL Generator**:
   - Scopes: `bot` ✅ + `applications.commands` ✅
   - 생성된 URL로 봇을 서버에 초대

## 💡 웹훅 URL 얻는 방법

디스코드 채널 → 채널 편집 → **연동** → **웹후크** → **새 웹후크** → **URL 복사**

## 📌 사용 순서

1. `/웹훅등록`으로 파트너 채널 웹훅 URL 등록
2. `/주기설정`으로 발송 주기 입력 (예: `24` = 하루 1번)
3. `/보낼문구`로 전송할 메시지 작성
4. `/보내기시작`으로 봇 이름 설정 후 발송 시작
5. 일시중지: `/보내기중지` (설정 유지)
6. 전체 초기화: `/세팅초기화`

## ⚙️ 기술 스택

- **Node.js** 18+
- **discord.js** v14
- **dotenv**
- 데이터 저장: JSON 파일 (서버별 분리)

## 📝 라이선스

MIT
