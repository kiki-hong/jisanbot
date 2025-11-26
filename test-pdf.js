
const pdf = require('pdf-parse');
console.log('Keys:', Object.keys(pdf));
console.log('PDFParse type:', typeof pdf.PDFParse);
try {
    const instance = new pdf.PDFParse();
    console.log('PDFParse instance:', instance);
} catch (e) {
    console.log('PDFParse instantiation failed:', e.message);
}

// Try to find if there is a default function hidden or if I need to use a specific method
if (pdf.default) {
    console.log('pdf.default type:', typeof pdf.default);
}
