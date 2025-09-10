import axios from "axios";

let chatHistory = []; // Geçici chat history, sunucu çalıştığı sürece geçerli

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = req.query.user;
  const chat = req.query.chat;
  const model = req.query.model || "microsoft/DialoGPT-medium"; // Default model

  if (!user || !chat) return res.status(400).json({ error: "user ve chat parametreleri gerekli" });

  const conversation = [...chatHistory, `User (${user}): ${chat}`].join("\n");

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: conversation },
      { headers: { Authorization: `Bearer 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` } }
    );

    const botReply = response.data[0].generated_text;

    // Chat history güncelle
    chatHistory.push(`User (${user}): ${chat}`);
    chatHistory.push(`Bot: ${botReply}`);

    res.status(200).json({ reply: botReply });
  } catch (err) {
    res.status(500).json({ error: "Hugging Face API error", details: err.message });
  }
}
