import fs from 'fs';
import path from 'path';


// Simple in-memory RAG for prototype
// In production, this would connect to Vertex AI Search or a Vector DB

export async function getContext(query: string): Promise<string> {
  try {
    // Try to find the data directory in multiple common locations
    // In Vercel, process.cwd() is usually the project root.
    const possiblePaths = [
      path.join(process.cwd(), 'data'),
      path.join(process.cwd(), 'public', 'data'), // Sometimes useful to put in public
      path.join(__dirname, 'data'),
      path.join(__dirname, '..', 'data'),
      path.join(__dirname, '..', '..', 'data'),
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
      return "지식베이스를 찾을 수 없습니다. (시스템 점검 중)";
    }

    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.md'));
    console.log(`[RAG] Found ${files.length} files in ${dataDir}`);

    let allContent = "";

    // Always include these core files if they exist
    const coreFiles = ['knowledge_base.md', '지식산업센터입주가능업종.md', '분양자 준수사항.md'];

    // Keyword mapping for large legal documents
    const keywordMap: { [key: string]: string[] } = {
      '건축': ['건축법'],
      '국토': ['국토의 계획'],
      '용도': ['국토의 계획'],
      '벤처': ['벤처기업'],
      '산업단지': ['산업단지'],
      '산업입지': ['산업입지'],
      '산업집적': ['산업집적', '공장설립'],
      '공장': ['산업집적', '공장설립'],
      '수도권': ['수도권정비'],
      '과밀': ['수도권정비'],
      '세금': ['지방세'],
      '취득세': ['지방세'],
      '재산세': ['지방세'],
      '감면': ['지방세'],
      '지방세': ['지방세'],
    };

    const relevantFiles = new Set<string>();

    // Add core files
    files.forEach(file => {
      if (coreFiles.includes(file)) {
        relevantFiles.add(file);
      }
    });

    // Add files matching keywords
    Object.keys(keywordMap).forEach(keyword => {
      if (query.includes(keyword)) {
        const targetSubstrings = keywordMap[keyword];
        files.forEach(file => {
          if (targetSubstrings.some(sub => file.includes(sub))) {
            relevantFiles.add(file);
          }
        });
      }
    });

    // If no specific legal keywords found, maybe we shouldn't include ALL laws.
    // But if the query is very generic, we might miss context. 
    // For now, let's stick to core + matched. 
    // If relevantFiles is just core files, maybe add a note?

    console.log(`[RAG] Selected ${relevantFiles.size} relevant files for query: "${query}"`);

    for (const file of relevantFiles) {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      allContent += `\n\n--- Source: ${file} ---\n\n${fileContent}`;
    }

    return allContent;
  } catch (error) {
    console.error("Error reading knowledge base:", error);
    return `Error loading knowledge base: ${error}`;
  }
}

