
// Using built-in fetch 
// Node 18+ has built-in fetch.

async function testChat() {
    try {
        console.log('Sending request to https://jisanbot.vercel.app/api/chat...');
        const response = await fetch('https://jisanbot.vercel.app/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'user', content: '테스트입니다.' }
                ]
            }),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        if (!response.ok) {
            console.error('Error status:', response.status);
            const text = await response.text();
            console.error('Error text:', text);
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

console.time('Total Duration');
testChat().then(() => {
    console.timeEnd('Total Duration');
});
