require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testSheetConnection() {
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

    console.log('Checking credentials...');
    if (!SPREADSHEET_ID) console.error('❌ Missing GOOGLE_SHEETS_SPREADSHEET_ID');
    if (!CLIENT_EMAIL) console.error('❌ Missing GOOGLE_SHEETS_CLIENT_EMAIL');

    if (PRIVATE_KEY) {
        console.log('Private Key Check:');
        console.log(`  - Length: ${PRIVATE_KEY.length}`);
        console.log(`  - Starts with BEGIN?: ${PRIVATE_KEY.trim().startsWith('-----BEGIN PRIVATE KEY-----')}`);
        console.log(`  - Ends with END?: ${PRIVATE_KEY.trim().endsWith('-----END PRIVATE KEY-----')}`);
        console.log(`  - Contains newlines?: ${PRIVATE_KEY.includes('\n')}`);
        console.log(`  - First 30 chars: ${PRIVATE_KEY.substring(0, 30)}...`);
    } else {
        console.error('❌ Missing GOOGLE_SHEETS_PRIVATE_KEY');
    }

    if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
        console.log('Please check your .env.local file.');
        return;
    }

    console.log(`Spreadsheet ID: ${SPREADSHEET_ID}`);
    console.log(`Client Email: ${CLIENT_EMAIL}`);

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: CLIENT_EMAIL,
                private_key: PRIVATE_KEY,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        console.log('Attempting to fetch spreadsheet details...');
        const metadata = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        console.log('Available Sheets:', metadata.data.sheets.map(s => s.properties.title).join(', '));

        console.log('Attempting to append a test row...');

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'log1!A:G',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[new Date().toISOString(), '127.0.0.1', 'https://example.com/chat-page', 'Mozilla/5.0...', 'TEST_SOURCE', 'Test Question', 'Test Answer']],
            },
        });

        console.log('✅ Success! Test row appended to Google Sheet.');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        if (error.message.includes('insufficient authentication scopes') || error.message.includes('caller does not have permission')) {
            console.log('👉 Hint: Did you share the Google Sheet with the client email?');
        }
    }
}

testSheetConnection();
