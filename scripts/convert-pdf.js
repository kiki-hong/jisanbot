
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
console.log('pdf-parse export type:', typeof pdf);
console.log('pdf-parse export:', pdf);

const rawDir = path.join(process.cwd(), 'data', 'raw');
const dataDir = path.join(process.cwd(), 'data');

async function convertPdfs() {
    try {
        if (!fs.existsSync(rawDir)) {
            console.error('Raw directory not found:', rawDir);
            return;
        }

        const files = fs.readdirSync(rawDir).filter(file => file.toLowerCase().endsWith('.pdf'));
        console.log(`Found ${files.length} PDF files.`);

        let convertedCount = 0;
        let skippedCount = 0;

        for (const file of files) {
            const filePath = path.join(rawDir, file);
            const mdFileName = file.replace(/\.pdf$/i, '.md');
            const mdFilePath = path.join(dataDir, mdFileName);

            // Check if conversion is needed
            if (fs.existsSync(mdFilePath)) {
                const pdfStats = fs.statSync(filePath);
                const mdStats = fs.statSync(mdFilePath);

                if (pdfStats.mtime <= mdStats.mtime) {
                    console.log(`Skipping: ${file} (already up to date)`);
                    skippedCount++;
                    continue;
                }
            }

            const dataBuffer = fs.readFileSync(filePath);

            console.log(`Converting: ${file}...`);

            let parser;
            try {
                // Initialize parser with data buffer
                parser = new pdf.PDFParse({ data: dataBuffer });

                // Extract text
                const data = await parser.getText();
                const text = data.text;

                // Simple cleanup: remove excessive newlines
                const cleanText = text.replace(/\n\s*\n/g, '\n\n');

                const mdContent = `# ${file}\n\n${cleanText}`;

                fs.writeFileSync(mdFilePath, mdContent);
                console.log(`Saved to: ${mdFileName}`);
                convertedCount++;
            } catch (err) {
                console.error(`Failed to convert ${file}:`, err.message);
            } finally {
                if (parser) {
                    await parser.destroy();
                }
            }
        }
        console.log(`Conversion complete. Converted: ${convertedCount}, Skipped: ${skippedCount}`);
    } catch (error) {
        console.error('Error during conversion:', error);
    }
}

convertPdfs();
