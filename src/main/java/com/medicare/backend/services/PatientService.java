package com.medicare.backend.services;

import com.medicare.backend.dto.AppointmentBookingRequest;
import com.medicare.backend.models.*;
import com.medicare.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public Patient getProfileByUserId(String userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
    }

    public List<Appointment> getAppointments(String userId) {
        Patient patient = getProfileByUserId(userId);
        return appointmentRepository.findByPatientId(patient.getId());
    }

    public Appointment bookAppointment(String userId, AppointmentBookingRequest request) {
        Patient patient = getProfileByUserId(userId);
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if ("offline".equals(doctor.getStatus())) {
            throw new RuntimeException("This specialist is currently offline and not accepting bookings.");
        }

        Appointment appointment = new Appointment();
        appointment.setAppointmentId("APT-" + System.currentTimeMillis());
        appointment.setDoctorId(doctor.getId());
        appointment.setPatientId(patient.getId());
        appointment.setDate(new Date(Long.parseLong(request.getDate())));
        appointment.setSlot(request.getSlot());
        appointment.setStatus("upcoming");

        return appointmentRepository.save(appointment);
    }

    public void cancelAppointment(String appointmentId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Appointment.PendingChange change = new Appointment.PendingChange();
        change.setType("cancel");
        change.setReason(reason);
        change.setRequestDate(new Date());

        appointment.setPendingChange(change);
        appointmentRepository.save(appointment);

        // Notify doctor
        Notification notification = new Notification();
        notification.setUserId(appointment.getDoctorId());
        notification.setMessage("Patient requested to cancel appointment. Reason: " + reason);
        notificationRepository.save(notification);
    }

    public List<MedicalRecord> getMedicalRecords(String userId) {
        Patient patient = getProfileByUserId(userId);
        return medicalRecordRepository.findByPatientIdOrderByDateDesc(patient.getId());
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
}
