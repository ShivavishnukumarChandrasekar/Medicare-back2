package com.medicare.backend.controllers;

import com.medicare.backend.dto.*;
import com.medicare.backend.models.Appointment;
import com.medicare.backend.models.MedicalRecord;
import com.medicare.backend.models.Patient;
import com.medicare.backend.repositories.UserRepository;
import com.medicare.backend.services.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private UserRepository userRepository;

    private String getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<Appointment>>> getAppointments() {
        try {
            return ResponseEntity.ok(ApiResponse.success(doctorService.getUpcomingAppointments(getCurrentUserId())));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/update-consultation/{id}")
    public ResponseEntity<ApiResponse<String>> updateConsultation(@PathVariable String id,
            @RequestBody ConsultationUpdateRequest request) {
        try {
            doctorService.updateConsultation(id, request);
            return ResponseEntity.ok(ApiResponse.success("Consultation updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/approve-change/{id}")
    public ResponseEntity<ApiResponse<String>> approveChange(@PathVariable String id) {
        try {
            doctorService.approveChange(id);
            return ResponseEntity.ok(ApiResponse.success("Change approved"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/deny-change/{id}")
    public ResponseEntity<ApiResponse<String>> denyChange(@PathVariable String id) {
        try {
            doctorService.denyChange(id);
            return ResponseEntity.ok(ApiResponse.success("Change denied"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/search-patients")
    public ResponseEntity<ApiResponse<List<Patient>>> searchPatients(@RequestParam String query) {
        try {
            return ResponseEntity.ok(ApiResponse.success(doctorService.searchPatients(query)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/patient-history/{id}")
    public ResponseEntity<ApiResponse<List<MedicalRecord>>> getPatientHistory(@PathVariable String id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(doctorService.getPatientHistory(id)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/update-status")
    public ResponseEntity<ApiResponse<String>> updateStatus(@RequestBody DoctorStatusUpdate request) {
        try {
            doctorService.updateStatus(getCurrentUserId(), request.getStatus());
            return ResponseEntity.ok(ApiResponse.success("Status updated"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/update-slots")
    public ResponseEntity<ApiResponse<String>> updateSlots(@RequestBody DoctorSlotsUpdate request) {
        try {
            doctorService.updateSlots(getCurrentUserId(), request.getSlots());
            return ResponseEntity.ok(ApiResponse.success("Slots updated"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }
}
