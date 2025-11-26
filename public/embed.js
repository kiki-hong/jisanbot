(function () {
    const script = document.currentScript;
    const sourceId = script.getAttribute('data-source-id') || 'external';
    const domain = script.getAttribute('data-domain') || 'http://localhost:3000'; // Replace with actual domain in production

    // Create Iframe Container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.width = '400px'; // Initial width
    container.style.height = '600px'; // Initial height
    container.style.pointerEvents = 'none'; // Let clicks pass through when closed

    // Create Iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${domain}/embed?source=${sourceId}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = 'transparent';
    iframe.allow = 'clipboard-write'; // Allow copying text

    container.appendChild(iframe);
    document.body.appendChild(container);

    // Handle messages from iframe (e.g., resize)
    // In a real implementation, we would listen for 'open'/'close' events 
    // to adjust the container size/pointer-events so it doesn't block the page.
})();
