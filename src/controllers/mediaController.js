const { query } = require('../config/db');

// ─── Helper: DB row → frontend shape ───────────────────────────
function toMediaItem(row) {
  return {
    id:            row.id,
    title:         row.title,
    gujaratiTitle: row.gujarati_title,
    type:          row.type,
    url:           row.url,
    images:        row.images || [],
    description:   row.description,
    category:      row.category,
    timestamp:     new Date(row.created_at).getTime(),
  };
}

// GET /api/media
async function getAllMedia(req, res) {
  try {
    const { rows } = await query(
      'SELECT * FROM media_gallery ORDER BY created_at DESC'
    );
    res.json(rows.map(toMediaItem));
  } catch (err) {
    console.error('getAllMedia error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
}

// GET /api/media/:id
async function getMediaById(req, res) {
  try {
    const { rows } = await query(
      'SELECT * FROM media_gallery WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Media not found' });
    res.json(toMediaItem(rows[0]));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch media item' });
  }
}

// POST /api/media  [Admin only]
async function createMedia(req, res) {
  const { title, gujaratiTitle, type, url, images, description, category } = req.body;

  if (!title || !type || !url || !category) {
    return res.status(400).json({ success: false, message: 'title, type, url, and category are required' });
  }

  const VALID_TYPES = ['youtube', 'image', 'file_image', 'file_video', 'instagram'];
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: `type must be one of: ${VALID_TYPES.join(', ')}` });
  }

  if (!['Image', 'Video'].includes(category)) {
    return res.status(400).json({ success: false, message: 'category must be Image or Video' });
  }

  try {
    const { rows } = await query(
      `INSERT INTO media_gallery (title, gujarati_title, type, url, images, description, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, gujaratiTitle || null, type, url, images || [], description || null, category]
    );
    res.status(201).json(toMediaItem(rows[0]));
  } catch (err) {
    console.error('createMedia error:', err);
    res.status(500).json({ success: false, message: 'Failed to create media item' });
  }
}

// PUT /api/media/:id  [Admin only]
async function updateMedia(req, res) {
  const { id } = req.params;
  const { title, gujaratiTitle, type, url, images, description, category } = req.body;

  try {
    const { rows: existing } = await query('SELECT id FROM media_gallery WHERE id = $1', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Media not found' });

    const { rows } = await query(
      `UPDATE media_gallery
       SET title         = COALESCE($1, title),
           gujarati_title= COALESCE($2, gujarati_title),
           type          = COALESCE($3, type),
           url           = COALESCE($4, url),
           images        = COALESCE($5, images),
           description   = COALESCE($6, description),
           category      = COALESCE($7, category),
           updated_at    = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, gujaratiTitle, type, url, images, description, category, id]
    );
    res.json(toMediaItem(rows[0]));
  } catch (err) {
    console.error('updateMedia error:', err);
    res.status(500).json({ success: false, message: 'Failed to update media item' });
  }
}

// DELETE /api/media/:id  [Admin only]
async function deleteMedia(req, res) {
  const { id } = req.params;

  try {
    const { rowCount } = await query('DELETE FROM media_gallery WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Media not found' });
    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (err) {
    console.error('deleteMedia error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete media item' });
  }
}

module.exports = { getAllMedia, getMediaById, createMedia, updateMedia, deleteMedia };
