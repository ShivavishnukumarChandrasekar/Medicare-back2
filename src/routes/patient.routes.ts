import { Router } from 'express';
import {
    getProfile,
    getAppointments,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    getMedicalRecords,
    uploadMedicalRecord,
    getNotifications,
    markNotificationRead,
    getDoctors,
    submitContactRequest,
} from '../controllers/patient.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { upload } from '../services/file.service';

const router = Router();

// All routes require authentication and patient role
router.use(authenticate);
router.use(authorize('patient'));

router.get('/profile', getProfile);
router.get('/appointments', getAppointments);
router.post('/appointments', bookAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);
router.put('/appointments/:id/reschedule', rescheduleAppointment);
router.get('/medical-records', getMedicalRecords);
router.post('/medical-records', upload.single('file'), uploadMedicalRecord);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/doctors', getDoctors);
router.post('/contact-request', submitContactRequest);

export default router;
