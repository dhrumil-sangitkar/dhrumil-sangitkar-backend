const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAllMedia, getMediaById, createMedia, updateMedia, deleteMedia,
} = require('../controllers/mediaController');

// Public
router.get('/',    getAllMedia);
router.get('/:id', getMediaById);

// Admin-protected
router.post('/',    authMiddleware, createMedia);
router.put('/:id',  authMiddleware, updateMedia);
router.delete('/:id', authMiddleware, deleteMedia);

module.exports = router;
