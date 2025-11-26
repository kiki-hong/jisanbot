
// Using built-in fetch 
// Node 18+ has built-in fetch.

async function testChat() {
    try {
        const response = await fetch('https://jisanbot.vercel.app/api/chat', {
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

        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        if (!response.ok) {
            console.error('Error status:', response.status);
            console.error('Error text:', await response.text());
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        console.log('Start reading stream...');
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log('Stream done.');
                break;
            }
            const chunk = decoder.decode(value, { stream: true });
            console.log('Received chunk:', chunk);
            process.stdout.write(chunk);
        }
        console.log('\nDone.');
    } catch (error) {
        console.error('Request failed:', error);
    }
}

testChat();
