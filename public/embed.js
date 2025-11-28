(function () {
    // Capture the script element immediately while it's executing
    const script = document.currentScript || document.querySelector('script[src*="embed.js"]');

    function init() {
        if (!script) return;

        const sourceId = script.getAttribute('data-source-id') || 'external';
        const domain = script.getAttribute('data-domain') || 'https://jisanbot.vercel.app';

        // Create Iframe Container
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '80px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.transition = 'all 0.3s ease';
        // Initial size for the toggle button (increased to prevent clipping on hover)
        container.style.width = '90px';
        container.style.height = '90px';
        container.style.boxShadow = 'none';
        container.style.border = 'none';
        container.style.background = 'transparent';

        // Create Iframe
        const iframe = document.createElement('iframe');
        // Point to the dedicated widget page
        iframe.src = `${domain}/widget?source=${sourceId}`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.backgroundColor = 'transparent';
        iframe.setAttribute('allowTransparency', 'true');
        iframe.allow = 'clipboard-write';

        container.appendChild(iframe);
        document.body.appendChild(container);

        container.style.right = '20px';
    }
}
        });
    }

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
}) ();
