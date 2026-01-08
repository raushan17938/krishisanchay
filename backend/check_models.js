import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Checking models for API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");

    try {
        // For listing models, we don't need to get specific model content
        // But the SDK doesn't expose listModels directly on the main class in some versions, 
        // or it might be on the client. 
        // Actually, looking at docs, it's usually accessible via API call, but SDK simplifies it.
        // Let's try getting a model and seeing if we can force an error that lists models, 
        // OR we can rely on standard fetch if SDK doesn't have it handy.
        // Wait, recent SDKs might not have listModels exposed easily.
        // Let's try a simple fetch to the endpoint if SDK fails.

        // Attempt 1: Using SDK if method exists (it might not on the main class instance directly without accessing model manager)
        // Actually, let's just try to use a model we know SHOULD exist and print success/fail.
        // Or better, standard `gemini-1.5-flash` should work.

        // Let's try to infer from error of an invalid model if possible, but the error gave us "Call ListModels to see...".

        // Let's use a direct fetch to the API to list models.
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.error("Failed to list models:", data);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
