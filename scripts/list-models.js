const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error("No API key found.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Access the model directly or via a manager if available, but the SDK structure is usually:
    // actually, listing models might require using the model manager or just trying to get a model.
    // The JS SDK doesn't always expose listModels directly on the main class in all versions.
    // Let's try to just instantiate a model and run a simple prompt, or check if we can list.

    // According to docs, we might need to use the REST API to list models if the SDK doesn't expose it easily,
    // or use the ModelManager if it exists.
    // Let's try to use the REST API for listing models to be sure.

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available Models:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
