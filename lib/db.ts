import fs from 'fs';
import path from 'path';

// Mock DB for logging
// In production, use Firestore or Supabase

const LOG_FILE = path.join(process.cwd(), 'data', 'chat_logs.json');

export async function logChat(sourceId: string, message: string, response: string) {
    const logEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        sourceId,
        message,
        response
    };

    try {
        let logs = [];
        if (fs.existsSync(LOG_FILE)) {
            const content = fs.readFileSync(LOG_FILE, 'utf-8');
            logs = JSON.parse(content);
        }
        logs.push(logEntry);

        // In Vercel (production), the filesystem is read-only.
        // We only write to file in development mode.
        if (process.env.NODE_ENV !== 'production') {
            fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
            console.log(`[DB] Logged chat from ${sourceId}`);
        } else {
            console.log(`[DB] Skipped file write in production for ${sourceId}`);
        }
    } catch (error) {
        console.error("Error logging chat:", error);
    }
}
