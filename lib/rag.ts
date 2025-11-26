import fs from 'fs';
import path from 'path';


// Simple in-memory RAG for prototype
// In production, this would connect to Vertex AI Search or a Vector DB

export async function getContext(query: string): Promise<string> {
  try {
    // Try to find the data directory in multiple common locations
    const possiblePaths = [
      path.join(process.cwd(), 'data'),
      path.join(process.cwd(), '.next/server/data'),
      path.join(__dirname, '../../../../data'), // Relative to .next/server/app/api/chat/route.js
    ];

    let dataDir = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        dataDir = p;
        break;
      }
    }

    if (!dataDir) {
      console.error("[RAG] Data directory not found in:", possiblePaths);
      console.error("[RAG] Current working directory:", process.cwd());
      console.error("[RAG] __dirname:", __dirname);
      return "지식 베이스를 찾을 수 없습니다. (시스템 점검 중)";
    }

    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.md'));
    console.log(`[RAG] Loaded ${files.length} files from ${dataDir}`);

    let allContent = "";

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      allContent += `\n\n--- Source: ${file} ---\n\n${fileContent}`;
    }

    // For this prototype, we return the concatenated content of all markdown files.
    // In a real scenario, we would chunk this and search for relevant chunks.
    return allContent;
  } catch (error) {
    console.error("Error reading knowledge base:", error);
    return `Error loading knowledge base: ${error}`;
  }
}
