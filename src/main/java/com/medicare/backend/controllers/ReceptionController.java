package com.medicare.backend.controllers;

import com.medicare.backend.dto.ApiResponse;
import com.medicare.backend.dto.WalkInRequest;
import com.medicare.backend.dto.WalkInResponse;
import com.medicare.backend.models.Appointment;
import com.medicare.backend.models.Invoice;
import com.medicare.backend.services.ReceptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reception")
public class ReceptionController {

    @Autowired
    private ReceptionService receptionService;

    @PostMapping("/register-walk-in")
    public ResponseEntity<ApiResponse<WalkInResponse>> registerWalkIn(@RequestBody WalkInRequest request) {
        try {
            return ResponseEntity.status(201).body(ApiResponse.success(receptionService.registerWalkIn(request)));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/queue")
    public ResponseEntity<ApiResponse<List<Appointment>>> getQueue() {
        try {
            return ResponseEntity.ok(ApiResponse.success(receptionService.getQueue()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        try {
            return ResponseEntity.ok(ApiResponse.success(receptionService.getStats()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/generate-invoice/{appointmentId}")
    public ResponseEntity<ApiResponse<Invoice>> generateInvoice(@PathVariable String appointmentId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(receptionService.generateInvoice(appointmentId)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/save-invoice")
    public ResponseEntity<ApiResponse<Invoice>> saveInvoice(@RequestBody Invoice invoice) {
        try {
            return ResponseEntity.status(201).body(ApiResponse.success(receptionService.saveInvoice(invoice)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }
}
