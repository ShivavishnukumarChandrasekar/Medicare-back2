import { Router } from 'express';
import {
    getAppointments,
    getAppointmentById,
    updateConsultation,
    approveAppointmentChange,
    denyAppointmentChange,
    searchPatients,
    getPatientHistory,
    updatePatientName,
    getNotifications,
    updateDoctorStatus,
    updateDoctorSlots,
} from '../controllers/doctor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication and doctor role
router.use(authenticate);
router.use(authorize('doctor'));

router.get('/appointments', getAppointments);
router.get('/appointments/:id', getAppointmentById);
router.put('/appointments/:id/consultation', updateConsultation);
router.put('/appointments/:id/approve-change', approveAppointmentChange);
router.put('/appointments/:id/deny-change', denyAppointmentChange);
router.get('/patients/search', searchPatients);
router.get('/patients/:id/history', getPatientHistory);
router.put('/patients/:id/name', updatePatientName);
router.get('/notifications', getNotifications);
router.put('/status', updateDoctorStatus);
router.put('/slots', updateDoctorSlots);

export default router;
