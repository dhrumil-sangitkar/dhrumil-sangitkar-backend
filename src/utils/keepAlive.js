/**
 * Keep-Alive Pinger
 * Pings our own /health endpoint every 10 minutes so Render never spins down.
 * Render free tier spins down after 15 min of inactivity — we ping every 10.
 */
function startKeepAlive() {
  const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;

  if (!BACKEND_URL) {
    console.log('Keep-alive skipped (no RENDER_EXTERNAL_URL — local dev mode)');
    return;
  }

  const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

  const ping = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      const data = await res.json();
      console.log(`Keep-alive ping OK at ${new Date().toISOString()}`);
    } catch (err) {
      console.warn('Keep-alive ping failed:', err.message);
    }
  };

  // Start pinging after 2 min delay, then every 10 min
  setTimeout(() => {
    ping();
    setInterval(ping, PING_INTERVAL);
  }, 2 * 60 * 1000);

  console.log('Keep-alive pinger started (every 10 min)');
}

module.exports = { startKeepAlive };
