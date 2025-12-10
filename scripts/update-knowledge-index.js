const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const indexFile = path.join(dataDir, 'knowledge_index.json');

// Function to clean title
function cleanTitle(filename) {
    // Remove extension
    let title = filename.replace('.md', '');

    // Remove (법률), (대통령령), (시행규칙) etc.
    title = title.replace(/\((법률|대통령령|시행규칙|고시|훈령|조례)\)/g, '');

    // Remove (제...호)
    title = title.replace(/\(제[^)]+호\)/g, '');

    // Remove dates like (20240101) or (2024.1.1)
    title = title.replace(/\(\d{4}\.?\d{0,2}\.?\d{0,2}\)/g, '');

    // Remove leading/trailing spaces
    return title.trim();
}

// Function to determine category based on filename keywords
function getCategory(filename) {
    if (filename.includes('건축')) return 'Construction';
    if (filename.includes('국토')) return 'LandUse';
    if (filename.includes('산업') || filename.includes('공장')) return 'Industry';
    if (filename.includes('조세') || filename.includes('지방세')) return 'Tax';
    if (filename.includes('벤처')) return 'Venture';
    if (filename.includes('수도권')) return 'Capital';
    if (filename.includes('녹색')) return 'Green';

    // Fallback for other legal documents
    if (filename.includes('법') || filename.includes('령') || filename.includes('규칙')) {
        return 'Legal';
    }

    return 'General';
}

// Function to generate summary from content
function generateSummary(content, title, category) {
    let summaryParts = [];

    // 1. Extract Keywords from Article 2 (Definitions) - High priority for relevance
    // Look for content between "제2조(정의)" and the next Article "제3조" or similar header
    const definitionMatch = content.match(/제2조\s*\((정의|용어의 정의)\)([\s\S]*?)(?=\n제\d+조|\n#|$)/);

    if (definitionMatch && definitionMatch[2]) {
        const defContent = definitionMatch[2];
        // Extract terms usually quoted like "용어" or before '란'
        // Regex to find terms: 1. "Term"란 ... or 1. "Term"이라 ...
        const termMatches = defContent.matchAll(/["“]([^"”]+)["”]\s*(?:이란|란|이라)/g);
        let terms = [];
        for (const match of termMatches) {
            terms.push(match[1]);
        }

        // If no quotes found, try bullet points identifiers if available, but legal text usually uses quotes.
        // Fallback: just extract the first few lines if no specific terms found? 
        // Better: if terms found, list them.
        if (terms.length > 0) {
            // Remove duplicates and join
            const uniqueTerms = [...new Set(terms)];
            summaryParts.push(`**주요 용어(Keywords)**: ${uniqueTerms.join(', ')}`);
        } else {
            // If definitions exist but regex didn't catch quoted terms, take a snippet
            let cleanDef = defContent.replace(/\s+/g, ' ').trim();
            if (cleanDef.length > 200) cleanDef = cleanDef.substring(0, 197) + '...';
            summaryParts.push(`**정의**: ${cleanDef}`);
        }
    }

    // 2. Extract Chapter Titles - Gives structure overview
    if (category !== 'General') {
        const chapterMatches = content.matchAll(/제(\d+)장\s+([^\n]+)/g);
        let chapters = [];
        for (const match of chapterMatches) {
            // match[2] is the title
            chapters.push(match[2].trim());
        }
        if (chapters.length > 0) {
            // Limit number of chapters
            const chapterText = '**목차(Contents)**: ' + chapters.slice(0, 15).join(', ') + (chapters.length > 15 ? ' 등' : '');
            summaryParts.push(chapterText);
        }
    }

    // 3. Fallback: Purpose (Article 1) if no definitions found
    if (summaryParts.length === 0) {
        const purposeMatch = content.match(/제1조\s*\((목적|목 적)\)([\s\S]*?)(?=\n제\d+조|\n#|$)/);
        if (purposeMatch && purposeMatch[2]) {
            let purpose = purposeMatch[2].trim().replace(/\s+/g, ' ');
            if (purpose.length > 200) purpose = purpose.substring(0, 197) + '...';
            summaryParts.push(`**목적**: ${purpose}`);
        }
    }

    // 4. Final Fallback for non-standard files
    if (summaryParts.length === 0) {
        const lines = content.split('\n');
        let summaryText = '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('법제처') || trimmed.match(/^\d+\s+국가법령정보센터/)) {
                continue;
            }
            summaryText += trimmed + ' ';
            if (summaryText.length > 150) break;
        }
        if (summaryText) {
            summaryParts.push(summaryText.trim());
        }
    }

    if (summaryParts.length > 0) {
        return summaryParts.join('\n\n');
    }

    return `Document about ${title}`;
}

function updateIndex() {
    let index = [];
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.md'));

    files.forEach(file => {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        const title = cleanTitle(file);
        const category = getCategory(file);
        const summary = generateSummary(content, title, category);

        index.push({
            filename: file,
            title: title,
            summary: summary,
            category: category
        });

        console.log(`Processed: ${title} [${category}]`);
    });

    fs.writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf8');
    console.log(`Updated knowledge index with ${index.length} documents.`);
}

updateIndex();
