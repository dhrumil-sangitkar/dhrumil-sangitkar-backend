const jwt = require('jsonwebtoken');
require('dotenv').config();

async function verifyPin(req, res) {
  const { pin } = req.body;

  if (!pin) {
    return res.status(400).json({ success: false, message: 'PIN is required' });
  }

  const adminPin = process.env.ADMIN_PIN || '1234';

  if (String(pin) !== String(adminPin)) {
    return res.status(401).json({ success: false, message: 'Invalid PIN' });
  }

  const token = jwt.sign(
    { role: 'admin', iat: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return res.json({ success: true, token });
}

module.exports = { verifyPin };
