const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const INDEX_FILE = path.join(DATA_DIR, 'knowledge_index.json');

function updateKnowledgeIndex() {
    console.log('Scanning data directory...');

    // Read existing index if it exists
    let existingIndex = [];
    if (fs.existsSync(INDEX_FILE)) {
        try {
            existingIndex = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
        } catch (e) {
            console.error('Error reading existing index:', e);
        }
    }

    // Get list of MD files
    const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.md') && file !== 'knowledge_base.md'); // Exclude the main knowledge_base.md if it's a concatenation or special file, or keep it if it's a valid source. Based on previous context, knowledge_base.md might be the old single file. Let's include it for now but maybe user wants individual files. The user said "knowledge_base.md" exists. Let's include all .md files.

    const newIndex = [];

    files.forEach(file => {
        const existingEntry = existingIndex.find(entry => entry.filename === file);

        if (existingEntry) {
            // Keep existing entry to preserve manual summaries
            newIndex.push(existingEntry);
        } else {
            // Create new entry
            const title = file.replace('.md', '');
            newIndex.push({
                filename: file,
                title: title,
                summary: `Document about ${title}`, // Default summary
                category: 'General' // Default category
            });
            console.log(`Added new file: ${file}`);
        }
    });

    // Write updated index
    fs.writeFileSync(INDEX_FILE, JSON.stringify(newIndex, null, 2), 'utf8');
    console.log(`Updated knowledge index with ${newIndex.length} files.`);
}

updateKnowledgeIndex();
