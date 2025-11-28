(function () {
    // Capture the script element immediately while it's executing
    const script = document.currentScript || document.querySelector('script[src*="embed.js"]');

    function init() {
        if (!script) return;

        const sourceId = script.getAttribute('data-source-id') || 'external';
        const domain = script.getAttribute('data-domain') || 'https://jisanbot.vercel.app';

        // Create Iframe Container
        const container = document.createElement('div');
        container.id = 'jisan-chat-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.transition = 'all 0.3s ease';
        // Initial size for the toggle button
        container.style.width = '60px';
        container.style.height = '60px';
        container.style.boxShadow = 'none'; // Shadow is inside the iframe

        // Create Iframe
        const iframe = document.createElement('iframe');
        // Point to the dedicated widget page
        iframe.src = `${domain}/widget?source=${sourceId}`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.backgroundColor = 'transparent';
        iframe.allow = 'clipboard-write';

        container.appendChild(iframe);
        document.body.appendChild(container);

        // Handle messages from iframe
        window.addEventListener('message', function (event) {
            if (event.data && event.data.type === 'CHAT_OPEN_CHANGED') {
                if (event.data.isOpen) {
                    // Expand to chat window size
                    container.style.width = '400px';
                    container.style.height = '650px';
                    container.style.bottom = '20px';
                    container.style.right = '20px';
                } else {
                    // Shrink to icon size
                    container.style.width = '60px';
                    container.style.height = '60px';
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
