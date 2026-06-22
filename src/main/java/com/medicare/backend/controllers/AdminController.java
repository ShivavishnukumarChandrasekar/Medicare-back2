package com.medicare.backend.controllers;

import com.medicare.backend.dto.AdminStats;
import com.medicare.backend.dto.ApiResponse;
import com.medicare.backend.dto.InventoryUpdate;
import com.medicare.backend.models.*;
import com.medicare.backend.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStats>> getStats() {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.getStats()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsers() {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable String id, @RequestBody User updates) {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.updateUser(id, updates)));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<Inventory>>> getInventory() {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.getInventory()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/inventory")
    public ResponseEntity<ApiResponse<Inventory>> createInventoryItem(@RequestBody Inventory item) {
        try {
            return ResponseEntity.status(201).body(ApiResponse.success(adminService.createInventoryItem(item)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<ApiResponse<Inventory>> updateInventoryItem(@PathVariable String id,
            @RequestBody Inventory updates) {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.updateInventoryItem(id, updates)));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<ApiResponse<String>> deleteInventoryItem(@PathVariable String id) {
        try {
            adminService.deleteInventoryItem(id);
            return ResponseEntity.ok(ApiResponse.success("Item deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/inventory/adjust-stock/{id}")
    public ResponseEntity<ApiResponse<String>> adjustStock(@PathVariable String id,
            @RequestBody InventoryUpdate request) {
        try {
            adminService.adjustStock(id, request.getDelta());
            return ResponseEntity.ok(ApiResponse.success("Stock adjusted"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/security-alerts")
    public ResponseEntity<ApiResponse<List<SecurityAlert>>> getSecurityAlerts() {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.getSecurityAlerts()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/contact-requests")
    public ResponseEntity<ApiResponse<List<ContactRequest>>> getContactRequests() {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.getContactRequests()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }
}
