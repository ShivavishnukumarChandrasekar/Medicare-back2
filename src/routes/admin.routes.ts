import { Router } from 'express';
import {
    getStats,
    getUsers,
    updateUser,
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    getSecurityAlerts,
    getContactRequests,
    updateContactRequestStatus,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/inventory', getInventory);
router.post('/inventory', createInventoryItem);
router.put('/inventory/:id', updateInventoryItem);
router.delete('/inventory/:id', deleteInventoryItem);
router.put('/inventory/:id/adjust-stock', adjustStock);
router.get('/security-alerts', getSecurityAlerts);
router.get('/contact-requests', getContactRequests);
router.put('/contact-requests/:id', updateContactRequestStatus);

export default router;
