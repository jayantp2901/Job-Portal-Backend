import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ reply: "❌ Error: No message provided." });
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(userMessage);
        const botReply = result.response.text();

        res.json({ reply: botReply });
    } catch (error) {
        console.error("Chatbot API Error:", error.message);
        res.status(500).json({ reply: "❌ Error: Unable to fetch response." });
    }
});

export default router;
