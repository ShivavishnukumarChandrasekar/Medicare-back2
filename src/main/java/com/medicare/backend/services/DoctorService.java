package com.medicare.backend.services;

import com.medicare.backend.dto.ConsultationUpdateRequest;
import com.medicare.backend.models.*;
import com.medicare.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public Doctor getDoctorByUserId(String userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
    }

    public List<Appointment> getUpcomingAppointments(String userId) {
        Doctor doctor = getDoctorByUserId(userId);
        return appointmentRepository.findByDoctorIdAndStatus(doctor.getId(), "upcoming");
    }

    public void updateConsultation(String appointmentId, ConsultationUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Update appointment
        Appointment.Diagnosis diagnosis = new Appointment.Diagnosis();
        diagnosis.setNotes(request.getDiagnosis().getNotes());
        diagnosis.setMedicines(request.getDiagnosis().getMedicines());
        appointment.setDiagnosis(diagnosis);

        if (request.getLabTests() != null) {
            List<Appointment.LabTest> labTests = request.getLabTests().stream().map(test -> {
                Appointment.LabTest lt = new Appointment.LabTest();
                lt.setTestName(test);
                lt.setStatus("requested");
                lt.setDate(new Date());
                return lt;
            }).collect(Collectors.toList());
            appointment.setLabTests(labTests);
        }

        appointment.setStatus("completed");
        appointmentRepository.save(appointment);

        // Create medical record
        Doctor doctor = doctorRepository.findById(appointment.getDoctorId()).orElse(null);
        MedicalRecord record = new MedicalRecord();
        record.setRecordId("REC-" + System.currentTimeMillis());
        record.setPatientId(appointment.getPatientId());
        record.setType("Medical Follow Up");
        record.setTitle("Consultation Report - Dr. " + (doctor != null ? doctor.getName() : "Unknown"));
        record.setDate(new Date());
        record.setFileUrl("#");

        MedicalRecord.RecordDetails details = new MedicalRecord.RecordDetails();
        details.setNotes(request.getDiagnosis().getNotes());
        details.setMedicines(request.getDiagnosis().getMedicines());
        details.setLabTests(request.getLabTests());
        details.setDoctorName(doctor != null ? doctor.getName() : "Unknown");
        record.setDetails(details);

        medicalRecordRepository.save(record);
    }

    public void approveChange(String appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Appointment.PendingChange change = appointment.getPendingChange();
        if (change == null)
            throw new RuntimeException("No pending change found");

        if ("cancel".equals(change.getType())) {
            appointment.setStatus("cancelled");
        } else if ("reschedule".equals(change.getType())) {
            appointment.setDate(change.getNewDate());
            appointment.setSlot(change.getNewSlot());
            appointment.setStatus("upcoming");
        }

        appointment.setPendingChange(null);
        appointmentRepository.save(appointment);

        Notification notification = new Notification();
        notification.setUserId(appointment.getPatientId());
        notification.setMessage("Your request to " + change.getType() + " appointment was Approved.");
        notificationRepository.save(notification);
    }

    public void denyChange(String appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Appointment.PendingChange change = appointment.getPendingChange();
        if (change == null)
            throw new RuntimeException("No pending change found");

        appointment.setPendingChange(null);
        appointmentRepository.save(appointment);

        Notification notification = new Notification();
        notification.setUserId(appointment.getPatientId());
        notification.setMessage("Your request to " + change.getType() + " appointment was Denied.");
        notificationRepository.save(notification);
    }

    public List<Patient> searchPatients(String query) {
        return patientRepository.findByNameRegexOrPatientIdRegex(query, query);
    }

    public List<MedicalRecord> getPatientHistory(String patientId) {
        return medicalRecordRepository.findByPatientIdOrderByDateDesc(patientId);
    }

    public void updateStatus(String userId, String status) {
        Doctor doctor = getDoctorByUserId(userId);
        doctor.setStatus(status);
        doctorRepository.save(doctor);
    }

    public void updateSlots(String userId, List<String> slots) {
        Doctor doctor = getDoctorByUserId(userId);
        doctor.setAvailableSlots(slots);
        doctorRepository.save(doctor);
    }
}
