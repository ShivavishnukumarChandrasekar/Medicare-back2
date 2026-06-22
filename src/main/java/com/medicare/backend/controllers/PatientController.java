package com.medicare.backend.controllers;

import com.medicare.backend.dto.ApiResponse;
import com.medicare.backend.dto.AppointmentBookingRequest;
import com.medicare.backend.models.Appointment;
import com.medicare.backend.models.Doctor;
import com.medicare.backend.models.MedicalRecord;
import com.medicare.backend.models.Patient;
import com.medicare.backend.models.User;
import com.medicare.backend.repositories.UserRepository;
import com.medicare.backend.services.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private UserRepository userRepository;

    private String getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).get().getId();
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Patient>> getProfile() {
        try {
            return ResponseEntity.ok(ApiResponse.success(patientService.getProfileByUserId(getCurrentUserId())));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<Appointment>>> getAppointments() {
        try {
            return ResponseEntity.ok(ApiResponse.success(patientService.getAppointments(getCurrentUserId())));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/book-appointment")
    public ResponseEntity<ApiResponse<Appointment>> bookAppointment(@RequestBody AppointmentBookingRequest request) {
        try {
            return ResponseEntity.status(201).body(ApiResponse.success(patientService.bookAppointment(getCurrentUserId(), request)));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/cancel-appointment/{id}")
    public ResponseEntity<ApiResponse<String>> cancelAppointment(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            patientService.cancelAppointment(id, body.get("reason"));
            return ResponseEntity.ok(ApiResponse.success("Cancellation request submitted"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/medical-records")
    public ResponseEntity<ApiResponse<List<MedicalRecord>>> getMedicalRecords() {
        try {
            return ResponseEntity.ok(ApiResponse.success(patientService.getMedicalRecords(getCurrentUserId())));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<Doctor>>> getDoctors() {
        try {
            return ResponseEntity.ok(ApiResponse.success(patientService.getAllDoctors()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }
}
