const { query } = require('../config/db');

// POST /api/booking
async function submitBooking(req, res) {
  const { name, phone, service, eventDate, message } = req.body;

  if (!name || !phone || !service) {
    return res.status(400).json({ success: false, message: 'name, phone, and service are required' });
  }

  // Basic phone validation
  const phoneClean = String(phone).replace(/\s+/g, '');
  if (phoneClean.length < 7 || phoneClean.length > 15) {
    return res.status(400).json({ success: false, message: 'Please enter a valid phone number' });
  }

  try {
    await query(
      `INSERT INTO bookings (name, phone, service, event_date, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [name.trim(), phoneClean, service.trim(), eventDate || null, message?.trim() || null]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been submitted. We will contact you soon.',
    });
  } catch (err) {
    console.error('submitBooking error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit inquiry. Please try again.' });
  }
}

// GET /api/bookings  [Admin only]
async function getAllBookings(req, res) {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM bookings';
    const params = [];

    if (status) {
      sql += ' WHERE status = $1';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('getAllBookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
}

// PATCH /api/bookings/:id/status  [Admin only]
async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const VALID_STATUSES = ['pending', 'read', 'replied'];
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const { rows, rowCount } = await query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking: rows[0] });
  } catch (err) {
    console.error('updateBookingStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update booking status' });
  }
}

module.exports = { submitBooking, getAllBookings, updateBookingStatus };
