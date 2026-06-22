import { Router } from 'express';
import {
    registerWalkIn,
    getQueue,
    getStats,
    generateInvoice,
    saveInvoice,
} from '../controllers/reception.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication and reception role
router.use(authenticate);
router.use(authorize('reception'));

router.post('/walk-in', registerWalkIn);
router.get('/queue', getQueue);
router.get('/stats', getStats);
router.get('/invoice/:appointmentId', generateInvoice);
router.post('/invoice', saveInvoice);

export default router;
