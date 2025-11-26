import fs from 'fs';
import path from 'path';

// Simple in-memory RAG for prototype
// In production, this would connect to Vertex AI Search or a Vector DB

export async function getContext(query: string): Promise<string> {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.md'));

    let allContent = "";

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      allContent += `\n\n--- Source: ${file} ---\n\n${fileContent}`;
    }

    // For this prototype, we return the concatenated content of all markdown files.
    // In a real scenario, we would chunk this and search for relevant chunks.
    console.log(`[RAG] Loaded ${files.length} files from ${dataDir}`);
    return allContent;
  } catch (error) {
    console.error("Error reading knowledge base:", error);
    return `Error loading knowledge base: ${error}`;
  }
}
