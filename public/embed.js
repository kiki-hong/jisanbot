(function () {
    // Capture the script element immediately while it's executing
    const script = document.currentScript || document.querySelector('script[src*="embed.js"]');

    function init() {
        if (!script) return;

        const sourceId = script.getAttribute('data-source-id') || 'external';
        const domain = script.getAttribute('data-domain') || 'https://jisanbot.vercel.app';

        // Create Iframe Container
        const container = document.createElement('div');
        window.addEventListener('message', function (event) {
            if (event.data && event.data.type === 'CHAT_OPEN_CHANGED') {
                if (event.data.isOpen) {
                    // Expand to chat window size
                    container.style.width = '400px';
                    container.style.height = '650px';
                    container.style.bottom = '20px';
                    container.style.right = '20px';
                } else {
                    // Shrink to icon size (match initial size)
                    container.style.width = '90px';
                    container.style.height = '90px';
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
