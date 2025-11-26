# 구글 시트 연동 설정 가이드 (Google Sheets Setup Guide)

챗봇의 대화 로그를 구글 시트에 자동으로 저장하기 위해 **Google Cloud Service Account(서비스 계정)** 설정이 필요합니다. 아래 단계를 차근차근 따라해주세요.

## 1단계: 구글 클라우드 프로젝트 생성 및 API 활성화

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. 상단에서 프로젝트 선택 드롭다운을 클릭하고 **"새 프로젝트"**를 만듭니다 (이름은 `jisan-chatbot` 등 자유롭게).
3. 좌측 메뉴에서 **"API 및 서비스" > "라이브러리"**로 이동합니다.
4. 검색창에 **"Google Sheets API"**를 검색하고 클릭한 후 **"사용(Enable)"** 버튼을 누릅니다.

## 2단계: 서비스 계정(Service Account) 생성

1. 좌측 메뉴에서 **"IAM 및 관리자" > "서비스 계정"**으로 이동합니다.
2. 상단의 **"+ 서비스 계정 만들기"** 버튼을 클릭합니다.
3. **서비스 계정 이름**: `chatbot-logger` 등 원하는 이름을 입력하고 "만들기 및 계속"을 누릅니다.
4. **역할 선택**: "현재 단계 건너뛰기" 또는 "완료"를 눌러도 됩니다 (시트 공유로 권한을 줄 것이므로).
5. 생성이 완료되면 리스트에 새로운 이메일 주소(예: `chatbot-logger@project-id.iam.gserviceaccount.com`)가 보입니다. **이 이메일 주소를 복사해두세요.**

## 3단계: 키(Key) 생성 및 다운로드

1. 방금 만든 서비스 계정을 클릭해서 상세 페이지로 들어갑니다.
2. 상단 탭 중 **"키(Keys)"** 탭을 클릭합니다.
3. **"키 추가" > "새 키 만들기"**를 선택합니다.
4. 키 유형으로 **"JSON"**을 선택하고 "만들기"를 누릅니다.
5. 컴퓨터에 `.json` 파일이 자동으로 다운로드됩니다. 이 파일이 **비밀번호**와 같으므로 절대 남에게 공유하지 마세요.

## 4단계: 구글 시트 공유 설정

1. 로그를 저장할 [구글 시트](https://docs.google.com/spreadsheets/d/1RwHfngUkij84UCCqyu-5TsxRw-wMXExKQCGCTWoqznw/edit?gid=0#gid=0)를 엽니다.
2. 우측 상단의 **"공유(Share)"** 버튼을 클릭합니다.
3. **2단계에서 복사한 서비스 계정 이메일 주소**를 입력합니다.
4. 권한을 **"편집자(Editor)"**로 설정하고 "전송"을 누릅니다.

## 5단계: 환경 변수 입력

1. 다운로드 받은 JSON 파일을 메모장이나 코드 에디터로 엽니다.
2. 파일 내용 중 다음 두 가지 값을 찾습니다:
   - `"client_email"`: 예) `"chatbot-logger@..."`
   - `"private_key"`: 예) `"-----BEGIN PRIVATE KEY-----\nMIIEv...` (매우 깁니다)
3. VS Code에서 `.env.local` 파일을 엽니다.
4. 아래와 같이 붙여넣습니다 (따옴표 안에 넣어주세요):

```env
GOOGLE_SHEETS_CLIENT_EMAIL="복사한_client_email_값"
GOOGLE_SHEETS_PRIVATE_KEY="복사한_private_key_값_전체"
```

> **주의**: `private_key` 값 안에 있는 `\n` (줄바꿈 문자)들도 그대로 다 복사해서 붙여넣으시면 됩니다. 코드가 알아서 처리합니다.

설정이 완료되었습니다! 이제 챗봇이 대화할 때마다 시트에 기록이 남습니다.
