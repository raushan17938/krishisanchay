import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not set in environment variables");
        }
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    async chat(history, message, language = 'en') {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            // Add system instruction for language
            const systemInstruction = {
                role: 'user',
                parts: [{ text: `You are an expert agricultural advisor. Respond in the following language code: ${language}. If the language is 'hi' (Hindi), 'pa' (Punjabi), or 'mr' (Marathi), use that script. Keep responses helpful and concise for farmers.` }]
            };

            // Convert simple history format to Gemini format if needed
            // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
            const chatHistory = history.map(msg => ({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            // Prepend system instruction to history to guide the model
            const fullHistory = [systemInstruction, ...chatHistory];

            const chat = model.startChat({
                history: fullHistory,
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Chat Error:", error);
            throw new Error("Failed to get response from AI");
        }
    }

    async analyzeImage(imageBuffer, mimeType, language = 'en') {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            const prompt = `You are an expert agriculturalist and plant pathologist (Crop Doctor). 
            Analyze this image of a plant/crop.
            
            IMPORTANT: Provide the response values in the following language: ${language}.
            
            Identify:
            1. The name of the crop.
            2. Any visible disease or deficiency. If healthy, say so.
            3. Severity (Low/Medium/High).
            4. Confidence level (0-100%).
            5. Treatment recommendations (2-3 points).
            6. Prevention tips (2-3 points).
            
            Format the response as a valid JSON object with these keys (keys must remain in English, values in ${language}):
            {
                "disease": "Disease Name or Healthy",
                "severity": "Low/Medium/High",
                "confidence": Number,
                "treatment": ["tip1", "tip2"],
                "prevention": ["tip1", "tip2"]
            }
            Respond ONLY with the JSON string, no markdown formatting.`;

            const imagePart = {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: mimeType,
                },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            // Clean up code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();


            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Gemini Vision Error:", error);
            console.error("Gemini Vision Error Details:", error.message, error.response); // More details
            throw new Error("Failed to analyze image");
        }
    }
}

export default new GeminiService();
