# 챗봇 연동 가이드

지식산업센터 챗봇을 귀하의 웹사이트에 연동하는 3가지 방법입니다.

## 1. 위젯 스크립트 (추천)
웹사이트 우측 하단에 챗봇 아이콘을 띄우는 방식입니다. 아이콘을 클릭하면 채팅창이 열립니다.

HTML 파일의 `<head>` 태그 안쪽이나 `</body>` 태그 바로 앞에 아래 스크립트를 추가하세요.
(페이지가 많은 사이트의 경우 공통 헤더나 `<head>`에 넣으면 모든 페이지에 적용되어 편리합니다.)

```html
<script 
  src="https://jisanbot.vercel.app/embed.js" 
  data-source-id="your-website-id"
  data-domain="https://jisanbot.vercel.app"
  async
></script>
```

- `data-source-id`: 웹사이트 식별자 (선택 사항, 통계용).
- `data-domain`: 챗봇이 호스팅된 도메인 주소.

## 2. Iframe 임베드 (삽입)
페이지의 특정 영역(예: 사이드바, 문의 섹션)에 채팅창을 직접 삽입하는 방식입니다.

```html
<iframe 
  src="https://jisanbot.vercel.app/embed?source=your-website-id"
  width="100%"
  height="600px"
  frameborder="0"
  style="border: 1px solid #e2e8f0; border-radius: 12px;"
></iframe>
```

## 3. 직접 링크 / 새 창 열기
챗봇 페이지로 바로 이동하는 링크를 제공하는 방식입니다.
`/widget` 주소를 사용하면 **우측 하단에 아이콘이 먼저 뜨고**, 클릭하면 채팅창이 열립니다.
`?source=...` 파라미터를 붙이면 어떤 사이트에서 접속했는지 로그를 남길 수 있습니다.

<div style="text-align: center; margin: 20px 0;">
  <button 
    onclick="openChatPopup()"
    style="
      background-color: #2563eb; 
      color: white; 
      padding: 12px 24px; 
      border: none; 
      border-radius: 25px; 
      font-size: 16px; 
      font-weight: bold; 
      cursor: pointer; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
      transition: background-color 0.2s;
    "
    onmouseover="this.style.backgroundColor='#1d4ed8'"
    onmouseout="this.style.backgroundColor='#2563eb'"
  >
    챗봇 상담하기
  </button>
</div>

<script>
function openChatPopup() {
  const width = 400;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  window.open(
    'https://jisanbot.vercel.app/embed?source=popup', 
    'JisanBot', 
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
  );
}
</script>
