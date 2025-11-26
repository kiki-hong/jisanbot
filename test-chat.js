
// Using built-in fetch 
// Node 18+ has built-in fetch.

async function testChat() {
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'user', content: '지식산업센터란 무엇인가요?' }
                ]
            }),
        });

        if (!response.ok) {
            console.error('Error status:', response.status);
            console.error('Error text:', await response.text());
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            process.stdout.write(decoder.decode(value));
        }
        console.log('\nDone.');
    } catch (error) {
        console.error('Request failed:', error);
    }
}

testChat();
