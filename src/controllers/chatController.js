const rateLimit = require('express-rate-limit');

// ─── Rate limit: 20 messages per IP per hour ──────────────────
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many messages. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/chat
async function chat(req, res) {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: 'messages array is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, message: 'AI service not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', // Fast + cheap for chatbot
        max_tokens: 1000,
        system: system || '',
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({ success: false, message: data.error?.message || 'AI service error' });
    }

    const text = data.content?.[0]?.text || 'Pranam! I could not process that. Please try again.';
    res.json({ success: true, text });

  } catch (err) {
    console.error('Chat proxy error:', err);
    res.status(500).json({ success: false, message: 'Network error reaching AI service' });
  }
}

module.exports = { chat, chatLimiter };
