import axios from "axios";

// Kullanıcı bazlı chat history
let chatHistoryMap = {};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = req.query.user;
  const chat = req.query.chat;
  const model = req.query.model || "microsoft/DialoGPT-medium"; // default model

  if (!user || !chat) {
    return res.status(400).json({ error: "user ve chat parametreleri gerekli" });
  }

  // Kullanıcıya özel chat history (son 10 mesaj)
  if (!chatHistoryMap[user]) chatHistoryMap[user] = [];
  const userHistory = chatHistoryMap[user].slice(-10);

  const conversation = [...userHistory, `User (${user}): ${chat}`].join("\n");

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: conversation },
      {
        headers: {
          Authorization: `Bearer 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`,
        },
        timeout: 15000,
      }
    );

    let botReply = "Üzgünüm, cevap alınamadı.";

    if (Array.isArray(response.data) && response.data[0].generated_text) {
      botReply = response.data[0].generated_text;
    } else if (typeof response.data === "string") {
      botReply = response.data;
    }

    // Chat history güncelle
    chatHistoryMap[user].push(`User (${user}): ${chat}`);
    chatHistoryMap[user].push(`Bot: ${botReply}`);

    res.status(200).json({ reply: botReply });
  } catch (err) {
    console.error("Hugging Face API Hatası:", err.message);
    res.status(500).json({ error: "Hugging Face API error", details: err.message });
  }
}
