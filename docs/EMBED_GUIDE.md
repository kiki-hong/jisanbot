# 챗봇 연동 가이드 (Embed Guide)

웹사이트에 지식산업센터 AI 챗봇을 추가하는 방법입니다. 아래 두 가지 방법 중 하나를 선택하여 사용하세요.

## 방법 1: Iframe 사용 (가장 간단함)

원하는 위치(보통 `<body>` 태그의 끝 부분)에 아래 코드를 붙여넣으세요.

```html
<iframe
  src="https://jisanbot.vercel.app/embed?source=YOUR_WEBSITE_NAME"
  width="100%"
  height="600"
  style="position: fixed; bottom: 20px; right: 20px; border: none; z-index: 9999; max-width: 400px; max-height: 80vh; background: transparent;"
  title="JisanBot"
></iframe>
```

* `YOUR_WEBSITE_NAME` 부분을 실제 웹사이트 이름으로 변경하면, 로그에서 유입 경로를 확인할 수 있습니다.
* `style` 속성을 수정하여 위치나 크기를 조절할 수 있습니다.

## 방법 2: 스크립트 태그 (고급)

더 유연한 제어를 위해 자바스크립트를 사용할 수 있습니다.

```html
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = "https://jisanbot.vercel.app/embed?source=" + encodeURIComponent(window.location.hostname);
    iframe.style.position = "fixed";
    iframe.style.bottom = "20px";
    iframe.style.right = "20px";
    iframe.style.width = "400px";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.style.zIndex = "9999";
    iframe.style.maxWidth = "100%";
    iframe.style.maxHeight = "80vh";
    iframe.style.background = "transparent";
    document.body.appendChild(iframe);
  })();
</script>
```

이 코드는 자동으로 현재 호스트네임을 `source` 파라미터로 전달합니다.
