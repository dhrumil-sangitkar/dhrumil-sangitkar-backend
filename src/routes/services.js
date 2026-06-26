const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAllServices, getServiceById, createService, updateService, deleteService,
} = require('../controllers/servicesController');

// Public
router.get('/',    getAllServices);
router.get('/:id', getServiceById);

// Admin-protected
router.post('/',    authMiddleware, createService);
router.put('/:id',  authMiddleware, updateService);
router.delete('/:id', authMiddleware, deleteService);

module.exports = router;
