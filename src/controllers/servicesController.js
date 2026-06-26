const { query } = require('../config/db');

// ─── Helper: DB row → frontend shape ───────────────────────────
function toServiceItem(row) {
  return {
    id:        row.id,
    icon:      row.icon,
    name:      row.name,
    gujarati:  row.gujarati,
    desc:      row.description,
    timestamp: new Date(row.created_at).getTime(),
  };
}

// GET /api/services
async function getAllServices(req, res) {
  try {
    const { rows } = await query(
      'SELECT * FROM services ORDER BY sort_order ASC, created_at ASC'
    );
    res.json(rows.map(toServiceItem));
  } catch (err) {
    console.error('getAllServices error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
}

// GET /api/services/:id
async function getServiceById(req, res) {
  try {
    const { rows } = await query('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json(toServiceItem(rows[0]));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch service' });
  }
}

// POST /api/services  [Admin only]
async function createService(req, res) {
  const { icon, name, gujarati, desc } = req.body;

  if (!icon || !name) {
    return res.status(400).json({ success: false, message: 'icon and name are required' });
  }

  try {
    // Auto-assign next sort_order
    const { rows: countRows } = await query('SELECT COUNT(*) FROM services');
    const sortOrder = parseInt(countRows[0].count) + 1;

    const { rows } = await query(
      `INSERT INTO services (icon, name, gujarati, description, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [icon, name, gujarati || null, desc || null, sortOrder]
    );
    res.status(201).json(toServiceItem(rows[0]));
  } catch (err) {
    console.error('createService error:', err);
    res.status(500).json({ success: false, message: 'Failed to create service' });
  }
}

// PUT /api/services/:id  [Admin only]
async function updateService(req, res) {
  const { id } = req.params;
  const { icon, name, gujarati, desc } = req.body;

  try {
    const { rows: existing } = await query('SELECT id FROM services WHERE id = $1', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Service not found' });

    const { rows } = await query(
      `UPDATE services
       SET icon        = COALESCE($1, icon),
           name        = COALESCE($2, name),
           gujarati    = COALESCE($3, gujarati),
           description = COALESCE($4, description),
           updated_at  = NOW()
       WHERE id = $5
       RETURNING *`,
      [icon, name, gujarati, desc, id]
    );
    res.json(toServiceItem(rows[0]));
  } catch (err) {
    console.error('updateService error:', err);
    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
}

// DELETE /api/services/:id  [Admin only]
async function deleteService(req, res) {
  const { id } = req.params;

  try {
    const { rowCount } = await query('DELETE FROM services WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (err) {
    console.error('deleteService error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
}

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };
