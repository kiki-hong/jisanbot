(function () {
    // Capture the script element immediately while it's executing
    const script = document.currentScript || document.querySelector('script[src*="embed.js"]');

    function init() {
        if (!script) return;

        const sourceId = script.getAttribute('data-source-id') || 'external';
        const domain = script.getAttribute('data-domain') || 'https://jisanbot.vercel.app';

        // Custom position configuration
        const bottomPos = script.getAttribute('data-bottom') || '80px';
        const rightPos = script.getAttribute('data-right') || '20px';

        // Create Iframe Container
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = bottomPos;
        container.style.right = rightPos;
        container.style.zIndex = '9999';
        container.style.transition = 'all 0.3s ease';
        // Initial size for the toggle button
        container.style.width = '90px';
        container.style.height = '90px';
        container.style.boxShadow = 'none';
        container.style.border = 'none';
        container.style.background = 'transparent';

        // Create Iframe
        const iframe = document.createElement('iframe');
        iframe.src = `${domain}/widget?source=${sourceId}`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.backgroundColor = 'transparent';
        iframe.setAttribute('allowTransparency', 'true');
        iframe.allow = 'clipboard-write';

        container.appendChild(iframe);
        document.body.appendChild(container);

        // Handle messages from iframe
        window.addEventListener('message', function (event) {
            if (event.data && event.data.type === 'CHAT_OPEN_CHANGED') {
                if (event.data.isOpen) {
                    // Expand to chat window size
                    container.style.width = '400px';
                    container.style.maxWidth = '80%';
                    container.style.height = '650px';
                    container.style.maxHeight = '80%';
                    container.style.bottom = '20px'; // Always center/bottom when open? Or respect custom?
                    // Let's keep it simple: when open, it usually needs to be visible. 
                    // If custom bottom is very high, it might float weirdly.
                    // But for now, let's reset to standard 'bottom' when open to ensure it fits.
                    container.style.bottom = '20px';
                    container.style.right = '20px';
                } else {
                    // Shrink to icon size
                    container.style.width = '90px';
                    container.style.height = '90px';
                    // Restore custom position
                    container.style.bottom = bottomPos;
                    container.style.right = rightPos;
                }
            }
        });
    }

    function tryInit() {
        if (document.body) {
            init();
        } else {
            document.addEventListener('DOMContentLoaded', init);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        tryInit();
    }
})();
