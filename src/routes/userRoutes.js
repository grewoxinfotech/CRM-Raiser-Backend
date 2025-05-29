import express from 'express';
import { getCreatedUsers } from '../controllers/userControllers/index.js';

import { authenticateUser, checkRole } from '../middlewares/index.js';

const router = express.Router();

router.use(authenticateUser, checkRole);

// Route to get users created by a specific user
router.get('/', getCreatedUsers.validator, getCreatedUsers.handler);

export default router; 