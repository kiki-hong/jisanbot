# Implementation Plan - Google Sheets Logging

The goal is to log chat interactions (Question, Answer, IP, Referer, Timestamp) to a specific Google Sheet.

## User Review Required
> [!IMPORTANT]
> **Google Cloud Service Account Required**
> To write to Google Sheets from the server, we need a **Service Account**.
> 1. Create a Service Account in Google Cloud Console.
> 2. Download the JSON key file.
> 3. **Share the Google Sheet** (`1RwHfngUkij84UCCqyu-5TsxRw-wMXExKQCGCTWoqznw`) with the Service Account's email address (giving it "Editor" permission).
> 4. Add the JSON key contents to `.env.local` (we will use a simplified approach of putting the specific fields we need: `GOOGLE_SHEETS_CLIENT_EMAIL` and `GOOGLE_SHEETS_PRIVATE_KEY`).

## Proposed Changes

### Dependencies
- [NEW] Install `googleapis` package.

### Configuration
- [MODIFY] `.env.local` to include:
  - `GOOGLE_SHEETS_SPREADSHEET_ID`
  - `GOOGLE_SHEETS_CLIENT_EMAIL`
  - `GOOGLE_SHEETS_PRIVATE_KEY`

### Library
- [NEW] `lib/google-sheets.ts`
  - Initialize GoogleAuth.
  - Function `appendLogToSheet(data: LogData)` to append a row.

### API
- [MODIFY] `app/api/chat/route.ts`
  - Extract `x-forwarded-for` (IP) and `referer` headers.
  - Call `appendLogToSheet` in the `onFinish` callback (in parallel with existing file logging).

## Verification Plan
### Automated Tests
- None (requires live Google API interaction).

### Manual Verification
- Trigger a chat message.
- Check server logs for success/error message from Google Sheets API.
- (User Action) Check the actual Google Sheet to see if the row appeared.
